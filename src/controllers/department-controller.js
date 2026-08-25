import models from '../models/index.js';
import services from '../services/jwt.js';
import repositories from '../repositories/index.js';
import httpStatus, { status } from 'http-status';
import model from '../models/index.js';

const { departmentRepository } = repositories;
const { department } = models;

export default {
    async create(req, res, next) {
        try {
            const result = await departmentRepository.createDepartment(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Department created successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getAllDepartment(req, res, next) {
        try {
            const result = await departmentRepository.getAllDepartment(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    message: "Departments fetched successfully",
                    status: true,
                    result: result.rows,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getAllDepartmentByCompanyId(req, res, next) {
        try {
            const result = await departmentRepository.getAllDepartmentByCompanyId(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    message: "Departments fetched successfully",
                    status: true,
                    result: result.rows,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    // async getCompanyById(req, res, next) {
    //     try {
    //         const { company } = req;
    //         return res.status(httpStatus.OK).json({
    //             message: "Company fetched successfully",
    //             status: true,
    //             result: company,
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    // async updateCompany(req, res, next) {
    //     try {
    //         const result = await departmentRepository.editCompany(req);
    //         if (result) {
    //             return res.status(httpStatus.OK).json({ result: result, message: "Company updated successfully", status: true });
    //         } else {
    //             return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
    //         }
    //     } catch (error) {
    //         next(error);
    //     }
    // },
    // async deleteCompany(req, res, next) {
    //     try {
    //         req.body.status = 'deleted';
    //         await departmentRepository.deleteCompany(req);
    //         return res.status(httpStatus.OK).json({ result: [], message: "Company deleted successfully", status: true });
    //     } catch (error) {
    //         next(error);
    //     }
    // },
};