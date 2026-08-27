import Joi from 'joi';

const createSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(150)
    .required(),
  code: Joi.string()
    .min(2)
    .max(50),
  // .required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: false } })
    .min(6)
    .max(50)
    .pattern(/^[^\s]+$/)
    .messages({
      'any.required': 'EMAIL_REQUIRED',
      'string.empty': 'EMAIL_REQUIRED',
      'string.email': 'VALID_EMAIL_ALLOWED',
      'string.min': 'EMAIL_MIN_VALIDATION',
      'string.max': 'EMAIL_MAX_VALIDATION',
      'string.pattern.base': 'EMAIL_FORMAT_INVALID',
      'string.pattern': 'SPACES_NOT_ALLOWED_IN_EMAIL',
    })
    .required(),
  phoneNumber: Joi.string()
    .min(10)
    .max(10)
    .pattern(/^[0-9]+$/)
    .messages({
      'any.required': 'PHONE_NUMBER_REQUIRED',
      'string.empty': 'PHONE_NUMBER_REQUIRED',
      'string.min': 'PHONE_NUMBER_MIN_VALIDATION',
      'string.max': 'PHONE_NUMBER_MAX_VALIDATION',
      'string.pattern.base': 'PHONE_NUMBER_FORMAT_INVALID',
    }),
  // .required(),
  website: Joi.string()
    .allow('')
    .min(5)
    .max(255)
    .pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)
    .messages({
      'string.min': 'WEBSITE_MIN_VALIDATION',
      'string.max': 'WEBSITE_MAX_VALIDATION',
      'string.pattern.base': 'WEBSITE_FORMAT_INVALID',
    }),
  address: Joi.string()
    .min(5)
    .max(100)
    .messages({
      'any.required': 'ADDRESS_REQUIRED',
      'string.empty': 'ADDRESS_REQUIRED',
      'string.min': 'ADDRESS_MIN_VALIDATION',
      'string.max': 'ADDRESS_MAX_VALIDATION',
    })
    .required(),
  countryId: Joi.number()
    .integer()
    .positive()
    .messages({
      'any.required': 'COUNTRY_ID_REQUIRED',
      'number.base': 'COUNTRY_ID_MUST_BE_NUMBER',
      'number.positive': 'COUNTRY_ID_MUST_BE_POSITIVE',
    })
    .optional(),
  stateId: Joi.number()
    .integer()
    .positive()
    .messages({
      'any.required': 'STATE_ID_REQUIRED',
      'number.base': 'STATE_ID_MUST_BE_NUMBER',
      'number.positive': 'STATE_ID_MUST_BE_POSITIVE',
    })
    .optional(),
  cityId: Joi.number()
    .integer()
    .positive()
    .messages({
      'any.required': 'CITY_ID_REQUIRED',
      'number.base': 'CITY_ID_MUST_BE_NUMBER',
      'number.positive': 'CITY_ID_MUST_BE_POSITIVE',
    })
    .optional(),
  postalCode: Joi.string()
    .min(2)
    .max(20)
    .messages({
      'any.required': 'POSTAL_CODE_REQUIRED',
      'string.empty': 'POSTAL_CODE_REQUIRED',
      'string.min': 'POSTAL_CODE_MIN_VALIDATION',
      'string.max': 'POSTAL_CODE_MAX_VALIDATION',
    })
    .required(),
  logo: Joi.string()
    .allow('')
    .min(5)
    .max(255)
    // .pattern(/^(http?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)
    .messages({
      'any.required': 'LOGO_REQUIRED',
      'string.empty': 'LOGO_REQUIRED',
      'string.min': 'LOGO_MIN_VALIDATION',
      'string.max': 'LOGO_MAX_VALIDATION',
      'string.pattern.base': 'LOGO_FORMAT_INVALID',
    })
});

const updateSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required(),
  name: Joi.string()
    .min(2)
    .max(150)
    .required(),

  code: Joi.string()
    .min(2)
    .max(50),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: false },
    })
    .min(6)
    .max(50)
    .pattern(/^[^\s]+$/)
    .messages({
      "any.required": "EMAIL_REQUIRED",
      "string.empty": "EMAIL_REQUIRED",
      "string.email": "VALID_EMAIL_ALLOWED",
      "string.min": "EMAIL_MIN_VALIDATION",
      "string.max": "EMAIL_MAX_VALIDATION",
      "string.pattern.base": "EMAIL_FORMAT_INVALID",
    })
    .required(),

  phoneNumber: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .messages({
      "string.empty": "PHONE_NUMBER_REQUIRED",
      "string.length": "PHONE_NUMBER_LENGTH_INVALID",
      "string.pattern.base": "PHONE_NUMBER_FORMAT_INVALID",
    }),

  website: Joi.string()
    .allow("")
    .min(5)
    .max(255)
    .uri({ scheme: ["http", "https"] })
    .messages({
      "string.min": "WEBSITE_MIN_VALIDATION",
      "string.max": "WEBSITE_MAX_VALIDATION",
      "string.uri": "WEBSITE_FORMAT_INVALID",
    }),

  address: Joi.string()
    .min(5)
    .max(100)
    .required(),

  countryId: Joi.number()
    .integer()
    .positive()
    .optional(),

  stateId: Joi.number()
    .integer()
    .positive()
    .optional(),

  cityId: Joi.number()
    .integer()
    .positive()
    .optional(),

  postalCode: Joi.string()
    .min(2)
    .max(20)
    .required(),

  logo: Joi.string()
    .allow("")
    .min(5)
    .max(255),
});

const updateCompanySchema = {
  params: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  }),

  body: updateSchema,
};
export default {
  createSchema,
  updateSchema,
  updateCompanySchema,
}