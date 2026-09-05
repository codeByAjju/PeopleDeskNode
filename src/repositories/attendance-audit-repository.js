import models from '../models/index.js';
import { Op } from 'sequelize';

const { AttendanceAudit, Employee, User } = models;

export default {
    /**
     * Create an audit log entry
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async log(data) {
        try {
            const {
                attendanceId = null,
                employeeId = null,
                userId = null,
                action,
                ipAddress = null,
                userAgent = null,
                beforeValues = null,
                afterValues = null,
                reason = null,
                status = 'SUCCESS',
                details = null,
                transaction,
            } = data;

            const record = await AttendanceAudit.create(
                {
                    attendanceId,
                    employeeId,
                    userId,
                    action,
                    ipAddress,
                    userAgent,
                    beforeValues,
                    afterValues,
                    reason,
                    status,
                    details,
                },
                transaction ? { transaction } : {},
            );

            return record;
        } catch (error) {
            console.error('AttendanceAuditRepository.log error:', error);
            // Don't crash main operation if audit logging fails
            return null;
        }
    },

    /**
     * Retrieve audit logs with filters and pagination
     * @param {Object} req
     * @returns {Promise<Object>}
     */
    async getAuditLogs(req) {
        try {
            const {
                attendanceId,
                employeeId,
                action,
                status,
                page = 1,
                limit = 20,
                fromDate,
                toDate,
            } = req.query || {};

            const where = {};

            if (attendanceId) where.attendanceId = attendanceId;
            if (employeeId) where.employeeId = employeeId;
            if (action) where.action = action;
            if (status) where.status = status;

            if (fromDate && toDate) {
                where.createdAt = { [Op.between]: [new Date(fromDate), new Date(toDate)] };
            } else if (fromDate) {
                where.createdAt = { [Op.gte]: new Date(fromDate) };
            } else if (toDate) {
                where.createdAt = { [Op.lte]: new Date(toDate) };
            }

            const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
            const safePage = Math.max(parseInt(page, 10) || 1, 1);
            const offset = (safePage - 1) * safeLimit;

            const { count, rows } = await AttendanceAudit.findAndCountAll({
                where,
                include: [
                    {
                        model: Employee,
                        as: 'employee',
                        attributes: ['id', 'employeeCode', 'firstName', 'lastName'],
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
                    },
                ],
                order: [['createdAt', 'DESC']],
                limit: safeLimit,
                offset,
            });

            return {
                logs: rows,
                pagination: {
                    page: safePage,
                    limit: safeLimit,
                    totalItems: count,
                    totalPages: Math.ceil(count / safeLimit),
                },
            };
        } catch (error) {
            console.error('AttendanceAuditRepository.getAuditLogs error:', error);
            throw error;
        }
    },
};
