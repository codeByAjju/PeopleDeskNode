import { Router } from 'express';
import controller from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';
import authValidateRequest from '../middlewares/auth-middleware.js';

const router = Router();
const { cityController } = controller;
const { geoValidations } = validations;
const { validateMiddleware, geoMiddleware } = middlewares;

// GET /city/state/:stateId - List cities for a state (suitable for React dropdowns)
router.get(
  '/city/state/:stateId',
  authValidateRequest,
  validateMiddleware({ schema: geoValidations.getCityByStateSchema }),
  geoMiddleware.checkStateExists,
  cityController.getCitiesByState,
);

// GET /city/:id - Get city by ID
router.get(
  '/city/:id',
  authValidateRequest,
  geoMiddleware.checkCityExists,
  cityController.getCityById,
);

export default router;
