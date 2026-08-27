import Joi from 'joi';

export const getCountryListSchema = Joi.object({
  search: Joi.string().allow('').optional(),
  q: Joi.string().allow('').optional(),
  status: Joi.string().valid('active', 'inactive', 'deleted', 'all').optional(),
});

export const getStateByCountrySchema = Joi.object({
  countryId: Joi.number().integer().positive().required().messages({
    'any.required': 'COUNTRY_ID_REQUIRED',
    'number.base': 'COUNTRY_ID_MUST_BE_NUMBER',
    'number.positive': 'COUNTRY_ID_MUST_BE_POSITIVE',
  }),
  search: Joi.string().allow('').optional(),
  q: Joi.string().allow('').optional(),
  status: Joi.string().valid('active', 'inactive', 'deleted', 'all').optional(),
});

export const getCityByStateSchema = Joi.object({
  stateId: Joi.number().integer().positive().required().messages({
    'any.required': 'STATE_ID_REQUIRED',
    'number.base': 'STATE_ID_MUST_BE_NUMBER',
    'number.positive': 'STATE_ID_MUST_BE_POSITIVE',
  }),
  search: Joi.string().allow('').optional(),
  q: Joi.string().allow('').optional(),
  status: Joi.string().valid('active', 'inactive', 'deleted', 'all').optional(),
  page: Joi.number().integer().positive().optional(),
  limit: Joi.number().integer().positive().max(1000).optional(),
});

export default {
  getCountryListSchema,
  getStateByCountrySchema,
  getCityByStateSchema,
};
