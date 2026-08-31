import express from 'express';
import middlewares from '../middlewares/index.js';
import validations from '../validations/index.js';
import controllers from '../controllers/index.js';

const router = express.Router();
const { authValidateRequest, validateMiddleware, resourceAccessMiddleware, locationMiddleware } = middlewares;
const { locationValidations } = validations;
const { locationController } = controllers;

router.post(
    '/location/create',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    validateMiddleware({ schema: locationValidations.createSchema }),
    locationMiddleware.checkBranchIdExist,
    locationMiddleware.checkLocationNameExist,
    locationMiddleware.checkLocationCodeExist,
    locationController.create,
);

router.get(
    '/location/list',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    locationController.getAllLocation,
);

router.get(
    '/location/stats',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    locationController.getLocationStats,
)

router.get(
    '/location/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    locationMiddleware.checkLocationIdExist,
    locationController.getLocationById,
);

router.put(
    '/location-update/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    validateMiddleware({ schema: locationValidations.updateSchema }),
    locationMiddleware.checkLocationIdExist,
    locationMiddleware.checkBranchIdExist,
    locationMiddleware.checkUpdateLocationNameExist,
    locationMiddleware.checkUpdateLocationCodeExist,
    locationController.updateLocation,
);

router.patch(
    '/location-delete/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    locationMiddleware.checkLocationIdExist,
    locationMiddleware.checkEmployeesAssignedToLocation,
    locationController.deleteLocation,
);

router.patch(
    '/location-restore/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    locationMiddleware.checkLocationIdExist,
    locationController.restoreLocation,
);

router.get(
    '/location/branch/:branchId',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    locationMiddleware.checkBranchIdExist,
    locationController.getLocationByBranch,
);

export default router;
