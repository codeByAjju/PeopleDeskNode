import Joi from 'joi';

const createSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'any.required': 'BRANCH_NAME_REQUIRED',
            'string.empty': 'BRANCH_NAME_REQUIRED',
            'string.min': 'BRANCH_NAME_MIN_VALIDATION',
            'string.max': 'BRANCH_NAME_MAX_VALIDATION',
        }),

    code: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'BRANCH_CODE_REQUIRED',
            'string.empty': 'BRANCH_CODE_REQUIRED',
            'string.min': 'BRANCH_CODE_MIN_VALIDATION',
            'string.max': 'BRANCH_CODE_MAX_VALIDATION',
        }),

    address: Joi.string()
        .min(5)
        .max(255)
        .allow('', null)
        .messages({
            'string.min': 'ADDRESS_MIN_VALIDATION',
            'string.max': 'ADDRESS_MAX_VALIDATION',
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

    phoneNumber: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .allow('', null)
        .messages({
            'string.length': 'PHONE_NUMBER_LENGTH_INVALID',
            'string.pattern.base': 'PHONE_NUMBER_FORMAT_INVALID',
        }),

    status: Joi.string()
        .valid('active', 'inactive')
        .default('active')
        .messages({
            'any.only': 'BRANCH_STATUS_INVALID',
        })
});

const updateSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required(),
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'any.required': 'BRANCH_NAME_REQUIRED',
            'string.empty': 'BRANCH_NAME_REQUIRED',
            'string.min': 'BRANCH_NAME_MIN_VALIDATION',
            'string.max': 'BRANCH_NAME_MAX_VALIDATION',
        }),

    code: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'BRANCH_CODE_REQUIRED',
            'string.empty': 'BRANCH_CODE_REQUIRED',
            'string.min': 'BRANCH_CODE_MIN_VALIDATION',
            'string.max': 'BRANCH_CODE_MAX_VALIDATION',
        }),

    address: Joi.string()
        .min(5)
        .max(255)
        .allow('', null)
        .messages({
            'string.min': 'ADDRESS_MIN_VALIDATION',
            'string.max': 'ADDRESS_MAX_VALIDATION',
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

    phoneNumber: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .allow('', null)
        .messages({
            'string.length': 'PHONE_NUMBER_LENGTH_INVALID',
            'string.pattern.base': 'PHONE_NUMBER_FORMAT_INVALID',
        }),

    status: Joi.string()
        .valid('active', 'inactive')
        .messages({
            'any.only': 'BRANCH_STATUS_INVALID',
        }),

});

const detailAndDeleteSchema = {
    params: Joi.object().keys({
        id: Joi.number()
            .integer()
            .greater(0)
            .required()
            .messages({
                'any.required': 'BRANCH_ID_REQUIRED',
                'number.base': 'BRANCH_ID_INVALID',
                'number.integer': 'BRANCH_ID_INVALID',
                'number.greater': 'BRANCH_ID_INVALID',
            }),
    }),
};

const updateBranchSchema = {
    params: Joi.object({
        id: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                'any.required': 'BRANCH_ID_REQUIRED',
                'number.base': 'BRANCH_ID_INVALID',
                'number.integer': 'BRANCH_ID_INVALID',
                'number.positive': 'BRANCH_ID_INVALID',
            }),
    }),

    body: updateSchema,
};

export default {
    createSchema,
    updateBranchSchema,
    updateSchema,
    detailAndDeleteSchema,
};