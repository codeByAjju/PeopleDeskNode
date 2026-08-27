import { Op } from 'sequelize';
import locationRepository from '../repositories/location-repository.js';
import branchRepository from '../repositories/branch-repository.js';
import countryRepository from '../repositories/country-repository.js';
import stateRepository from '../repositories/state-repository.js';
import cityRepository from '../repositories/city-repository.js';

export default {
    async checkBranchIdExist(req, res, next) {
        try {
            const branchId = req.params.branchId || req.body.branchId;

            if (!branchId) {
                return res.status(400).json({
                    success: false,
                    message: "Branch ID is required",
                });
            }

            const result = await branchRepository.findOne({
                id: branchId,
                status: 'active',
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Branch does not exist or is inactive",
                });
            }

            req.branch = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkLocationIdExist(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Location ID is required",
                });
            }

            const result = await locationRepository.findOne({
                id,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Location does not exist",
                });
            }

            req.location = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkLocationNameExist(req, res, next) {
        try {
            const { name } = req.body;

            const result = await locationRepository.findOne({
                name,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Location name already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkLocationCodeExist(req, res, next) {
        try {
            const { code } = req.body;

            const result = await locationRepository.findOne({
                code,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Location code already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkUpdateLocationNameExist(req, res, next) {
        try {
            const { name } = req.body;
            const { id } = req.params;

            const result = await locationRepository.findOne({
                id: { [Op.ne]: id },
                name,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Location name already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkUpdateLocationCodeExist(req, res, next) {
        try {
            const { code } = req.body;
            const { id } = req.params;

            const result = await locationRepository.findOne({
                id: { [Op.ne]: id },
                code,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Location code already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkEmployeesAssignedToLocation(req, res, next) {
        try {
            const { id } = req.params;
            const employeeCount = await locationRepository.getEmployeeCountByLocation(id);

            if (employeeCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete location. There are ${employeeCount} active employee(s) assigned to this location.`,
                    employeeCount,
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },
};
