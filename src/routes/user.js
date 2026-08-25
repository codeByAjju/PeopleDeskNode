import { Router } from 'express';
import controller from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';
import authValidateRequest from '../middlewares/auth-middleware.js';
const router = Router();
const { userController } = controller;
const { userValidations } = validations;
const { validateMiddleware } = middlewares;

router.post('/signup', validateMiddleware({ schema: userValidations.userSignupSchema }), userController.signUp);
router.post('/signin', validateMiddleware({ schema: userValidations.userLoginUpdateSchema }), userController.signIn);
router.put('/profile',
    authValidateRequest,
    validateMiddleware({ schema: userValidations.userProfileUpdateSchema }), userController.userUpdateProfile);
router.post('/user-update', validateMiddleware({ schema: userValidations.userProfileUpdateSchema }), userController.userUpdateProfile);
export default router;