import { Router } from 'express';
import controller from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';
import authValidateRequest from '../middlewares/auth-middleware.js';
const router = Router();
const { branchController } = controller;
const { branchValidations } = validations;
const { validateMiddleware, resourceAccessMiddleware, branchMiddleware } = middlewares;

// Create designation
router.post(
    '/branch/create',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    validateMiddleware({ schema: branchValidations.createSchema }),
    branchMiddleware.checkCountryIdExist,
    branchMiddleware.checkStateIdExist,
    branchMiddleware.checkCityIdExist,
    branchMiddleware.checkBranchNameExist,
    branchMiddleware.checkBranchCodeExist,
    branchController.create,
);

router.get(
    '/branch/list',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    branchController.getAllBranch,
);
router.get(
    '/branch/stats',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    branchController.getBranchStats,
)
router.get(
    '/branch/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    branchMiddleware.checkBranchIdExist,
    branchController.getBranchById,
)

router.put(
    '/branch-update/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    validateMiddleware({ schema: branchValidations.updateSchema }),
    branchMiddleware.checkBranchIdExist,
    branchMiddleware.checkUpdateBranchNameExist,
    branchMiddleware.checkUpdateCodeNameExist,
    branchController.updateBranch,
)

router.patch(
    '/branch-delete/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    branchMiddleware.checkBranchIdExist,
    branchController.deleteBranch,
)
router.patch(
    '/branch-restore/:id',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin']),
    branchMiddleware.checkBranchIdExist,
    branchController.restoreBranch,
)
router.get(
    '/branch/city/:cityId',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    branchMiddleware.checkCityIdExist,
    branchController.getBranchByCity,
)
router.get(
    '/branch/state/:stateId',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    branchMiddleware.checkStateIdExist,
    branchController.getBranchByState,
)
router.get(
    '/branch/country/:countryId',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    branchMiddleware.checkCountryIdExist,
    branchController.getBranchByCountry,
)
router.get(
    '/branch/:branchId/employees',
    authValidateRequest,
    resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
    branchMiddleware.checkCountryIdExist,
    branchController.getEmployeeByBranch,
)
export default router;