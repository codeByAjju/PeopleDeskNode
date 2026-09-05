import httpStatus from 'http-status';
import models from '../models/index.js';
import attendancePolicyRepository from '../repositories/attendance-policy-repository.js';
import {
    isValidCoordinates,
    calculateDistanceInMeters,
    getWorkingDate,
} from '../utils/attendance-helper.js';

const { Employee, Shift, Location, Attendance } = models;

export default {
    /**
     * Resolve the active employee record belonging to the authenticated user.
     * Prevents client from supplying an unauthorized employeeId.
     */
    async resolveAuthenticatedEmployee(req, res, next) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(httpStatus.UNAUTHORIZED).json({
                    status: false,
                    message: 'Authentication required',
                });
            }

            const employee = await Employee.findOne({
                where: { userId: req.user.id },
                include: [
                    { model: Shift, as: 'shift' },
                    { model: Location, as: 'location' },
                ],
            });

            if (!employee) {
                return res.status(httpStatus.NOT_FOUND).json({
                    status: false,
                    message: 'Employee profile not found for authenticated user',
                });
            }

            if (employee.employmentStatus !== 'active') {
                return res.status(httpStatus.FORBIDDEN).json({
                    status: false,
                    message: `Employee account is ${employee.employmentStatus}. Attendance operations are not permitted.`,
                });
            }

            req.employee = employee;
            return next();
        } catch (error) {
            console.error('resolveAuthenticatedEmployee error:', error);
            return next(error);
        }
    },

    /**
     * Check if attendance record exists by ID in params
     */
    async checkAttendanceIdExist(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    status: false,
                    message: 'Attendance ID is required',
                });
            }

            const attendance = await Attendance.findOne({
                where: { id },
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeCode', 'firstName', 'lastName', 'email', 'managerId'],
                    },
                    { model: Shift, as: 'shift' },
                    { model: Location, as: 'location' },
                ],
            });

            if (!attendance) {
                return res.status(httpStatus.NOT_FOUND).json({
                    status: false,
                    message: 'Attendance record not found',
                });
            }

            req.attendanceRecord = attendance;
            return next();
        } catch (error) {
            console.error('checkAttendanceIdExist error:', error);
            return next(error);
        }
    },

    /**
     * Check role-based access for viewing a specific employee's attendance
     */
    async checkEmployeeAttendanceAccess(req, res, next) {
        try {
            const targetEmployeeId = parseInt(req.params.employeeId, 10);
            const userRole = req.userRole;

            if (['super_admin', 'admin', 'hr_manager'].includes(userRole)) {
                return next();
            }

            // Resolve calling user's employee profile if not already attached
            let callingEmployee = req.employee;
            if (!callingEmployee && req.user?.id) {
                callingEmployee = await Employee.findOne({ where: { userId: req.user.id } });
                req.employee = callingEmployee;
            }

            if (!callingEmployee) {
                return res.status(httpStatus.FORBIDDEN).json({
                    status: false,
                    message: 'No associated employee record found for access verification',
                });
            }

            if (userRole === 'employee') {
                if (callingEmployee.id !== targetEmployeeId) {
                    return res.status(httpStatus.FORBIDDEN).json({
                        status: false,
                        message: 'Employees can view only their own attendance records',
                    });
                }
                return next();
            }

            if (userRole === 'manager') {
                if (callingEmployee.id === targetEmployeeId) {
                    return next();
                }

                const targetEmployee = await Employee.findByPk(targetEmployeeId);
                if (!targetEmployee || targetEmployee.managerId !== callingEmployee.id) {
                    return res.status(httpStatus.FORBIDDEN).json({
                        status: false,
                        message: 'Managers can view attendance only for their direct team members',
                    });
                }
                return next();
            }

            return res.status(httpStatus.FORBIDDEN).json({
                status: false,
                message: 'Access denied to attendance record',
            });
        } catch (error) {
            console.error('checkEmployeeAttendanceAccess error:', error);
            return next(error);
        }
    },

    /**
     * Check role-based access for single attendance record by ID
     */
    async checkSingleAttendanceAccess(req, res, next) {
        try {
            const attendance = req.attendanceRecord;
            const userRole = req.userRole;

            if (['super_admin', 'admin', 'hr_manager'].includes(userRole)) {
                return next();
            }

            let callingEmployee = req.employee;
            if (!callingEmployee && req.user?.id) {
                callingEmployee = await Employee.findOne({ where: { userId: req.user.id } });
                req.employee = callingEmployee;
            }

            if (!callingEmployee) {
                return res.status(httpStatus.FORBIDDEN).json({
                    status: false,
                    message: 'Access denied: employee record not found',
                });
            }

            if (userRole === 'employee') {
                if (attendance.employeeId !== callingEmployee.id) {
                    return res.status(httpStatus.FORBIDDEN).json({
                        status: false,
                        message: 'Employees can view only their own attendance',
                    });
                }
                return next();
            }

            if (userRole === 'manager') {
                if (attendance.employeeId === callingEmployee.id) {
                    return next();
                }

                if (attendance.employee && attendance.employee.managerId === callingEmployee.id) {
                    return next();
                }

                // If managerId not already populated in association
                const emp = await Employee.findByPk(attendance.employeeId);
                if (emp && emp.managerId === callingEmployee.id) {
                    return next();
                }

                return res.status(httpStatus.FORBIDDEN).json({
                    status: false,
                    message: 'Managers can view attendance only for their direct team members',
                });
            }

            return res.status(httpStatus.FORBIDDEN).json({
                status: false,
                message: 'Access denied to attendance record',
            });
        } catch (error) {
            console.error('checkSingleAttendanceAccess error:', error);
            return next(error);
        }
    },

    /**
     * Validate check-in rules: Policy-driven GPS validation & geofence checks
     */
    async validateCheckInRules(req, res, next) {
        try {
            const { latitude, longitude, accuracy } = req.body || {};
            const employee = req.employee;
            const now = new Date();
            const workingDate = getWorkingDate(now, employee?.shift);

            // 1. Resolve applicable policy for working date
            const policy = await attendancePolicyRepository.getEffectivePolicy(workingDate);
            req.effectivePolicy = policy;

            const hasCoords = latitude !== undefined && latitude !== null && latitude !== '' &&
                longitude !== undefined && longitude !== null && longitude !== '';

            // 2. Check if policy requires location
            if (policy.locationRequired && !hasCoords) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    status: false,
                    message: 'GPS location coordinates are required by attendance policy for check-in',
                });
            }

            // 3. Validate coordinates if provided
            if (hasCoords) {
                if (!isValidCoordinates(latitude, longitude)) {
                    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        status: false,
                        message: 'Invalid GPS coordinates provided',
                    });
                }

                // 4. Check max GPS accuracy if configured and provided
                if (accuracy !== undefined && accuracy !== null && accuracy !== '' && policy.maxGpsAccuracyMeters) {
                    const accMeters = parseFloat(accuracy);
                    if (!isNaN(accMeters) && accMeters > policy.maxGpsAccuracyMeters) {
                        return res.status(httpStatus.BAD_REQUEST).json({
                            status: false,
                            message: `GPS accuracy is too low (${accMeters}m > allowed max ${policy.maxGpsAccuracyMeters}m)`,
                        });
                    }
                    req.checkInAccuracy = accMeters;
                }

                // 5. Geofence check if geofencing is enabled in policy
                const officeLat = employee?.location?.latitude
                    ? parseFloat(employee.location.latitude)
                    : (process.env.DEFAULT_OFFICE_LATITUDE ? parseFloat(process.env.DEFAULT_OFFICE_LATITUDE) : null);
                const officeLng = employee?.location?.longitude
                    ? parseFloat(employee.location.longitude)
                    : (process.env.DEFAULT_OFFICE_LONGITUDE ? parseFloat(process.env.DEFAULT_OFFICE_LONGITUDE) : null);
                const allowedRadius = employee?.location?.radiusInMeters
                    || (process.env.DEFAULT_OFFICE_RADIUS_METERS ? parseInt(process.env.DEFAULT_OFFICE_RADIUS_METERS, 10) : 1000);

                if (officeLat !== null && officeLng !== null && !isNaN(officeLat) && !isNaN(officeLng)) {
                    const distance = calculateDistanceInMeters(
                        parseFloat(latitude),
                        parseFloat(longitude),
                        officeLat,
                        officeLng,
                    );
                    req.geofenceDistance = distance;
                    req.isInsideGeofence = distance <= allowedRadius;

                    if (policy.geofenceEnabled && !req.isInsideGeofence) {
                        return res.status(httpStatus.BAD_REQUEST).json({
                            status: false,
                            message: `Check-in location is outside allowed office geofence radius (${distance}m > allowed ${allowedRadius}m)`,
                        });
                    }
                }
            }

            return next();
        } catch (error) {
            console.error('validateCheckInRules error:', error);
            return next(error);
        }
    },

    /**
     * Validate check-out rules: Policy-driven GPS validation
     */
    async validateCheckOutRules(req, res, next) {
        try {
            const { latitude, longitude, accuracy } = req.body || {};
            const attendanceRecord = req.attendanceRecord;

            // Load policy from attendance snapshot or DB
            const policy = attendanceRecord?.policy
                || await attendancePolicyRepository.getEffectivePolicy(attendanceRecord?.date);
            req.effectivePolicy = policy;

            const hasCoords = latitude !== undefined && latitude !== null && latitude !== '' &&
                longitude !== undefined && longitude !== null && longitude !== '';

            if (policy.locationRequired && !hasCoords) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    status: false,
                    message: 'GPS location coordinates are required by attendance policy for check-out',
                });
            }

            if (hasCoords) {
                if (!isValidCoordinates(latitude, longitude)) {
                    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
                        status: false,
                        message: 'Invalid GPS coordinates provided',
                    });
                }

                if (accuracy !== undefined && accuracy !== null && accuracy !== '' && policy.maxGpsAccuracyMeters) {
                    const accMeters = parseFloat(accuracy);
                    if (!isNaN(accMeters) && accMeters > policy.maxGpsAccuracyMeters) {
                        return res.status(httpStatus.BAD_REQUEST).json({
                            status: false,
                            message: `GPS accuracy is too low (${accMeters}m > allowed max ${policy.maxGpsAccuracyMeters}m)`,
                        });
                    }
                    req.checkOutAccuracy = accMeters;
                }
            }

            return next();
        } catch (error) {
            console.error('validateCheckOutRules error:', error);
            return next(error);
        }
    },
};