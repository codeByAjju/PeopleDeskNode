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
  resourceAccessMiddleware(['super_admin', 'admin']),
  validateMiddleware({ schema: departmentValidations.createSchema }),
  departmentMiddleware.checkDepartmentNameExist,
  departmentController.create,
);
router.post(
  '/department/bulk-department-create',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  departmentController.createBulkDepartment,
);

router.get(
  '/department/list',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
  departmentController.getAllDepartment,
);

router.get(
  '/department/:id',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
  departmentMiddleware.checkDepartmentIdExist,
  departmentController.getDepartmentById,
)

router.put(
  '/department-update/:id',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  departmentMiddleware.checkDepartmentIdExist,
  departmentMiddleware.checkUpdateDepartmentNameExist,
  departmentController.updateDepartment,
)

router.patch(
  '/department-delete/:id',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  departmentMiddleware.checkDepartmentIdExist,
  departmentController.deleteDepartment,
)
export default router;