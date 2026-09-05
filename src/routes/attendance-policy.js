import { Router } from 'express';
import controllers from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';

const router = Router();
const { attendancePolicyController } = controllers;
const { attendancePolicyValidations } = validations;
const {
    authValidateRequest,
    resourceAccessMiddleware,
    validateMiddleware,
} = middlewares;

const hrAdminOnly = resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']);

// 1. Create Policy
router.post(
    '/attendance-policy',
    authValidateRequest,
    hrAdminOnly,
    validateMiddleware({ schema: attendancePolicyValidations.createSchema }),
    attendancePolicyController.createPolicy,
);

// 2. Get All Policies
router.get(
    '/attendance-policy',
    authValidateRequest,
    hrAdminOnly,
    attendancePolicyController.getAllPolicies,
);

// 3. Get Policy Details
router.get(
    '/attendance-policy/:id',
    authValidateRequest,
    hrAdminOnly,
    validateMiddleware({ schema: attendancePolicyValidations.idParamSchema }),
    attendancePolicyController.getPolicyById,
);

// 4. Update Policy
router.put(
    '/attendance-policy/:id',
    authValidateRequest,
    hrAdminOnly,
    validateMiddleware({ schema: attendancePolicyValidations.idParamSchema }),
    validateMiddleware({ schema: attendancePolicyValidations.updateSchema }),
    attendancePolicyController.updatePolicy,
);

// 5. Activate Policy
router.patch(
    '/attendance-policy/:id/activate',
    authValidateRequest,
    hrAdminOnly,
    validateMiddleware({ schema: attendancePolicyValidations.idParamSchema }),
    validateMiddleware({ schema: attendancePolicyValidations.activateSchema }),
    attendancePolicyController.activatePolicy,
);

export default router;
