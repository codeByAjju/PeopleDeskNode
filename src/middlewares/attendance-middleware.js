import { Op } from 'sequelize';
import attendanceRepository from '../repositories/attendance-repository.js';

export default {
    async checkEmployeeExist(req, res, next) {
        const { employeeId, attendanceDate } = req.body;
        const employee = await employeeRepository.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
            });
        }
        const attendance = await attendanceRepository.findByEmployeeId(employeeId);
        if (!attendance) {
            return res.status(404).json({
                message: 'Attendance not found',
            });
        }
        req.employee = employee;
        req.attendance = attendance;
        next();
    },
};