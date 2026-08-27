import { Router } from 'express';
import controller from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';
import authValidateRequest from '../middlewares/auth-middleware.js';

const router = Router();
const { countryController } = controller;
const { geoValidations } = validations;
const { validateMiddleware, geoMiddleware } = middlewares;

// GET /country/list - List all countries (suitable for React dropdowns)
router.get(
  '/country/list',
  authValidateRequest,
  validateMiddleware({ schema: geoValidations.getCountryListSchema }),
  countryController.getAllCountries,
);

// GET /country/:id - Get country by ID
router.get(
  '/country/:id',
  authValidateRequest,
  geoMiddleware.checkCountryExists,
  countryController.getCountryById,
);

export default router;
