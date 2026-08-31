import Joi from 'joi';

const createSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'any.required': 'LOCATION_NAME_REQUIRED',
            'string.empty': 'LOCATION_NAME_REQUIRED',
            'string.min': 'LOCATION_NAME_MIN_VALIDATION',
            'string.max': 'LOCATION_NAME_MAX_VALIDATION',
        }),

    code: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'LOCATION_CODE_REQUIRED',
            'string.empty': 'LOCATION_CODE_REQUIRED',
            'string.min': 'LOCATION_CODE_MIN_VALIDATION',
            'string.max': 'LOCATION_CODE_MAX_VALIDATION',
        }),

    address: Joi.string()
        .min(5)
        .max(255)
        .allow('', null)
        .messages({
            'string.min': 'ADDRESS_MIN_VALIDATION',
            'string.max': 'ADDRESS_MAX_VALIDATION',
        }),

    branchId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'BRANCH_ID_REQUIRED',
            'number.base': 'BRANCH_ID_INVALID',
            'number.integer': 'BRANCH_ID_INVALID',
            'number.positive': 'BRANCH_ID_INVALID',
        }),

    countryId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'COUNTRY_ID_REQUIRED',
            'number.base': 'COUNTRY_ID_INVALID',
            'number.integer': 'COUNTRY_ID_INVALID',
            'number.positive': 'COUNTRY_ID_INVALID',
        }),

    stateId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'STATE_ID_REQUIRED',
            'number.base': 'STATE_ID_INVALID',
            'number.integer': 'STATE_ID_INVALID',
            'number.positive': 'STATE_ID_INVALID',
        }),

    cityId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'CITY_ID_REQUIRED',
            'number.base': 'CITY_ID_INVALID',
            'number.integer': 'CITY_ID_INVALID',
            'number.positive': 'CITY_ID_INVALID',
        }),

    postalCode: Joi.string()
        .min(2)
        .max(20)
        .allow('', null)
        .messages({
            'string.min': 'POSTAL_CODE_MIN_VALIDATION',
            'string.max': 'POSTAL_CODE_MAX_VALIDATION',
        }),

    status: Joi.string()
        .valid('active', 'inactive', 'deleted')
        .default('active')
        .messages({
            'any.only': 'LOCATION_STATUS_INVALID',
        }),
});

const updateSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'LOCATION_ID_REQUIRED',
            'number.base': 'LOCATION_ID_INVALID',
            'number.integer': 'LOCATION_ID_INVALID',
            'number.positive': 'LOCATION_ID_INVALID',
        }),

    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'any.required': 'LOCATION_NAME_REQUIRED',
            'string.empty': 'LOCATION_NAME_REQUIRED',
            'string.min': 'LOCATION_NAME_MIN_VALIDATION',
            'string.max': 'LOCATION_NAME_MAX_VALIDATION',
        }),

    code: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'LOCATION_CODE_REQUIRED',
            'string.empty': 'LOCATION_CODE_REQUIRED',
            'string.min': 'LOCATION_CODE_MIN_VALIDATION',
            'string.max': 'LOCATION_CODE_MAX_VALIDATION',
        }),

    address: Joi.string()
        .min(5)
        .max(255)
        .allow('', null)
        .messages({
            'string.min': 'ADDRESS_MIN_VALIDATION',
            'string.max': 'ADDRESS_MAX_VALIDATION',
        }),

    branchId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'BRANCH_ID_REQUIRED',
            'number.base': 'BRANCH_ID_INVALID',
            'number.integer': 'BRANCH_ID_INVALID',
            'number.positive': 'BRANCH_ID_INVALID',
        }),

    countryId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'COUNTRY_ID_REQUIRED',
            'number.base': 'COUNTRY_ID_INVALID',
            'number.integer': 'COUNTRY_ID_INVALID',
            'number.positive': 'COUNTRY_ID_INVALID',
        }),

    stateId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'STATE_ID_REQUIRED',
            'number.base': 'STATE_ID_INVALID',
            'number.integer': 'STATE_ID_INVALID',
            'number.positive': 'STATE_ID_INVALID',
        }),

    cityId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'CITY_ID_REQUIRED',
            'number.base': 'CITY_ID_INVALID',
            'number.integer': 'CITY_ID_INVALID',
            'number.positive': 'CITY_ID_INVALID',
        }),

    postalCode: Joi.string()
        .min(2)
        .max(20)
        .allow('', null)
        .messages({
            'string.min': 'POSTAL_CODE_MIN_VALIDATION',
            'string.max': 'POSTAL_CODE_MAX_VALIDATION',
        }),

    status: Joi.string()
        .valid('active', 'inactive', 'deleted')
        .messages({
            'any.only': 'LOCATION_STATUS_INVALID',
        }),
});

const detailAndDeleteSchema = {
    params: Joi.object().keys({
        id: Joi.number()
            .integer()
            .greater(0)
            .required()
            .messages({
                'any.required': 'LOCATION_ID_REQUIRED',
                'number.base': 'LOCATION_ID_INVALID',
                'number.integer': 'LOCATION_ID_INVALID',
                'number.greater': 'LOCATION_ID_INVALID',
            }),
    }),
};

export default {
    createSchema,
    updateSchema,
    detailAndDeleteSchema,
};
