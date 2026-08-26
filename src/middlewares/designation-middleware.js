import { Op } from 'sequelize';
import designationRepository from '../repositories/designation-repository.js';
import departmentRepository from '../repositories/department-repository.js';
export default {
    async checkDesignationIdExist(req, res, next) {
        try {
            const { id } = req.params;


            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Designation ID is required",
                });
            }
            const result = await designationRepository.findOne({
                id,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Designation does not exist",
                });
            }
            req.designation = result;
            next();
        } catch (error) {
            next(error);
        }
    },


    async checkDesignationNameExist(req, res, next) {
        try {
            const { name } = req.body;

            const result = await designationRepository.findOne({
                name,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Designation name already exists',
                });
            }
            req.designation = result;
            next();
        } catch (error) {
            next(error);
        }
    },
    async checkCodeNameExist(req, res, next) {
        try {
            const { code } = req.body;

            const result = await designationRepository.findOne({
                code,
                status: 'active',
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Designation code already exists',
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkDesignationIsNotDeleted(req, res, next) {
        try {
            if (!req.designation) {
                return res.status(404).json({
                    success: false,
                    message: "Designation does not exist",
                });
            }

            if (req.designation.status === "deleted") {
                return res.status(404).json({
                    success: false,
                    message: "Designation does not exist",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkDepartmentIdExist(req, res, next) {
        try {
            const departmentId = req?.body?.departmentId || req?.params?.departmentId;

            if (!departmentId) {
                return res.status(400).json({
                    success: false,
                    message: "Department ID is required",
                });
            }

            const result = await departmentRepository.findOne({
                id: departmentId,
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

    async checkUpdateDesignationNameExist(req, res, next) {
        try {
            const { name } = req.body;
            const { id } = req.params;

            const result = await designationRepository.findOne({
                name,
                id: { [Op.ne]: Number(id) },
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Designation name already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkUpdateCodeNameExist(req, res, next) {
        try {
            const { code } = req.body;
            const { id } = req.params;

            const result = await designationRepository.findOne({
                code,
                id: { [Op.ne]: Number(id) },
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Designation code already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },
};
