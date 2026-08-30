import models from '../models/index.js';
import services from '../services/jwt.js';
import repositories from '../repositories/index.js';
import httpStatus, { status } from 'http-status';
import model from '../models/index.js';

const { designationRepository } = repositories;
const { designation } = models;

export default {
    async create(req, res, next) {
        try {
            const result = await designationRepository.createDesignation(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Designation created successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getAllDesignation(req, res, next) {
        try {
            const result = await designationRepository.getAllDesignation(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    message: "Designations fetched successfully",
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
    async getDesignationById(req, res, next) {
        try {
            const { designation } = req;
            if (designation) {
                return res.status(httpStatus.OK).json({ result: designation, message: "Designation fetched successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    // // update department
    async updateDesignation(req, res, next) {
        try {
            const result = await designationRepository.editDesignation(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Designation updated successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async deleteDesignation(req, res, next) {
        try {
            const result = await designationRepository.deleteDesignation(req);
            if (result) {
                return res.status(200).json({ message: "Designation deleted successfully", status: 200, success: true });
            } else {
                return res.status(400).json({ message: "bad request", status: 400, success: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async restoreDesignation(req, res, next) {
        try {
            const result = await designationRepository.restoreDesignation(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Designation restored successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getDesignationByDepartment(req, res, next) {
        try {
            const { department } = req;
            const result = await designationRepository.getDesignationByDepartment(department.id);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Designations fetched successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getAllDesignationStats(req, res, next) {
        try {
            const result = await designationRepository.getAllDesignationStats(req);
            if (result) {
                return res.status(200).json({ result: result, message: "Designation stats fetched successfully", status: true });
            } else {
                return res.status(400).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
};