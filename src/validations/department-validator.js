import Joi from 'joi';

const createSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'any.required': 'DEPARTMENT_NAME_REQUIRED',
            'string.empty': 'DEPARTMENT_NAME_REQUIRED',
            'string.min': 'DEPARTMENT_NAME_MIN_VALIDATION',
            'string.max': 'DEPARTMENT_NAME_MAX_VALIDATION',
        }),
    code: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'DEPARTMENT_CODE_REQUIRED',
            'string.empty': 'DEPARTMENT_CODE_REQUIRED',
            'string.min': 'DEPARTMENT_CODE_MIN_VALIDATION',
            'string.max': 'DEPARTMENT_CODE_MAX_VALIDATION',
        }),

    description: Joi.string()
        .max(1000)
        .allow('', null)
        .messages({
            'string.max': 'DEPARTMENT_DESCRIPTION_MAX_VALIDATION',
        }),

    status: Joi.string()
        .valid('active', 'inactive')
        .default('active')
        .messages({
            'any.only': 'DEPARTMENT_STATUS_INVALID',
        })
});

const updateSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'any.required': 'DEPARTMENT_NAME_REQUIRED',
            'string.empty': 'DEPARTMENT_NAME_REQUIRED',
            'string.min': 'DEPARTMENT_NAME_MIN_VALIDATION',
            'string.max': 'DEPARTMENT_NAME_MAX_VALIDATION',
        }),

    code: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'DEPARTMENT_CODE_REQUIRED',
            'string.empty': 'DEPARTMENT_CODE_REQUIRED',
            'string.min': 'DEPARTMENT_CODE_MIN_VALIDATION',
            'string.max': 'DEPARTMENT_CODE_MAX_VALIDATION',
        }),

    description: Joi.string()
        .max(1000)
        .allow('', null)
        .messages({
            'string.max': 'DEPARTMENT_DESCRIPTION_MAX_VALIDATION',
        }),

    status: Joi.string()
        .valid('active', 'inactive')
        .messages({
            'any.only': 'DEPARTMENT_STATUS_INVALID',
        }),

    companyId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'COMPANY_ID_REQUIRED',
            'number.base': 'COMPANY_ID_INVALID',
            'number.integer': 'COMPANY_ID_INVALID',
            'number.positive': 'COMPANY_ID_INVALID',
        }),
});

const detailAndDeleteSchema = {
    params: Joi.object().keys({
        id: Joi.number()
            .integer()
            .greater(0)
            .required()
            .messages({
                'any.required': 'DEPARTMENT_ID_REQUIRED',
                'number.base': 'DEPARTMENT_ID_INVALID',
                'number.integer': 'DEPARTMENT_ID_INVALID',
                'number.greater': 'DEPARTMENT_ID_INVALID',
            }),
    }),
};

const updateDepartmentSchema = {
    params: Joi.object({
        id: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                'any.required': 'DEPARTMENT_ID_REQUIRED',
                'number.base': 'DEPARTMENT_ID_INVALID',
                'number.integer': 'DEPARTMENT_ID_INVALID',
                'number.positive': 'DEPARTMENT_ID_INVALID',
            }),
    }),

    body: updateSchema,
};

export default {
    createSchema,
    updateDepartmentSchema,
    detailAndDeleteSchema,
};