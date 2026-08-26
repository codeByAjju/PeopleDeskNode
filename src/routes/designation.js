import { Router } from 'express';
import controller from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';
import authValidateRequest from '../middlewares/auth-middleware.js';
const router = Router();
const { designationController } = controller;
const { designationValidations } = validations;
const { validateMiddleware, resourceAccessMiddleware, designationMiddleware } = middlewares;

// Create designation
router.post(
  '/designation/create',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  validateMiddleware({ schema: designationValidations.createSchema }),
  designationMiddleware.checkDepartmentIdExist,
  designationMiddleware.checkDesignationNameExist,
  designationMiddleware.checkCodeNameExist,
  designationController.create,
);

router.get(
  '/designation/list',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
  designationController.getAllDesignation,
);

router.get(
  '/designation/:id',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
  designationMiddleware.checkDesignationIdExist,
  designationController.getDesignationById,
)

router.put(
  '/designation-update/:id',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
  validateMiddleware({ schema: designationValidations.updateSchema }),
  designationMiddleware.checkDesignationIdExist,
  designationMiddleware.checkUpdateDesignationNameExist,
  designationMiddleware.checkUpdateCodeNameExist,
  designationController.updateDesignation,
)

router.patch(
  '/designation-delete/:id',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  designationMiddleware.checkDesignationIdExist,
  designationController.deleteDesignation,
)
router.patch(
  '/designation-restore/:id',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin']),
  designationMiddleware.checkDesignationIdExist,
  designationController.restoreDesignation,
)
router.get(
  '/designation/department/:departmentId',
  authValidateRequest,
  resourceAccessMiddleware(['super_admin', 'admin', 'hr_manager']),
  designationMiddleware.checkDepartmentIdExist,
  designationController.getDesignationByDepartment,
)
export default router;