import httpStatus from 'http-status';
import models from '../models/index.js';
import utility from '../utils/index.js';
import mediaRepository from './media-repository.js';
import { Op } from 'sequelize';

const { Attendance, Employee } = models;
export default {
  async findOne(where) {
    try {
      const attendance = await Attendance.findOne({
        where,
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'name', 'email', 'phone'],
          },
        ],
      });
      if (!attendance) {
        return null;
      }
      return attendance;
    } catch (error) {
      console.log(`attendanceRepository.findOne error:`, error);
      throw Error(error);
    }
  },

  async findByEmployeeId(employeeId) {
    try {
      const attendance = await Attendance.findOne({
        where: { employeeId },
      });
      if (!attendance) {
        return null;
      }
      return attendance;
    } catch (error) {
      console.log(`attendanceRepository.findOne error:`, error);
      throw Error(error);
    }
  },

  async checkIn(req) {
    try {
      const { body } = req;
      const { employeeId, checkInTime, latitude, longitude, checkInAddress, checkInDeviceId } = body;
      const attendance = await Attendance.create({
        employeeId,
        checkInTime,
        latitude,
        longitude,
        checkInAddress,
        checkInDeviceId,
      });
      return attendance;
    } catch (error) {
      console.log(`attendanceRepository.checkIn error:`, error);
      throw Error(error);
    }
  }
}
