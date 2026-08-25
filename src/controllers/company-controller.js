import models from '../models/index.js';
import services from '../services/jwt.js';
import repositories from '../repositories/index.js';
import httpStatus, { status } from 'http-status';
import model from '../models/index.js';

const { companyRepository } = repositories;
const { company } = models;

export default {
    async create(req, res, next) {
        try {
            const result = await companyRepository.createCompany(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "submitted", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async createBulkCompany(req, res, next) {
        try {
            const result = await companyRepository.createBulkCompany(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "submitted", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getAllCompany(req, res, next) {
        try {
            const result = await companyRepository.getAllCompany(req);
            if (result?.companies) {
                return res.status(httpStatus.OK).json({
                    message: "Companies fetched successfully",
                    status: true,
                    result: result
                });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async getCompanyById(req, res, next) {
        try {
            const { company } = req;
            return res.status(httpStatus.OK).json({
                message: "Company fetched successfully",
                status: true,
                result: company,
            });
        } catch (error) {
            next(error);
        }
    },

    async updateCompany(req, res, next) {
        try {
            const result = await companyRepository.editCompany(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result: result, message: "Company updated successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
    async deleteCompany(req, res, next) {
        try {
            await companyRepository.deleteCompany(req);
            return res.status(httpStatus.OK).json({ result: [], message: "Company deleted successfully", status: true });
        } catch (error) {
            next(error);
        }
    },
};