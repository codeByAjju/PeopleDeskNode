import { Router } from 'express';
import controller from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';
import authValidateRequest from '../middlewares/auth-middleware.js';
const router = Router();
const { attendanceController } = controller;
const { attendanceValidations } = validations;
const { validateMiddleware, resourceAccessMiddleware, attendanceMiddleware } = middlewares;

// Create designation
router.post(
    '/attendance/check-in',
    authValidateRequest,
    // resourceAccessMiddleware(['super_admin', 'admin']),
    // validateMiddleware({ schema: attendanceValidations.createSchema }),
    // branchMiddleware.checkCountryIdExist,
    // branchMiddleware.checkStateIdExist,
    // branchMiddleware.checkCityIdExist,
    // branchMiddleware.checkBranchNameExist,
    // branchMiddleware.checkBranchCodeExist,
    attendanceMiddleware.checkEmployeeExist,
    attendanceController.checkIn,
);

export default router;