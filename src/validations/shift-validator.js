import Joi from 'joi';

const createSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'any.required': 'SHIFT_NAME_REQUIRED',
            'string.empty': 'SHIFT_NAME_REQUIRED',
            'string.min': 'SHIFT_NAME_MIN_VALIDATION',
            'string.max': 'SHIFT_NAME_MAX_VALIDATION',
        }),

    code: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'SHIFT_CODE_REQUIRED',
            'string.empty': 'SHIFT_CODE_REQUIRED',
            'string.min': 'SHIFT_CODE_MIN_VALIDATION',
            'string.max': 'SHIFT_CODE_MAX_VALIDATION',
        }),

    startTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .required()
        .messages({
            'any.required': 'SHIFT_START_TIME_REQUIRED',
            'string.empty': 'SHIFT_START_TIME_REQUIRED',
            'string.pattern.base': 'SHIFT_START_TIME_INVALID_FORMAT',
        }),

    endTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .required()
        .messages({
            'any.required': 'SHIFT_END_TIME_REQUIRED',
            'string.empty': 'SHIFT_END_TIME_REQUIRED',
            'string.pattern.base': 'SHIFT_END_TIME_INVALID_FORMAT',
        }),

    breakDuration: Joi.number()
        .integer()
        .min(0)
        .max(480)
        .default(0)
        .messages({
            'number.base': 'SHIFT_BREAK_DURATION_INVALID',
            'number.integer': 'SHIFT_BREAK_DURATION_INVALID',
            'number.min': 'SHIFT_BREAK_DURATION_MIN_VALIDATION',
            'number.max': 'SHIFT_BREAK_DURATION_MAX_VALIDATION',
        }),

    workingHours: Joi.number()
        .positive()
        .max(24)
        .required()
        .messages({
            'any.required': 'SHIFT_WORKING_HOURS_REQUIRED',
            'number.base': 'SHIFT_WORKING_HOURS_INVALID',
            'number.positive': 'SHIFT_WORKING_HOURS_INVALID',
            'number.max': 'SHIFT_WORKING_HOURS_MAX_VALIDATION',
        }),

    status: Joi.string()
        .valid('active', 'inactive', 'deleted')
        .default('active')
        .messages({
            'any.only': 'SHIFT_STATUS_INVALID',
        }),
});

const updateSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'any.required': 'SHIFT_ID_REQUIRED',
            'number.base': 'SHIFT_ID_INVALID',
            'number.integer': 'SHIFT_ID_INVALID',
            'number.positive': 'SHIFT_ID_INVALID',
        }),

    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'any.required': 'SHIFT_NAME_REQUIRED',
            'string.empty': 'SHIFT_NAME_REQUIRED',
            'string.min': 'SHIFT_NAME_MIN_VALIDATION',
            'string.max': 'SHIFT_NAME_MAX_VALIDATION',
        }),

    code: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'SHIFT_CODE_REQUIRED',
            'string.empty': 'SHIFT_CODE_REQUIRED',
            'string.min': 'SHIFT_CODE_MIN_VALIDATION',
            'string.max': 'SHIFT_CODE_MAX_VALIDATION',
        }),

    startTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .required()
        .messages({
            'any.required': 'SHIFT_START_TIME_REQUIRED',
            'string.empty': 'SHIFT_START_TIME_REQUIRED',
            'string.pattern.base': 'SHIFT_START_TIME_INVALID_FORMAT',
        }),

    endTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .required()
        .messages({
            'any.required': 'SHIFT_END_TIME_REQUIRED',
            'string.empty': 'SHIFT_END_TIME_REQUIRED',
            'string.pattern.base': 'SHIFT_END_TIME_INVALID_FORMAT',
        }),

    breakDuration: Joi.number()
        .integer()
        .min(0)
        .max(480)
        .messages({
            'number.base': 'SHIFT_BREAK_DURATION_INVALID',
            'number.integer': 'SHIFT_BREAK_DURATION_INVALID',
            'number.min': 'SHIFT_BREAK_DURATION_MIN_VALIDATION',
            'number.max': 'SHIFT_BREAK_DURATION_MAX_VALIDATION',
        }),

    workingHours: Joi.number()
        .positive()
        .max(24)
        .required()
        .messages({
            'any.required': 'SHIFT_WORKING_HOURS_REQUIRED',
            'number.base': 'SHIFT_WORKING_HOURS_INVALID',
            'number.positive': 'SHIFT_WORKING_HOURS_INVALID',
            'number.max': 'SHIFT_WORKING_HOURS_MAX_VALIDATION',
        }),

    status: Joi.string()
        .valid('active', 'inactive', 'deleted')
        .messages({
            'any.only': 'SHIFT_STATUS_INVALID',
        }),
});

const detailAndDeleteSchema = {
    params: Joi.object().keys({
        id: Joi.number()
            .integer()
            .greater(0)
            .required()
            .messages({
                'any.required': 'SHIFT_ID_REQUIRED',
                'number.base': 'SHIFT_ID_INVALID',
                'number.integer': 'SHIFT_ID_INVALID',
                'number.greater': 'SHIFT_ID_INVALID',
            }),
    }),
};

export default {
    createSchema,
    updateSchema,
    detailAndDeleteSchema,
};
