import { Router } from 'express';
import controllers from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';

const router = Router();
const { attendanceController } = controllers;
const { attendanceValidations } = validations;
const {
    authValidateRequest,
    resourceAccessMiddleware,
    validateMiddleware,
    attendanceMiddleware,
} = middlewares;

// 1. Employee Check-In
router.post(
    '/attendance/check-in',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager', 'manager', 'employee', 'user']),
    validateMiddleware({ schema: attendanceValidations.checkInSchema }),
    attendanceMiddleware.resolveAuthenticatedEmployee,
    attendanceMiddleware.validateCheckInRules,
    attendanceController.checkIn,
);

// 2. Employee Check-Out
router.post(
    '/attendance/check-out',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager', 'manager', 'employee', 'user']),
    validateMiddleware({ schema: attendanceValidations.checkOutSchema }),
    attendanceMiddleware.resolveAuthenticatedEmployee,
    attendanceMiddleware.validateCheckOutRules,
    attendanceController.checkOut,
);

// 3. Attendance List
router.get(
    '/attendance/list',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager', 'manager', 'employee']),
    validateMiddleware({ schema: attendanceValidations.listSchema }),
    attendanceController.getAllAttendance,
);

// 4. Attendance Statistics
router.get(
    '/attendance/stats',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager', 'manager', 'employee']),
    attendanceController.getAttendanceStats,
);

// 5. Attendance Audit Logs (HR / Admin)
router.get(
    '/attendance/audit-logs',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    attendanceController.getAuditLogs,
);

// 6. Get Attendance by Employee ID
router.get(
    '/attendance/employee/:employeeId',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager', 'manager', 'employee']),
    validateMiddleware({ schema: attendanceValidations.employeeIdParamSchema }),
    attendanceMiddleware.checkEmployeeAttendanceAccess,
    attendanceController.getAttendanceByEmployeeId,
);

// 7. Get Single Attendance by ID
router.get(
    '/attendance/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager', 'manager', 'employee']),
    validateMiddleware({ schema: attendanceValidations.idParamSchema }),
    attendanceMiddleware.checkAttendanceIdExist,
    attendanceMiddleware.checkSingleAttendanceAccess,
    attendanceController.getAttendanceById,
);

// 8. Update Attendance / HR Correction
router.put(
    '/attendance-update/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    validateMiddleware({ schema: attendanceValidations.updateSchema }),
    attendanceMiddleware.checkAttendanceIdExist,
    attendanceController.updateAttendance,
);

// 9. Dedicated HR Attendance Correction Route
router.put(
    '/attendance/correct/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    validateMiddleware({ schema: attendanceValidations.updateSchema }),
    attendanceMiddleware.checkAttendanceIdExist,
    attendanceController.correctAttendance,
);

// 10. Soft Delete Attendance Record (Admin only)
router.patch(
    '/attendance-delete/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    validateMiddleware({ schema: attendanceValidations.idParamSchema }),
    attendanceMiddleware.checkAttendanceIdExist,
    attendanceController.deleteAttendance,
);

// 11. Restore Soft Deleted Attendance Record (Admin only)
router.patch(
    '/attendance-restore/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    validateMiddleware({ schema: attendanceValidations.idParamSchema }),
    attendanceController.restoreAttendance,
);

export default router;