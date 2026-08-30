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
    async createBulkDepartment(req, res, next) {
        try {
            const result = await departmentRepository.createBulkDepartment(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Bulk department created successfully", status: true });
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
                    result: result,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getDepartmentById(req, res, next) {
        try {
            const { department } = req;
            if (department) {
                return res.status(httpStatus.OK).json({ result: department, message: "Department fetched successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getAllDepartmentStats(req, res, next) {
        try {
            console.log(111111111);
            const result = await departmentRepository.getAllDepartmentStats(req);
            console.log("result", result)
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Department stats fetched successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            console.log("error", error)
            next(error);
        }
    },
    // update department
    async updateDepartment(req, res, next) {
        try {
            const result = await departmentRepository.editDepartment(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Department updated successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async deleteDepartment(req, res, next) {
        try {
            const result = await departmentRepository.deleteDepartment(req);
            if (result) {
                return res.status(200).json({ message: "Department deleted successfully", status: 200, success: true });
            } else {
                return res.status(400).json({ message: "bad request", status: 400, success: false });
            }
        } catch (error) {
            next(error);
        }
    },
};