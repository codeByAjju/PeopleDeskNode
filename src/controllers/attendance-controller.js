import repositories from '../repositories/index.js';
import httpStatus from 'http-status';

const { attendanceRepository, attendanceAuditRepository } = repositories;

export default {
    /**
     * Check-in
     */
    async checkIn(req, res, next) {
        try {
            const result = await attendanceRepository.checkIn(req);
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Check-in successful',
                result,
            });
        } catch (error) {
            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    status: false,
                    message: error.message,
                });
            }
            next(error);
        }
    },

    /**
     * Check-out
     */
    async checkOut(req, res, next) {
        try {
            const result = await attendanceRepository.checkOut(req);
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Check-out successful',
                result,
            });
        } catch (error) {
            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    status: false,
                    message: error.message,
                });
            }
            next(error);
        }
    },

    /**
     * Get paginated attendance list
     */
    async getAllAttendance(req, res, next) {
        try {
            const result = await attendanceRepository.getAllAttendance(req);
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance records fetched successfully',
                result,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get attendance summary statistics
     */
    async getAttendanceStats(req, res, next) {
        try {
            const result = await attendanceRepository.getAttendanceStats(req);
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance stats fetched successfully',
                result,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get single attendance record by ID
     */
    async getAttendanceById(req, res, next) {
        try {
            const { id } = req.params;
            const result = req.attendanceRecord || await attendanceRepository.getAttendanceById(id);
            if (!result) {
                return res.status(httpStatus.NOT_FOUND).json({
                    status: false,
                    message: 'Attendance record not found',
                });
            }
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance record fetched successfully',
                result,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get attendance records for a specific employee
     */
    async getAttendanceByEmployeeId(req, res, next) {
        try {
            const { employeeId } = req.params;
            const customReq = {
                ...req,
                query: { ...(req.query || {}), employeeId },
                userRole: req.userRole,
                employee: req.employee,
                user: req.user,
            };
            const result = await attendanceRepository.getAllAttendance(customReq);
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Employee attendance fetched successfully',
                result,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update / Correct Attendance (HR / Admin)
     */
    async updateAttendance(req, res, next) {
        try {
            const result = await attendanceRepository.correctAttendance(req);
            if (!result) {
                return res.status(httpStatus.NOT_FOUND).json({
                    status: false,
                    message: 'Attendance record not found',
                });
            }
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance record updated successfully',
                result,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Correct Attendance (Alias dedicated for HR corrections)
     */
    async correctAttendance(req, res, next) {
        try {
            const result = await attendanceRepository.correctAttendance(req);
            if (!result) {
                return res.status(httpStatus.NOT_FOUND).json({
                    status: false,
                    message: 'Attendance record not found',
                });
            }
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance correction applied successfully',
                result,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Soft Delete Attendance Record
     */
    async deleteAttendance(req, res, next) {
        try {
            const result = await attendanceRepository.deleteAttendance(req);
            if (!result) {
                return res.status(httpStatus.NOT_FOUND).json({
                    status: false,
                    message: 'Attendance record not found',
                });
            }
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance record deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Restore Soft-Deleted Attendance Record
     */
    async restoreAttendance(req, res, next) {
        try {
            const result = await attendanceRepository.restoreAttendance(req);
            if (!result) {
                return res.status(httpStatus.NOT_FOUND).json({
                    status: false,
                    message: 'Attendance record not found or not deleted',
                });
            }
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance record restored successfully',
                result,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get Attendance Audit Logs
     */
    async getAuditLogs(req, res, next) {
        try {
            const result = await attendanceAuditRepository.getAuditLogs(req);
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance audit logs fetched successfully',
                result,
            });
        } catch (error) {
            next(error);
        }
    },
};