import repositories from '../repositories/index.js';
import httpStatus from 'http-status';

const { employeeRepository } = repositories;

export default {
    async create(req, res, next) {
        try {
            const result = await employeeRepository.createEmployee(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Employee created successfully",
                    status: true,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "bad request",
                    status: false,
                });
            }
        } catch (error) {
            next(error);
        }
    },

    async getAllEmployee(req, res, next) {
        try {
            const result = await employeeRepository.getAllEmployee(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    message: "Employees fetched successfully",
                    status: true,
                    result: result,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "bad request",
                    status: false,
                });
            }
        } catch (error) {
            next(error);
        }
    },

    async getEmployeeById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await employeeRepository.getEmployeeById(id);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Employee fetched successfully",
                    status: true,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "bad request",
                    status: false,
                });
            }
        } catch (error) {
            next(error);
        }
    },

    async updateEmployee(req, res, next) {
        try {
            const result = await employeeRepository.editEmployee(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Employee updated successfully",
                    status: true,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "bad request",
                    status: false,
                });
            }
        } catch (error) {
            next(error);
        }
    },

    async deleteEmployee(req, res, next) {
        try {
            const result = await employeeRepository.deleteEmployee(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    message: "Employee deleted successfully",
                    status: 200,
                    success: true,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "bad request",
                    status: 400,
                    success: false,
                });
            }
        } catch (error) {
            next(error);
        }
    },

    async restoreEmployee(req, res, next) {
        try {
            const result = await employeeRepository.restoreEmployee(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Employee restored successfully",
                    status: true,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "bad request",
                    status: false,
                });
            }
        } catch (error) {
            next(error);
        }
    },

    async updateEmployeeStatus(req, res, next) {
        try {
            const result = await employeeRepository.updateEmployeeStatus(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Employee status updated successfully",
                    status: true,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({
                    message: "bad request",
                    status: false,
                });
            }
        } catch (error) {
            next(error);
        }
    },
};
