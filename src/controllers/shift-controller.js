import repositories from '../repositories/index.js';
import httpStatus from 'http-status';

const { shiftRepository } = repositories;

export default {
    async create(req, res, next) {
        try {
            const result = await shiftRepository.createShift(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Shift created successfully",
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

    async getAllShift(req, res, next) {
        try {
            const result = await shiftRepository.getAllShift(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    message: "Shifts fetched successfully",
                    status: true,
                    result: result.shifts,
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

    async getShiftById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await shiftRepository.getShiftById(id);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Shift fetched successfully",
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

    async updateShift(req, res, next) {
        try {
            const result = await shiftRepository.editShift(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Shift updated successfully",
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

    async deleteShift(req, res, next) {
        try {
            const result = await shiftRepository.deleteShift(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    message: "Shift deleted successfully",
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

    async restoreShift(req, res, next) {
        try {
            const result = await shiftRepository.restoreShift(req);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Shift restored successfully",
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

    async getShiftStats(req, res, next) {
        try {
            const { shiftId } = req.params;
            const result = await shiftRepository.getShiftStats(shiftId);
            if (result) {
                return res.status(httpStatus.OK).json({
                    result,
                    message: "Shift stats fetched successfully",
                    status: true,
                });
            } else {
                return res.status(httpStatus.NOT_FOUND).json({
                    message: "Shift not found",
                    status: false,
                });
            }
        } catch (error) {
            next(error);
        }
    },
};
