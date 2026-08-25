import { Op } from 'sequelize';
import companyRepository from '../repositories/company-repository.js';

export default {
    async checkCompanyNameExist(req, res, next) {
        try {
            const {
                body: { name },
                params: { id },
            } = req;

            const where = {
                name: name.trim(),
            };
            if (id) {
                where.id = {
                    [Op.ne]: id,
                };
            }

            const result = await companyRepository.findOne(where);

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: "Company name already exists",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },
    async checkCompanyCodeExist(req, res, next) {
        try {
            const {
                body: { code },
                params: { id },
            } = req;

            const where = {
                code: code.trim(),
            };
            if (id) {
                where.id = {
                    [Op.ne]: id,
                };
            }

            const result = await companyRepository.findOne(where);

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: "Company code already exists",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },
    async checkCompanyEmailExist(req, res, next) {
        try {
            const {
                body: { email },
                params: { id },
            } = req;

            const where = {
                email: email.trim(),
            };
            if (id) {
                where.id = {
                    [Op.ne]: id,
                };
            }

            const result = await companyRepository.findOne(where);

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: "Company email already exists",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },
    async checkCompanyIdExist(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Company ID is required",
                });
            }

            const result = await companyRepository.findOne({
                id,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Company not found",
                });
            }
            req.company = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkUpdateMediaExist(req, res, next) {
        try {
            const {
                body: { logo },
                user: { id }, params,
            } = req;
            const where = { id: id ?? params?.id };
            if (logo) {
                // where.logo = logo;
            }
            const result = await companyRepository.findOne(where);
            if (result) {
                Object.assign(req.params, {
                    basePathArray: [],
                    mediaFor: 'company',
                    isUpdate: 'yes',
                });
                next();
            } else {
                Object.assign(req.params, {
                    basePathArray: [logo],
                    mediaFor: 'company',
                    isUpdate: 'yes',
                });
                next();
            }
        } catch (error) {
            next(error);
        }
    },

    async checkCompanyIsNotDeleted(req, res, next) {
        try {
            if (!req.company) {
                return res.status(404).json({
                    success: false,
                    message: "Company does not exist",
                });
            }

            if (req.company.status === "deleted") {
                return res.status(404).json({
                    success: false,
                    message: "Company does not exist",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },
};
