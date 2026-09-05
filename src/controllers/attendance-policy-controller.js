import httpStatus from 'http-status';
import attendancePolicyRepository from '../repositories/attendance-policy-repository.js';

export default {
    async createPolicy(req, res, next) {
        try {
            const policy = await attendancePolicyRepository.createPolicy(req);
            return res.status(httpStatus.CREATED).json({
                status: true,
                message: 'Attendance policy created successfully',
                result: policy,
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllPolicies(req, res, next) {
        try {
            const result = await attendancePolicyRepository.getAllPolicies(req);
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance policies retrieved successfully',
                result,
            });
        } catch (error) {
            next(error);
        }
    },

    async getPolicyById(req, res, next) {
        try {
            const { id } = req.params;
            const policy = await attendancePolicyRepository.getPolicyById(id);
            if (!policy) {
                return res.status(httpStatus.NOT_FOUND).json({
                    status: false,
                    message: 'Attendance policy not found',
                });
            }
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance policy retrieved successfully',
                result: policy,
            });
        } catch (error) {
            next(error);
        }
    },

    async updatePolicy(req, res, next) {
        try {
            const policy = await attendancePolicyRepository.updatePolicy(req);
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance policy updated successfully',
                result: policy,
            });
        } catch (error) {
            next(error);
        }
    },

    async activatePolicy(req, res, next) {
        try {
            const policy = await attendancePolicyRepository.activatePolicy(req);
            return res.status(httpStatus.OK).json({
                status: true,
                message: 'Attendance policy activated successfully',
                result: policy,
            });
        } catch (error) {
            next(error);
        }
    },
};
