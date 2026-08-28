import { Op } from 'sequelize';
import employeeRepository from '../repositories/employee-repository.js';
import designationRepository from '../repositories/designation-repository.js';
import departmentRepository from '../repositories/department-repository.js';
import shiftRepository from '../repositories/shift-repository.js';
import locationRepository from '../repositories/location-repository.js';
import branchRepository from '../repositories/branch-repository.js';
import userRepository from '../repositories/user-repository.js';

export default {
    async checkUserEmailAvailable(req, res, next) {
        try {
            const { canEmployeeLogin, email } = req.body;

            // Only check if canEmployeeLogin is true
            if (!canEmployeeLogin) {
                return next();
            }

            const existingUser = await userRepository.findOne({ email });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'A user account with this email already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkEmployeeIdExist(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID is required",
                });
            }

            const result = await employeeRepository.findOne({
                id,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Employee does not exist",
                });
            }

            req.employee = result;
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkEmployeeCodeExist(req, res, next) {
        try {
            const { employeeCode } = req.body;

            const result = await employeeRepository.findOne({
                employeeCode,
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Employee code already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkEmployeeEmailExist(req, res, next) {
        try {
            const { email } = req.body;

            const result = await employeeRepository.findOne({
                email,
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Employee email already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkDesignationIdExist(req, res, next) {
        try {
            const { designationId } = req.body;

            if (!designationId) {
                return res.status(400).json({
                    success: false,
                    message: "designationId designationId is required",
                });
            }

            const result = await designationRepository.findOne({
                id: designationId,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "designation does not exist",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },


    async checkEmployeeManagerIdExist(req, res, next) {
        try {
            const { managerId } = req.body;
            if (!managerId) {
                return next();
            }

            const result = await employeeRepository.findOne({
                id: managerId,
            });
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Employee manager does not exist',
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkUpdateEmployeeCodeExist(req, res, next) {
        try {
            const { employeeCode } = req.body;
            const { id } = req.params;

            const result = await employeeRepository.findOne({
                id: { [Op.ne]: id },
                employeeCode,
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Employee code already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkUpdateEmployeeEmailExist(req, res, next) {
        try {
            const { email } = req.body;
            const { id } = req.params;

            const result = await employeeRepository.findOne({
                id: { [Op.ne]: id },
                email,
            });

            if (result) {
                return res.status(409).json({
                    success: false,
                    message: 'Employee email already exists',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },

    async checkEmployeeHasTeamMembers(req, res, next) {
        try {
            const { id } = req.params;
            const teamCount = await employeeRepository.findOne({
                managerId: id,
                employmentStatus: {
                    [Op.notIn]: ['terminated', 'resigned', 'inactive'],
                },
            });

            if (teamCount) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot deactivate employee. They have active team members assigned as their manager.',
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    },
    async checkDepartmentIdExist(req, res, next) {
        try {
            const { departmentId } = req.body;

            if (!departmentId) {
                return res.status(400).json({
                    success: false,
                    message: "Department departmentId is required",
                });
            }

            const result = await departmentRepository.findOne({
                id: departmentId,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Department does not exist",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkBranchIdExist(req, res, next) {
        try {
            const { branchId } = req.body;

            if (!branchId) {
                return res.status(400).json({
                    success: false,
                    message: "branchId branchId is required",
                });
            }

            const result = await branchRepository.findOne({
                id: branchId,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "branch does not exist",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkLocationIdExist(req, res, next) {
        try {
            const { locationId } = req.body;

            if (!locationId) {
                return res.status(400).json({
                    success: false,
                    message: "locationId locationId is required",
                });
            }

            const result = await locationRepository.findOne({
                id: locationId,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "location does not exist",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },

    async checkShiftIdExist(req, res, next) {
        try {
            const { shiftId } = req.body;

            if (!shiftId) {
                return res.status(400).json({
                    success: false,
                    message: "shiftId shiftId is required",
                });
            }

            const result = await shiftRepository.findOne({
                id: shiftId,
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "shift does not exist",
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },
};
