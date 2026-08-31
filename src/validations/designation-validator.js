import Joi from 'joi';

const createSchema = Joi.object({
    departmentId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'DEPARTMENT_ID_REQUIRED',
            'number.base': 'DEPARTMENT_ID_INVALID',
            'number.integer': 'DEPARTMENT_ID_INVALID',
            'number.positive': 'DEPARTMENT_ID_INVALID',
        }),
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'any.required': 'DESIGNATION_NAME_REQUIRED',
            'string.empty': 'DESIGNATION_NAME_REQUIRED',
            'string.min': 'DESIGNATION_NAME_MIN_VALIDATION',
            'string.max': 'DESIGNATION_NAME_MAX_VALIDATION',
        }),
    code: Joi.string()
        .optional()
        .min(2)
        .max(50)
        .messages({
            'string.min': 'DESIGNATION_CODE_MIN_VALIDATION',
            'string.max': 'DESIGNATION_CODE_MAX_VALIDATION',
        }),

    description: Joi.string()
        .max(1000)
        .allow('', null)
        .messages({
            'string.max': 'DESIGNATION_DESCRIPTION_MAX_VALIDATION',
        }),
    level: Joi.number()
        .optional()
        .integer()
        .positive()
        .messages({
            'number.base': 'LEVEL_INVALID',
            'number.integer': 'LEVEL_INVALID',
            'number.positive': 'LEVEL_INVALID',
        }),

    status: Joi.string()
        .valid('active', 'inactive', 'deleted')
        .default('active')
        .messages({
            'any.only': 'DESIGNATION_STATUS_INVALID',
        })
});

const updateSchema = Joi.object({
    departmentId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'DEPARTMENT_ID_REQUIRED',
            'number.base': 'DEPARTMENT_ID_INVALID',
            'number.integer': 'DEPARTMENT_ID_INVALID',
            'number.positive': 'DEPARTMENT_ID_INVALID',
        }),
    id: Joi.number()
        .integer()
        .positive()
        .required(),
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'any.required': 'DESIGNATION_NAME_REQUIRED',
            'string.empty': 'DESIGNATION_NAME_REQUIRED',
            'string.min': 'DESIGNATION_NAME_MIN_VALIDATION',
            'string.max': 'DESIGNATION_NAME_MAX_VALIDATION',
        }),

    code: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'DESIGNATION_CODE_MIN_VALIDATION',
            'string.max': 'DESIGNATION_CODE_MAX_VALIDATION',
        }),

    description: Joi.string()
        .max(1000)
        .allow('', null)
        .messages({
            'string.max': 'DESIGNATION_DESCRIPTION_MAX_VALIDATION',
        }),
    level: Joi.number()
        .optional()
        .integer()
        .positive()
        .messages({
            'number.base': 'LEVEL_INVALID',
            'number.integer': 'LEVEL_INVALID',
            'number.positive': 'LEVEL_INVALID',
        }),
    status: Joi.string()
        .valid('active', 'inactive', 'deleted')
        .messages({
            'any.only': 'DESIGNATION_STATUS_INVALID',
        })
});



export default {
    createSchema,
    updateSchema
};