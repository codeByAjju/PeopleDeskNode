import express from 'express';
import middlewares from '../middlewares/index.js';
import validations from '../validations/index.js';
import controllers from '../controllers/index.js';

const router = express.Router();
const { authValidateRequest, validateMiddleware, resourceAccessMiddleware, shiftMiddleware } = middlewares;
const { shiftValidations } = validations;
const { shiftController } = controllers;

router.post(
    '/shift/create',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    validateMiddleware({ schema: shiftValidations.createSchema }),
    shiftMiddleware.checkShiftNameExist,
    shiftMiddleware.checkShiftCodeExist,
    shiftController.create,
);

router.get(
    '/shift/list',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    shiftController.getAllShift,
);

router.get(
    '/shift/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    shiftMiddleware.checkShiftIdExist,
    shiftController.getShiftById,
);

router.put(
    '/shift-update/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    validateMiddleware({ schema: shiftValidations.updateSchema }),
    shiftMiddleware.checkShiftIdExist,
    shiftMiddleware.checkUpdateShiftNameExist,
    shiftMiddleware.checkUpdateShiftCodeExist,
    shiftController.updateShift,
);

router.patch(
    '/shift-delete/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    shiftMiddleware.checkShiftIdExist,
    shiftMiddleware.checkEmployeesAssignedToShift,
    shiftController.deleteShift,
);

router.patch(
    '/shift-restore/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    shiftMiddleware.checkShiftIdExist,
    shiftController.restoreShift,
);

router.get(
    '/shift/:shiftId/stats',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    shiftController.getShiftStats,
);

export default router;
