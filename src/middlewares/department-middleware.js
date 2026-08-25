import { Op } from 'sequelize';
import departmentRepository from '../repositories/department-repository.js';
import companyRepository from '../repositories/company-repository.js';
export default {
    async checkCompanyIdExist(req, res, next) {
        try {
            const { companyId } = req.body || req.params;

            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: "Company ID is required",
                });
            }
            const id = companyId;
            const result = await companyRepository.findOne({
                id,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Company does not exist",
                });
            }
            req.company = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkDepartmentNameExist(req, res, next) {
        try {
            const { name } = req.body;

            const result = await departmentRepository.findOne({
                name,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Department already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkDepartmentIsNotDeleted(req, res, next) {
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

    async checkDepartmentIdExist(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Department ID is required",
                });
            }

            const result = await departmentRepository.findOne({
                id,
                status: 'active',
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Department does not exist",
                });
            }

            req.department = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkUpdateDepartmentNameExist(req, res, next) {
        try {
            const { name } = req.body;
            const { id } = req.params;

            const result = await departmentRepository.findOne({
                name,
                id: { [Op.ne]: Number(id) },
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Department name already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },
};
