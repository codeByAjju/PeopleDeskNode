import { Router } from 'express';
import controller from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';
import authValidateRequest from '../middlewares/auth-middleware.js';
const router = Router();
const { departmentController } = controller;
const { departmentValidations } = validations;
const { validateMiddleware, resourceAccessMiddleware, companyMiddleware, mediaMiddleware, departmentMiddleware } = middlewares;

// Create department
router.post(
  '/department/create',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
  validateMiddleware({ schema: departmentValidations.createSchema }),
  departmentMiddleware.checkCompanyIdExist,
  departmentMiddleware.checkDepartmentNameExist,
  departmentController.create,
);

router.get(
  '/department/list/:companyId',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
  departmentMiddleware.checkCompanyIdExist,
  departmentController.getAllDepartmentByCompanyId,
);
router.get(
  '/department/list',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  departmentController.getAllDepartment,
);

export default router;