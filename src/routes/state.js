import { Router } from 'express';
import controller from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';
import authValidateRequest from '../middlewares/auth-middleware.js';

const router = Router();
const { stateController } = controller;
const { geoValidations } = validations;
const { validateMiddleware, geoMiddleware } = middlewares;

// GET /state/country/:countryId - List states for a country (suitable for React dropdowns)
router.get(
  '/state/country/:countryId',
  authValidateRequest,
  validateMiddleware({ schema: geoValidations.getStateByCountrySchema }),
  geoMiddleware.checkCountryExists,
  stateController.getStatesByCountry,
);

// GET /state/:id - Get state by ID
router.get(
  '/state/:id',
  authValidateRequest,
  geoMiddleware.checkStateExists,
  stateController.getStateById,
);

export default router;
