import models from '../models/index.js';
import { Op } from 'sequelize';
import {
    extractClientIp,
    extractUserAgent,
    getWorkingDate,
    calculateShiftMetrics,
} from '../utils/attendance-helper.js';
import attendanceAuditRepository from './attendance-audit-repository.js';

const { Attendance, Employee, Shift, Location, Department, Designation, Branch, User, sequelize } = models;

const includeAssociations = [
    {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'employeeCode', 'firstName', 'lastName', 'email', 'departmentId', 'designationId', 'branchId', 'locationId', 'shiftId', 'managerId'],
        include: [
            { model: Department, as: 'department', attributes: ['id', 'name'] },
            { model: Designation, as: 'designation', attributes: ['id', 'name'] },
            { model: Branch, as: 'branch', attributes: ['id', 'name'] },
        ],
    },
    { model: Shift, as: 'shift', attributes: ['id', 'name', 'code', 'startTime', 'endTime', 'workingHours', 'breakDuration', 'isOvernight'] },
    { model: Location, as: 'location', attributes: ['id', 'name', 'code', 'latitude', 'longitude', 'radiusInMeters'] },
    { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] },
    { model: User, as: 'corrector', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] },
];

/**
 * Determine a safe attendance source, disallowing spoofed sources
 */
function sanitizeSource(req) {
    const rawSource = (req.headers && req.headers['x-source']) || (req.body && req.body.source);
    if (['web', 'mobile'].includes(rawSource)) {
        return rawSource;
    }
    return 'web';
}

