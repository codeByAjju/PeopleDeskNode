import repositories from '../repositories/index.js';
import httpStatus from 'http-status';

const { locationRepository } = repositories;

export default {
    async create(req, res, next) {
        try {
            const result = await locationRepository.createLocation(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Location created successfully",
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

    async getAllLocation(req, res, next) {
        try {
            const result = await locationRepository.getAllLocation(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    message: "Locations fetched successfully",
                    status: true,
                    result: result.locations,
                    pagination: result.pagination,
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

    async getLocationById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await locationRepository.getLocationById(id);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Location fetched successfully",
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

    async updateLocation(req, res, next) {
        try {
            const result = await locationRepository.editLocation(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Location updated successfully",
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

    async deleteLocation(req, res, next) {
        try {
            const result = await locationRepository.deleteLocation(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    message: "Location deleted successfully",
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

    async restoreLocation(req, res, next) {
        try {
            const result = await locationRepository.restoreLocation(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Location restored successfully",
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

    async getLocationByBranch(req, res, next) {
        try {
            const { branchId } = req.params;
            const result = await locationRepository.getLocationByBranch(branchId);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Locations fetched successfully",
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
