import Joi from 'joi';

const checkInSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).allow(null, '').empty('').optional(),
    longitude: Joi.number().min(-180).max(180).allow(null, '').empty('').optional(),
    remarks: Joi.string().max(500).allow('', null).optional(),
    // Any employee-supplied employeeId/timestamps are rejected or stripped by schema / controller
}).unknown(true);

const checkOutSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).allow(null, '').empty('').optional(),
    longitude: Joi.number().min(-180).max(180).allow(null, '').empty('').optional(),
    remarks: Joi.string().max(500).allow('', null).optional(),
}).unknown(true);

const listSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    offset: Joi.number().integer().min(0).optional(),
    search: Joi.string().max(100).allow('', null).optional(),
    q: Joi.string().max(100).allow('', null).optional(),
    status: Joi.string().valid('present', 'late', 'half_day', 'absent', 'leave', 'holiday', 'week_off', 'pending', 'corrected', 'all').optional(),
    employeeId: Joi.number().integer().positive().optional(),
    departmentId: Joi.number().integer().positive().optional(),
    designationId: Joi.number().integer().positive().optional(),
    branchId: Joi.number().integer().positive().optional(),
    locationId: Joi.number().integer().positive().optional(),
    shiftId: Joi.number().integer().positive().optional(),
    date: Joi.string().isoDate().optional(),
    fromDate: Joi.string().optional(),
    toDate: Joi.string().optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional(),
    sortType: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional(),
    order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional(),
    filters: Joi.alternatives().try(Joi.object(), Joi.string()).optional(),
}).unknown(true);

const updateSchema = Joi.object({
    id: Joi.number().integer().positive().optional(),
    date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    checkIn: Joi.date().iso().allow(null).optional(),
    checkOut: Joi.date().iso().allow(null).optional(),
    status: Joi.string().valid('present', 'late', 'half_day', 'absent', 'leave', 'holiday', 'week_off', 'pending', 'corrected').optional(),
    remarks: Joi.string().max(500).allow('', null).optional(),
    correctionReason: Joi.string().min(3).max(500).required().messages({
        'any.required': 'CORRECTION_REASON_REQUIRED',
        'string.empty': 'CORRECTION_REASON_REQUIRED',
        'string.min': 'CORRECTION_REASON_MIN_LENGTH',
    }),
}).unknown(true);

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
}).unknown(true);

const employeeIdParamSchema = Joi.object({
    employeeId: Joi.number().integer().positive().required(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    fromDate: Joi.string().optional(),
    toDate: Joi.string().optional(),
    status: Joi.string().optional(),
}).unknown(true);

export default {
    checkInSchema,
    checkOutSchema,
    listSchema,
    updateSchema,
    idParamSchema,
    employeeIdParamSchema,
};
