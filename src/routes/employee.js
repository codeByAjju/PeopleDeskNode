import express from 'express';
import middlewares from '../middlewares/index.js';
import validations from '../validations/index.js';
import controllers from '../controllers/index.js';

const router = express.Router();
const { authValidateRequest, validateMiddleware, resourceAccessMiddleware, employeeMiddleware } = middlewares;
const { employeeValidations } = validations;
const { employeeController } = controllers;

router.post(
    '/employee/create',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    validateMiddleware({ schema: employeeValidations.createSchema }),
    employeeMiddleware.checkEmployeeCodeExist,
    employeeMiddleware.checkDepartmentIdExist,
    employeeMiddleware.checkDesignationIdExist,
    employeeMiddleware.checkBranchIdExist,
    employeeMiddleware.checkShiftIdExist,
    employeeMiddleware.checkLocationIdExist,
    employeeMiddleware.checkEmployeeManagerIdExist,
    employeeMiddleware.checkEmployeeEmailExist,
    employeeMiddleware.checkUserEmailAvailable,
    employeeController.create,
);

router.get(
    '/employee/list',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    employeeController.getAllEmployee,
);
router.get(
    '/employee/stats',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    employeeController.getAllEmployeeStats,
);

router.get(
    '/employee/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    employeeMiddleware.checkEmployeeIdExist,
    employeeController.getEmployeeById,
);

router.put(
    '/employee-update/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    validateMiddleware({ schema: employeeValidations.updateSchema }),
    employeeMiddleware.checkEmployeeIdExist,
    employeeMiddleware.checkUpdateEmployeeCodeExist,
    employeeMiddleware.checkUpdateEmployeeEmailExist,
    employeeMiddleware.checkDepartmentIdExist,
    employeeMiddleware.checkDesignationIdExist,
    employeeMiddleware.checkBranchIdExist,
    employeeMiddleware.checkShiftIdExist,
    employeeMiddleware.checkLocationIdExist,
    employeeMiddleware.checkEmployeeManagerIdExist,
    // employeeMiddleware.checkUserEmailAvailable,
    employeeController.updateEmployee,
);

router.patch(
    '/employee-delete/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    employeeMiddleware.checkEmployeeIdExist,
    employeeMiddleware.checkEmployeeHasTeamMembers,
    employeeController.deleteEmployee,
);

router.patch(
    '/employee-restore/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    employeeMiddleware.checkEmployeeIdExist,
    employeeController.restoreEmployee,
);

router.patch(
    '/employee-status/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    validateMiddleware({ schema: employeeValidations.statusSchema }),
    employeeMiddleware.checkEmployeeIdExist,
    employeeController.updateEmployeeStatus,
);

export default router;
