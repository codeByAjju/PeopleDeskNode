import models from '../models/index.js';
import services from '../services/jwt.js';
import repositories from '../repositories/index.js';
import httpStatus, { status } from 'http-status';
import model from '../models/index.js';

const { branchRepository } = repositories;
const { branch } = models;

export default {
    async create(req, res, next) {
        try {
            const result = await branchRepository.createBranch(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Branch created successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getAllBranch(req, res, next) {
        try {
            const result = await branchRepository.getAllBranch(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    message: "Branches fetched successfully",
                    status: true,
                    result: result.branches,
                    pagination: result.pagination,
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getBranchById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await branchRepository.getBranchById(id);
            if (result) {
                return res.status(httpStatus.OK).json({ result: result, message: "Branch fetched successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    // // update department
    async updateBranch(req, res, next) {
        try {
            const result = await branchRepository.editBranch(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Branch updated successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async deleteBranch(req, res, next) {
        try {
            const result = await branchRepository.deleteBranch(req);
            if (result) {
                return res.status(200).json({ message: "Branch deleted successfully", status: 200, success: true });
            } else {
                return res.status(400).json({ message: "bad request", status: 400, success: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async restoreBranch(req, res, next) {
        try {
            const result = await branchRepository.restoreBranch(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Branch restored successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getBranchByCity(req, res, next) {
        try {
            const { city } = req;
            const result = await branchRepository.getBranchByCity(city.id);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Branches fetched successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getBranchByState(req, res, next) {
        try {
            const { state } = req;
            const result = await branchRepository.getBranchByState(state.id);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Branches fetched successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getBranchByCountry(req, res, next) {
        try {
            const { country } = req;
            const result = await branchRepository.getBranchByCountry(country.id);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Branches fetched successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
};