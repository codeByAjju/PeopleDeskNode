import models from '../models/index.js';
import attendanceAuditRepository from './attendance-audit-repository.js';
import { extractClientIp, extractUserAgent, formatDateYMD } from '../utils/attendance-helper.js';
import { Op } from 'sequelize';

const { AttendancePolicy, sequelize } = models;

const DEFAULT_FALLBACK_POLICY = {
    id: null,
    name: 'Default System Policy',
    gracePeriodMinutes: 15,
    halfDayMinutes: 240,
    fullDayMinutes: 480,
    earlyLeaveGraceMinutes: 15,
    overtimeEnabled: false,
    overtimeGraceMinutes: 30,
    locationRequired: false,
    geofenceEnabled: false,
    maxGpsAccuracyMeters: null,
    isActive: true,
    effectiveFrom: '2000-01-01',
    effectiveTo: null,
};

export default {
    /**
     * Get the active/effective policy for a given date (YYYY-MM-DD)
     */
    async getEffectivePolicy(targetDate = null, transaction = null) {
        try {
            const dateStr = targetDate ? String(targetDate) : formatDateYMD(new Date());

            const policy = await AttendancePolicy.findOne({
                where: {
                    isActive: true,
                    statusRecord: { [Op.ne]: 'deleted' },
                    effectiveFrom: { [Op.lte]: dateStr },
                    [Op.or]: [
                        { effectiveTo: null },
                        { effectiveTo: { [Op.gte]: dateStr } },
                    ],
                },
                order: [['effectiveFrom', 'DESC'], ['id', 'DESC']],
                transaction,
            });

            if (policy) {
                return policy;
            }

            // Fallback to any active policy if date range doesn't strictly match
            const anyActive = await AttendancePolicy.findOne({
                where: {
                    isActive: true,
                    statusRecord: { [Op.ne]: 'deleted' },
                },
                order: [['id', 'DESC']],
                transaction,
            });

            if (anyActive) {
                return anyActive;
            }

            return DEFAULT_FALLBACK_POLICY;
        } catch (error) {
            console.error('getEffectivePolicy error:', error);
            return DEFAULT_FALLBACK_POLICY;
        }
    },

    /**
     * Create a new attendance policy (Ensures single active policy at a time)
     */
    async createPolicy(req) {
        const transaction = await sequelize.transaction();
        try {
            const { body, user } = req;
            const effectiveFrom = body.effectiveFrom || formatDateYMD(new Date());

            if (body.isActive !== false) {
                // Deactivate or close effective range of previous active policies
                const prevActivePolicies = await AttendancePolicy.findAll({
                    where: {
                        isActive: true,
                        statusRecord: { [Op.ne]: 'deleted' },
                    },
                    transaction,
                });

                for (const prevPolicy of prevActivePolicies) {
                    await prevPolicy.update(
                        {
                            isActive: false,
                            effectiveTo: prevPolicy.effectiveFrom > effectiveFrom ? prevPolicy.effectiveFrom : effectiveFrom,
                        },
                        { transaction },
                    );
                }
            }

            const policy = await AttendancePolicy.create(
                {
                    name: body.name,
                    gracePeriodMinutes: body.gracePeriodMinutes ?? 15,
                    halfDayMinutes: body.halfDayMinutes ?? 240,
                    fullDayMinutes: body.fullDayMinutes ?? 480,
                    earlyLeaveGraceMinutes: body.earlyLeaveGraceMinutes ?? 15,
                    overtimeEnabled: body.overtimeEnabled ?? false,
                    overtimeGraceMinutes: body.overtimeGraceMinutes ?? 30,
                    locationRequired: body.locationRequired ?? true,
                    geofenceEnabled: body.geofenceEnabled ?? true,
                    maxGpsAccuracyMeters: body.maxGpsAccuracyMeters ?? null,
                    isActive: body.isActive !== false,
                    effectiveFrom,
                    effectiveTo: body.effectiveTo || null,
                    statusRecord: 'active',
                },
                { transaction },
            );

            // Audit logging
            await attendanceAuditRepository.log({
                userId: user?.id,
                action: 'POLICY_CREATE',
                ipAddress: extractClientIp(req),
                userAgent: extractUserAgent(req),
                afterValues: policy.toJSON(),
                reason: body.reason || 'Created new Attendance Policy',
                transaction,
            });

            await transaction.commit();
            return policy;
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.error('createPolicy error:', error);
            throw error;
        }
    },

    /**
     * Get all policies with pagination and filtering
     */
    async getAllPolicies(req) {
        try {
            const { page = 1, limit = 10, search, status } = req.query || {};
            const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
            const safePage = Math.max(1, parseInt(page, 10) || 1);
            const safeOffset = (safePage - 1) * safeLimit;

            const where = {
                statusRecord: { [Op.ne]: 'deleted' },
            };

            if (search) {
                where.name = { [Op.like]: `%${search}%` };
            }

            if (status === 'active') {
                where.isActive = true;
            } else if (status === 'inactive') {
                where.isActive = false;
            }

            const { rows, count } = await AttendancePolicy.findAndCountAll({
                where,
                limit: safeLimit,
                offset: safeOffset,
                order: [['id', 'DESC']],
            });

            return {
                policies: rows,
                pagination: {
                    page: safePage,
                    limit: safeLimit,
                    totalItems: count,
                    totalPages: Math.ceil(count / safeLimit),
                },
            };
        } catch (error) {
            console.error('getAllPolicies error:', error);
            throw error;
        }
    },

    /**
     * Get policy details by ID
     */
    async getPolicyById(id) {
        try {
            return await AttendancePolicy.findByPk(id);
        } catch (error) {
            console.error('getPolicyById error:', error);
            throw error;
        }
    },

    /**
     * Update an attendance policy
     */
    async updatePolicy(req) {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { body, user } = req;

            const policy = await AttendancePolicy.findByPk(id, { transaction });
            if (!policy) {
                const error = new Error('Attendance Policy not found');
                error.statusCode = 404;
                throw error;
            }

            const beforeValues = policy.toJSON();

            if (body.isActive === true && !policy.isActive) {
                // If setting active, deactivate other policies
                await AttendancePolicy.update(
                    { isActive: false, effectiveTo: formatDateYMD(new Date()) },
                    {
                        where: { id: { [Op.ne]: id }, isActive: true },
                        transaction,
                    },
                );
            }

            // Whitelist model fields — exclude non-column fields like 'reason'
            const UPDATABLE_FIELDS = [
                'name', 'gracePeriodMinutes', 'halfDayMinutes', 'fullDayMinutes',
                'earlyLeaveGraceMinutes', 'overtimeEnabled', 'overtimeGraceMinutes',
                'locationRequired', 'geofenceEnabled', 'maxGpsAccuracyMeters',
                'isActive', 'effectiveFrom', 'effectiveTo',
            ];
            const updatePayload = {};
            for (const field of UPDATABLE_FIELDS) {
                if (body[field] !== undefined) {
                    updatePayload[field] = body[field];
                }
            }

            await policy.update(updatePayload, { transaction });

            // Audit log
            await attendanceAuditRepository.log({
                userId: user?.id,
                action: 'POLICY_UPDATE',
                ipAddress: extractClientIp(req),
                userAgent: extractUserAgent(req),
                beforeValues,
                afterValues: policy.toJSON(),
                reason: body.reason || `Updated policy #${id}`,
                transaction,
            });

            await transaction.commit();
            return policy;
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.error('updatePolicy error:', error);
            throw error;
        }
    },

    /**
     * Activate a specific policy
     */
    async activatePolicy(req) {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { body, user } = req;

            const policy = await AttendancePolicy.findByPk(id, { transaction });
            if (!policy) {
                const error = new Error('Attendance Policy not found');
                error.statusCode = 404;
                throw error;
            }

            const beforeValues = policy.toJSON();
            const effectiveFrom = body.effectiveFrom || formatDateYMD(new Date());

            // Deactivate all other active policies
            await AttendancePolicy.update(
                { isActive: false, effectiveTo: effectiveFrom },
                {
                    where: { id: { [Op.ne]: id }, isActive: true },
                    transaction,
                },
            );

            await policy.update(
                {
                    isActive: true,
                    effectiveFrom,
                    effectiveTo: null,
                },
                { transaction },
            );

            // Audit log
            await attendanceAuditRepository.log({
                userId: user?.id,
                action: 'POLICY_ACTIVATE',
                ipAddress: extractClientIp(req),
                userAgent: extractUserAgent(req),
                beforeValues,
                afterValues: policy.toJSON(),
                reason: body.reason || `Activated policy #${id}`,
                transaction,
            });

            await transaction.commit();
            return policy;
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            console.error('activatePolicy error:', error);
            throw error;
        }
    },
};
