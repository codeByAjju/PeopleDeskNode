import { Router } from 'express';
import controller from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';
import authValidateRequest from '../middlewares/auth-middleware.js';
const router = Router();
const { companyController } = controller;
const { companyValidations } = validations;
const { validateMiddleware, resourceAccessMiddleware, companyMiddleware, mediaMiddleware } = middlewares;

router.post(
  '/company/create',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  validateMiddleware({ schema: companyValidations.createSchema }),
  companyMiddleware.checkCompanyNameExist,
  companyMiddleware.checkCompanyEmailExist,
  companyMiddleware.checkCompanyCodeExist,
  companyController.create,
);
router.post(
  '/company/bulk-company-create',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  // validateMiddleware({ schema: companyValidations.createSchema }),
  // companyMiddleware.checkCompanyNameExist,
  // companyMiddleware.checkCompanyEmailExist,
  // companyMiddleware.checkCompanyCodeExist,
  companyController.createBulkCompany,
);

router.get(
  '/company/list',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
  companyController.getAllCompany,
);

router.get(
  '/company/:id',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
  companyMiddleware.checkCompanyIdExist,
  companyController.getCompanyById,
);

router.put(
  '/company-update/:id',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  validateMiddleware({ schema: companyValidations.updateSchema }),
  companyMiddleware.checkUpdateMediaExist,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  companyMiddleware.checkCompanyNameExist,
  companyMiddleware.checkCompanyIdExist,
  companyMiddleware.checkCompanyEmailExist,
  companyController.updateCompany,
);

router.patch(
  '/company-delete/:id',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  companyMiddleware.checkCompanyIdExist,
  companyMiddleware.checkCompanyIsNotDeleted,
  companyController.deleteCompany,
);

export default router;