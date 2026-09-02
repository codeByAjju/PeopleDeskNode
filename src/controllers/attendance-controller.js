import repositories from '../repositories/index.js';
import httpStatus from 'http-status';

const { attendanceRepository } = repositories;

export default {
    async checkIn(req, res, next) {
        try {
            const result = await attendanceRepository.checkIn(req);
            if (result) {
                return res.status(httpStatus.OK).json({ result, message: "Check In successfully", status: true });
            } else {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
            }
        } catch (error) {
            next(error);
        }
    },
}