import { Op } from 'sequelize';
import shiftRepository from '../repositories/shift-repository.js';

export default {
    async checkShiftIdExist(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Shift ID is required",
                });
            }

            const result = await shiftRepository.findOne({
                id,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Shift does not exist",
                });
            }

            req.shift = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkShiftNameExist(req, res, next) {
        try {
            const { name } = req.body;

            const result = await shiftRepository.findOne({
                name,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Shift name already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkShiftCodeExist(req, res, next) {
        try {
            const { code } = req.body;

            const result = await shiftRepository.findOne({
                code,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Shift code already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkUpdateShiftNameExist(req, res, next) {
        try {
            const { name } = req.body;
            const { id } = req.params;

            const result = await shiftRepository.findOne({
                id: { [Op.ne]: id },
                name,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Shift name already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkUpdateShiftCodeExist(req, res, next) {
        try {
            const { code } = req.body;
            const { id } = req.params;

            const result = await shiftRepository.findOne({
                id: { [Op.ne]: id },
                code,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Shift code already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkEmployeesAssignedToShift(req, res, next) {
        try {
            const { id } = req.params;
            const employeeCount = await shiftRepository.getEmployeeCountByShift(id);

            if (employeeCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete shift. There are ${employeeCount} active employee(s) assigned to this shift.`,
                    employeeCount,
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },
};
