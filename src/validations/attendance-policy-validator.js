import Joi from 'joi';

const createSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'any.required': 'POLICY_NAME_REQUIRED',
        'string.empty': 'POLICY_NAME_REQUIRED',
        'string.min': 'POLICY_NAME_MIN_LENGTH',
        'string.max': 'POLICY_NAME_MAX_LENGTH',
    }),

    gracePeriodMinutes: Joi.number().integer().min(0).default(15).optional().messages({
        'number.min': 'GRACE_PERIOD_MUST_BE_NON_NEGATIVE',
    }),

    halfDayMinutes: Joi.number().integer().greater(0).default(240).required().messages({
        'any.required': 'HALF_DAY_MINUTES_REQUIRED',
        'number.greater': 'HALF_DAY_MINUTES_MUST_BE_POSITIVE',
    }),

    fullDayMinutes: Joi.number().integer().greater(0).default(480).required().messages({
        'any.required': 'FULL_DAY_MINUTES_REQUIRED',
        'number.greater': 'FULL_DAY_MINUTES_MUST_BE_POSITIVE',
    }),

    earlyLeaveGraceMinutes: Joi.number().integer().min(0).default(15).optional().messages({
        'number.min': 'EARLY_LEAVE_GRACE_MUST_BE_NON_NEGATIVE',
    }),

    overtimeEnabled: Joi.boolean().default(false).optional(),

    overtimeGraceMinutes: Joi.number().integer().min(0).default(30).optional().messages({
        'number.min': 'OVERTIME_GRACE_MUST_BE_NON_NEGATIVE',
    }),

    locationRequired: Joi.boolean().default(true).optional(),

    geofenceEnabled: Joi.boolean().default(true).optional(),

    maxGpsAccuracyMeters: Joi.number().integer().greater(0).allow(null).optional().messages({
        'number.greater': 'MAX_GPS_ACCURACY_MUST_BE_POSITIVE',
    }),

    isActive: Joi.boolean().default(true).optional(),

    effectiveFrom: Joi.string().isoDate().allow('', null).optional(),

    effectiveTo: Joi.string().isoDate().allow('', null).optional(),
}).unknown(true).custom((value, helpers) => {
    if (value.halfDayMinutes && value.fullDayMinutes && value.halfDayMinutes > value.fullDayMinutes) {
        return helpers.message('HALF_DAY_CANNOT_EXCEED_FULL_DAY');
    }
    return value;
});

const updateSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    gracePeriodMinutes: Joi.number().integer().min(0).optional(),
    halfDayMinutes: Joi.number().integer().greater(0).optional(),
    fullDayMinutes: Joi.number().integer().greater(0).optional(),
    earlyLeaveGraceMinutes: Joi.number().integer().min(0).optional(),
    overtimeEnabled: Joi.boolean().optional(),
    overtimeGraceMinutes: Joi.number().integer().min(0).optional(),
    locationRequired: Joi.boolean().optional(),
    geofenceEnabled: Joi.boolean().optional(),
    maxGpsAccuracyMeters: Joi.number().integer().greater(0).allow(null).optional(),
    isActive: Joi.boolean().optional(),
    effectiveFrom: Joi.string().isoDate().allow('', null).optional(),
    effectiveTo: Joi.string().isoDate().allow('', null).optional(),
    reason: Joi.string().max(500).allow('', null).optional(),
}).unknown(true).custom((value, helpers) => {
    if (value.halfDayMinutes && value.fullDayMinutes && value.halfDayMinutes > value.fullDayMinutes) {
        return helpers.message('HALF_DAY_CANNOT_EXCEED_FULL_DAY');
    }
    return value;
});

const activateSchema = Joi.object({
    effectiveFrom: Joi.string().isoDate().allow('', null).optional(),
    reason: Joi.string().max(500).allow('', null).optional(),
}).unknown(true);

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
}).unknown(true);

export default {
    createSchema,
    updateSchema,
    activateSchema,
    idParamSchema,
};