export default {
    /**
     * Employee Check-In (Authoritative server timestamp & concurrency protection)
     */
    async checkIn(req) {
        const transaction = await sequelize.transaction();
        let calculatedWorkingDate = null;
        try {
            const employee = req.employee;
            const now = new Date();
            const ip = extractClientIp(req);
            const userAgent = extractUserAgent(req);
            const source = sanitizeSource(req);

            // Resolve shift
            let shift = employee.shift;
            if (!shift && employee.shiftId) {
                shift = await Shift.findByPk(employee.shiftId, { transaction });
            }
            if (!shift) {
                shift = await Shift.findOne({ where: { status: 'active' }, transaction });
            }

            // Determine authoritative working date
            const workingDate = getWorkingDate(now, shift);
            calculatedWorkingDate = workingDate;

            // Check if already checked in or attendance exists for this working date
            const existingAttendance = await Attendance.findOne({
                where: {
                    employeeId: employee.id,
                    date: workingDate,
                    statusRecord: { [Op.ne]: 'deleted' },
                },
                transaction,
            });

            if (existingAttendance) {
                const error = new Error(`Already checked in for working date: ${workingDate}`);
                error.statusCode = 409;
                throw error;
            }

            // Check if there is an unclosed session from another day
            const openPreviousSession = await Attendance.findOne({
                where: {
                    employeeId: employee.id,
                    checkIn: { [Op.ne]: null },
                    checkOut: null,
                    statusRecord: { [Op.ne]: 'deleted' },
                },
                transaction,
            });

            if (openPreviousSession) {
                const error = new Error(`You have an active open attendance session from date ${openPreviousSession.date}. Please check out first.`);
                error.statusCode = 409;
                throw error;
            }

            // Calculate shift metrics (late check-in calculation)
            const metrics = calculateShiftMetrics({
                checkIn: now,
                checkOut: null,
                shift,
                workingDate,
            });

            const { latitude, longitude, remarks } = req.body || {};

            const attendance = await Attendance.create(
                {
                    employeeId: employee.id,
                    date: workingDate,
                    checkIn: now,
                    checkOut: null,
                    status: metrics.status,
                    workDuration: 0,
                    lateMinutes: metrics.lateMinutes,
                    earlyLeaveMinutes: 0,
                    overtimeMinutes: 0,
                    checkInIp: ip,
                    checkInUserAgent: userAgent,
                    checkInLatitude: latitude ? parseFloat(latitude) : null,
                    checkInLongitude: longitude ? parseFloat(longitude) : null,
                    checkInSource: source,
                    shiftId: shift?.id || null,
                    locationId: employee.locationId || null,
                    remarks: remarks || null,
                    statusRecord: 'active',
                },
                { transaction },
            );

            // Create Audit log
            await attendanceAuditRepository.log({
                attendanceId: attendance.id,
                employeeId: employee.id,
                userId: req.user.id,
                action: 'CHECK_IN',
                ipAddress: ip,
                userAgent,
                afterValues: attendance.toJSON(),
                details: {
                    workingDate,
                    isInsideGeofence: req.isInsideGeofence,
                    geofenceDistance: req.geofenceDistance,
                    geofenceWarning: req.geofenceWarning,
                },
                transaction,
            });

            await transaction.commit();

            return await Attendance.findByPk(attendance.id, { include: includeAssociations });
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }

            // Handle DB-level race conditions / unique constraint / deadlocks on concurrent double-punch
            if (
                error.name === 'SequelizeUniqueConstraintError' ||
                error.original?.code === 'ER_DUP_ENTRY' ||
                error.original?.code === 'ER_LOCK_DEADLOCK'
            ) {
                const dupError = new Error(`Already checked in for working date: ${calculatedWorkingDate || 'today'}`);
                dupError.statusCode = 409;
                throw dupError;
            }

            console.error('AttendanceRepository.checkIn error:', error);
            throw error;
        }
    },

    /**
     * Employee Check-Out (Authoritative server timestamp & metrics calculation)
     */
    async checkOut(req) {
        const transaction = await sequelize.transaction();
        try {
            const employee = req.employee;
            const now = new Date();
            const ip = extractClientIp(req);
            const userAgent = extractUserAgent(req);
            const source = sanitizeSource(req);

            // Find active unclosed attendance record
            const attendance = await Attendance.findOne({
                where: {
                    employeeId: employee.id,
                    checkIn: { [Op.ne]: null },
                    checkOut: null,
                    statusRecord: { [Op.ne]: 'deleted' },
                },
                order: [['id', 'DESC']],
                transaction,
            });

            if (!attendance) {
                const error = new Error('No active check-in found to check out');
                error.statusCode = 400;
                throw error;
            }

            if (attendance.checkOut) {
                const error = new Error('Attendance is already checked out');
                error.statusCode = 400;
                throw error;
            }

            // Ensure checkout time is not before check-in time
            if (now < new Date(attendance.checkIn)) {
                const error = new Error('Checkout timestamp cannot be before check-in timestamp');
                error.statusCode = 400;
                throw error;
            }

            // Resolve shift
            let shift = null;
            if (attendance.shiftId) {
                shift = await Shift.findByPk(attendance.shiftId, { transaction });
            } else if (employee.shiftId) {
                shift = await Shift.findByPk(employee.shiftId, { transaction });
            }

            // Calculate shift metrics (durations, early leave, overtime)
            const metrics = calculateShiftMetrics({
                checkIn: attendance.checkIn,
                checkOut: now,
                shift,
                workingDate: attendance.date,
            });

            const { latitude, longitude, remarks } = req.body || {};

            const beforeValues = attendance.toJSON();

            const updatedRemarks = remarks
                ? (attendance.remarks ? `${attendance.remarks} | ${remarks}` : remarks)
                : attendance.remarks;

            await attendance.update(
                {
                    checkOut: now,
                    workDuration: metrics.workDuration,
                    lateMinutes: metrics.lateMinutes,
                    earlyLeaveMinutes: metrics.earlyLeaveMinutes,
                    overtimeMinutes: metrics.overtimeMinutes,
                    status: metrics.status,
                    checkOutIp: ip,
                    checkOutUserAgent: userAgent,
                    checkOutLatitude: latitude ? parseFloat(latitude) : null,
                    checkOutLongitude: longitude ? parseFloat(longitude) : null,
                    checkOutSource: source,
                    remarks: updatedRemarks,
                },
                { transaction },
            );

            // Detect IP change signal
            const ipChanged = attendance.checkInIp && attendance.checkInIp !== ip;

            // Log Audit trail
            await attendanceAuditRepository.log({
                attendanceId: attendance.id,
                employeeId: employee.id,
                userId: req.user.id,
                action: 'CHECK_OUT',
                ipAddress: ip,
                userAgent,
                beforeValues,
                afterValues: attendance.toJSON(),
                details: {
                    ipChanged,
                    checkInIp: attendance.checkInIp,
                    checkOutIp: ip,
                    workDurationMinutes: metrics.workDuration,
                },
                transaction,
            });

            await transaction.commit();

            return await Attendance.findByPk(attendance.id, { include: includeAssociations });
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.error('AttendanceRepository.checkOut error:', error);
            throw error;
        }
    },

    /**
     * Get Attendance by ID
     */
    async getAttendanceById(id) {
        try {
            const attendance = await Attendance.findByPk(id, {
                include: includeAssociations,
            });
            return attendance;
        } catch (error) {
            console.error('AttendanceRepository.getAttendanceById error:', error);
            throw error;
        }
    },

    /**
     * Find one attendance record matching criteria
     */
    async findOne(where) {
        try {
            return await Attendance.findOne({
                where,
                include: includeAssociations,
            });
        } catch (error) {
            console.error('AttendanceRepository.findOne error:', error);
            throw error;
        }
    },

    /**
     * Get paginated attendance list with role scoping, filtering, and search
     */
    async getAllAttendance(req) {
        try {
            const {
                limit = 10,
                page = 1,
                offset,
                search,
                q,
                sortBy = 'date',
                sortType,
                sortOrder,
                order,
                status,
                employeeId,
                departmentId,
                designationId,
                branchId,
                locationId,
                shiftId,
                date,
                fromDate,
                toDate,
                filters: rawFilters,
            } = req.query || {};

            let filters = {};
            if (typeof rawFilters === 'object' && rawFilters !== null) {
                filters = { ...rawFilters };
            } else if (typeof rawFilters === 'string') {
                try {
                    filters = JSON.parse(rawFilters);
                } catch (e) {
                    filters = {};
                }
            }

            if (req.query) {
                Object.keys(req.query).forEach((key) => {
                    const match = key.match(/^filters\[([^\]]+)\]$/);
                    if (match && match[1]) {
                        filters[match[1]] = req.query[key];
                    }
                });
            }

            const where = {};
            const employeeWhere = {};

            // Exclude soft-deleted by default unless requested
            where.statusRecord = { [Op.ne]: 'deleted' };

            // Role Scoping
            const userRole = req.userRole;
            let callingEmployee = req.employee;

            if (userRole === 'employee') {
                if (!callingEmployee && req.user?.id) {
                    callingEmployee = await Employee.findOne({ where: { userId: req.user.id } });
                }
                where.employeeId = callingEmployee ? callingEmployee.id : -1;
            } else if (userRole === 'manager') {
                if (!callingEmployee && req.user?.id) {
                    callingEmployee = await Employee.findOne({ where: { userId: req.user.id } });
                }
                if (callingEmployee) {
                    const team = await Employee.findAll({
                        where: { managerId: callingEmployee.id },
                        attributes: ['id'],
                    });
                    const allowedIds = [callingEmployee.id, ...team.map((t) => t.id)];

                    const requestedEmpId = parseInt(employeeId || filters.employeeId, 10);
                    if (requestedEmpId) {
                        if (allowedIds.includes(requestedEmpId)) {
                            where.employeeId = requestedEmpId;
                        } else {
                            where.employeeId = -1; // Unauthorized filter -> returns empty
                        }
                    } else {
                        where.employeeId = { [Op.in]: allowedIds };
                    }
                }
            } else {
                // Admin / HR Manager
                const targetEmpId = employeeId || filters.employeeId;
                if (targetEmpId) {
                    where.employeeId = parseInt(targetEmpId, 10);
                }
            }

            // Status filter
            const statusVal = (filters.status !== undefined ? filters.status : status)?.toString().trim();
            if (statusVal && statusVal !== 'all') {
                where.status = statusVal;
            }

            // Shift / Location filters on attendance
            if (shiftId || filters.shiftId) {
                where.shiftId = parseInt(shiftId || filters.shiftId, 10);
            }
            if (locationId || filters.locationId) {
                where.locationId = parseInt(locationId || filters.locationId, 10);
            }

            // Department / Designation / Branch filters on Employee
            if (departmentId || filters.departmentId) {
                employeeWhere.departmentId = parseInt(departmentId || filters.departmentId, 10);
            }
            if (designationId || filters.designationId) {
                employeeWhere.designationId = parseInt(designationId || filters.designationId, 10);
            }
            if (branchId || filters.branchId) {
                employeeWhere.branchId = parseInt(branchId || filters.branchId, 10);
            }

            // Exact date filter
            const exactDate = date || filters.date;
            if (exactDate) {
                where.date = exactDate;
            }

            // Date Range
            const fDate = fromDate || filters.fromDate;
            const tDate = toDate || filters.toDate;
            if (fDate && tDate) {
                where.date = { [Op.between]: [fDate, tDate] };
            } else if (fDate) {
                where.date = { [Op.gte]: fDate };
            } else if (tDate) {
                where.date = { [Op.lte]: tDate };
            }

            // Search term across Employee fields
            const searchTerm = (search || q || filters.search || filters.q)?.toString().trim();
            if (searchTerm) {
                employeeWhere[Op.or] = [
                    { firstName: { [Op.like]: `%${searchTerm}%` } },
                    { lastName: { [Op.like]: `%${searchTerm}%` } },
                    { employeeCode: { [Op.like]: `%${searchTerm}%` } },
                    { email: { [Op.like]: `%${searchTerm}%` } },
                ];
            }

            // Allowed sorting fields
            const allowedSortFields = ['id', 'date', 'checkIn', 'checkOut', 'status', 'workDuration', 'lateMinutes', 'earlyLeaveMinutes', 'overtimeMinutes', 'createdAt'];
            const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
            const direction = String(sortType || sortOrder || order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
            const safePage = Math.max(parseInt(page, 10) || 1, 1);
            let safeOffset = (safePage - 1) * safeLimit;
            if (offset !== undefined && offset !== null && offset !== '') {
                safeOffset = Math.max(parseInt(offset, 10) || 0, 0);
            }

            const { count, rows } = await Attendance.findAndCountAll({
                where,
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        where: Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
                        attributes: ['id', 'employeeCode', 'firstName', 'lastName', 'email', 'departmentId', 'designationId', 'branchId', 'locationId', 'shiftId'],
                        include: [
                            { model: Department, as: 'department', attributes: ['id', 'name'] },
                            { model: Designation, as: 'designation', attributes: ['id', 'name'] },
                            { model: Branch, as: 'branch', attributes: ['id', 'name'] },
                        ],
                    },
                    { model: Shift, as: 'shift', attributes: ['id', 'name', 'code', 'startTime', 'endTime', 'workingHours'] },
                    { model: Location, as: 'location', attributes: ['id', 'name', 'code'] },
                ],
                order: [[sortField, direction]],
                limit: safeLimit,
                offset: safeOffset,
                distinct: true,
            });

            return {
                attendances: rows,
                pagination: {
                    page: Math.floor(safeOffset / safeLimit) + 1,
                    limit: safeLimit,
                    totalItems: count,
                    totalPages: Math.ceil(count / safeLimit),
                },
            };
        } catch (error) {
            console.error('AttendanceRepository.getAllAttendance error:', error);
            throw error;
        }
    },

    /**
     * Get summary stats for attendance
     */
    async getAttendanceStats(req) {
        try {
            const { date, fromDate, toDate } = req.query || {};
            const where = { statusRecord: { [Op.ne]: 'deleted' } };

            const userRole = req.userRole;
            let callingEmployee = req.employee;

            if (userRole === 'employee') {
                if (!callingEmployee && req.user?.id) {
                    callingEmployee = await Employee.findOne({ where: { userId: req.user.id } });
                }
                where.employeeId = callingEmployee ? callingEmployee.id : -1;
            } else if (userRole === 'manager') {
                if (!callingEmployee && req.user?.id) {
                    callingEmployee = await Employee.findOne({ where: { userId: req.user.id } });
                }
                if (callingEmployee) {
                    const team = await Employee.findAll({ where: { managerId: callingEmployee.id }, attributes: ['id'] });
                    where.employeeId = { [Op.in]: [callingEmployee.id, ...team.map((t) => t.id)] };
                }
            }

            const targetDate = date || fromDate;
            if (targetDate && toDate) {
                where.date = { [Op.between]: [targetDate, toDate] };
            } else if (targetDate) {
                where.date = targetDate;
            }

            const [total, present, late, halfDay, absent, leave, holiday, weekOff] = await Promise.all([
                Attendance.count({ where }),
                Attendance.count({ where: { ...where, status: 'present' } }),
                Attendance.count({ where: { ...where, status: 'late' } }),
                Attendance.count({ where: { ...where, status: 'half_day' } }),
                Attendance.count({ where: { ...where, status: 'absent' } }),
                Attendance.count({ where: { ...where, status: 'leave' } }),
                Attendance.count({ where: { ...where, status: 'holiday' } }),
                Attendance.count({ where: { ...where, status: 'week_off' } }),
            ]);

            return {
                total,
                present,
                late,
                halfDay,
                absent,
                leave,
                holiday,
                weekOff,
            };
        } catch (error) {
            console.error('AttendanceRepository.getAttendanceStats error:', error);
            throw error;
        }
    },

    /**
     * HR / Admin Attendance Correction
     */
    async correctAttendance(req) {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { checkIn, checkOut, status, remarks, correctionReason, date } = req.body;

            const attendance = await Attendance.findByPk(id, {
                transaction,
            });

            if (!attendance) {
                await transaction.rollback();
                return null;
            }

            const beforeValues = attendance.toJSON();

            const updateData = {
                isCorrected: true,
                correctionReason,
                correctedBy: req.user.id,
            };

            if (date) updateData.date = date;
            if (checkIn !== undefined) updateData.checkIn = checkIn ? new Date(checkIn) : null;
            if (checkOut !== undefined) updateData.checkOut = checkOut ? new Date(checkOut) : null;
            if (remarks !== undefined) updateData.remarks = remarks;

            // Recalculate metrics if times are changed
            const finalCheckIn = updateData.checkIn !== undefined ? updateData.checkIn : attendance.checkIn;
            const finalCheckOut = updateData.checkOut !== undefined ? updateData.checkOut : attendance.checkOut;
            const finalDate = updateData.date || attendance.date;

            const shift = attendance.shiftId ? await Shift.findByPk(attendance.shiftId, { transaction }) : null;

            if (finalCheckIn || finalCheckOut) {
                const metrics = calculateShiftMetrics({
                    checkIn: finalCheckIn,
                    checkOut: finalCheckOut,
                    shift,
                    workingDate: finalDate,
                });

                updateData.workDuration = metrics.workDuration;
                updateData.lateMinutes = metrics.lateMinutes;
                updateData.earlyLeaveMinutes = metrics.earlyLeaveMinutes;
                updateData.overtimeMinutes = metrics.overtimeMinutes;
                updateData.status = status || metrics.status;
            } else if (status) {
                updateData.status = status;
            }

            await attendance.update(updateData, { transaction });

            // Create Audit Log
            await attendanceAuditRepository.log({
                attendanceId: attendance.id,
                employeeId: attendance.employeeId,
                userId: req.user.id,
                action: 'CORRECTION',
                ipAddress: extractClientIp(req),
                userAgent: extractUserAgent(req),
                beforeValues,
                afterValues: attendance.toJSON(),
                reason: correctionReason,
                transaction,
            });

            await transaction.commit();

            return await Attendance.findByPk(id, { include: includeAssociations });
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.error('AttendanceRepository.correctAttendance error:', error);
            throw error;
        }
    },

    /**
     * Soft Delete Attendance
     */
    async deleteAttendance(req) {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const attendance = await Attendance.findByPk(id, { transaction });

            if (!attendance) {
                await transaction.rollback();
                return null;
            }

            const beforeValues = attendance.toJSON();

            await attendance.update(
                {
                    statusRecord: 'deleted',
                    deletedAt: new Date(),
                },
                { transaction },
            );

            await attendanceAuditRepository.log({
                attendanceId: attendance.id,
                employeeId: attendance.employeeId,
                userId: req.user.id,
                action: 'DELETE',
                ipAddress: extractClientIp(req),
                userAgent: extractUserAgent(req),
                beforeValues,
                afterValues: attendance.toJSON(),
                reason: req.body?.reason || 'Soft deleted by administrator',
                transaction,
            });

            await transaction.commit();
            return true;
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.error('AttendanceRepository.deleteAttendance error:', error);
            throw error;
        }
    },

    /**
     * Restore Soft-Deleted Attendance
     */
    async restoreAttendance(req) {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const attendance = await Attendance.findByPk(id, { paranoid: false, transaction });

            if (!attendance) {
                await transaction.rollback();
                return null;
            }

            const beforeValues = attendance.toJSON();

            await attendance.update(
                {
                    statusRecord: 'active',
                    deletedAt: null,
                },
                { transaction },
            );

            await attendanceAuditRepository.log({
                attendanceId: attendance.id,
                employeeId: attendance.employeeId,
                userId: req.user.id,
                action: 'RESTORE',
                ipAddress: extractClientIp(req),
                userAgent: extractUserAgent(req),
                beforeValues,
                afterValues: attendance.toJSON(),
                reason: req.body?.reason || 'Restored by administrator',
                transaction,
            });

            await transaction.commit();
            return await Attendance.findByPk(id, { include: includeAssociations });
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.error('AttendanceRepository.restoreAttendance error:', error);
            throw error;
        }
    },
};
