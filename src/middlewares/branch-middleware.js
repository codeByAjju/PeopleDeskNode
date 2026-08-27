import { Op } from 'sequelize';
import countryRepository from '../repositories/country-repository.js';
import stateRepository from '../repositories/state-repository.js';
import cityRepository from '../repositories/city-repository.js';
import branchRepository from '../repositories/branch-repository.js';
export default {

    async checkCountryIdExist(req, res, next) {
        try {
            const { countryId } = req.params;

            if (!countryId) {
                return res.status(400).json({
                    success: false,
                    message: "Country ID is required",
                });
            }
            const result = await countryRepository.findOne({
                id: countryId,
                status: 'active',
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Country does not exist",
                });
            }
            req.country = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkStateIdExist(req, res, next) {
        try {
            const { stateId } = req.params;

            if (!stateId) {
                return res.status(400).json({
                    success: false,
                    message: "State ID is required",
                });
            }
            const result = await stateRepository.findOne({
                id: stateId,
                status: 'active',
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "State does not exist",
                });
            }
            req.state = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkCityIdExist(req, res, next) {
        try {
            const { cityId } = req.params;

            if (!cityId) {
                return res.status(400).json({
                    success: false,
                    message: "City ID is required",
                });
            }
            const result = await cityRepository.findOne({
                id: cityId,
                status: 'active',
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "City does not exist",
                });
            }
            req.city = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkBranchNameExist(req, res, next) {
        try {
            const { name } = req.body;

            const result = await branchRepository.findOne({
                name: name,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Branch name already exists',
                });
            }
            req.branch = result;
            next();
        } catch (error) {
            next(error);
        }
    },
    async checkBranchCodeExist(req, res, next) {
        try {
            const { code } = req.body;

            const result = await branchRepository.findOne({
                code: code,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Branch code already exists',
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },
    async checkBranchIdExist(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Branch ID is required",
                });
            }
            const result = await branchRepository.findOne({
                id: id,
                // status: 'active',
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Branch does not exist",
                });
            }
            req.branch = result;
            next();
        } catch (error) {
            next(error);
        }
    },
    async checkUpdateBranchNameExist(req, res, next) {
        try {
            const { name } = req.body;
            const { id } = req.params;
            const result = await branchRepository.findOne({
                id: { [Op.ne]: id },
                name: name
                // status: 'active',
            });
            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Branch name already exists',
                });
            }
            req.branch = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkUpdateCodeNameExist(req, res, next) {
        try {
            const { code } = req.body;
            const { id } = req.params;
            const result = await branchRepository.findOne({
                id: { [Op.ne]: id },
                code: code
                // status: 'active',
            });
            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Branch code already exists',
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },
}