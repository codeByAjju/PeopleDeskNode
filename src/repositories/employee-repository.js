import models from '../models/index.js';
import utility from '../utils/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import config from '../config/index.js';
const { Employee, Department, Designation, Branch, Location, Shift, Country, State, City, User, sequelize } = models;

// Associations to include in detail queries
const includeAssociations = [
  { model: Department, as: 'department', attributes: ['id', 'name'] },
  { model: Designation, as: 'designation', attributes: ['id', 'name'] },
  { model: Branch, as: 'branch', attributes: ['id', 'name'] },
  { model: Location, as: 'location', attributes: ['id', 'name'] },
  { model: Shift, as: 'shift', attributes: ['id', 'name'] },
  { model: Country, as: 'country', attributes: ['id', 'name'] },
  { model: State, as: 'state', attributes: ['id', 'name'] },
  { model: City, as: 'city', attributes: ['id', 'name'] },
  { model: Employee, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'employeeCode'] },
];

async function hashPassword(password) {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

export default {
  async createEmployee(req) {
    const transaction = await sequelize.transaction();
    try {
      const { canEmployeeLogin, ...body } = req.body;

      let userId = null;

      // If canEmployeeLogin is true, create a User account for this employee
      if (canEmployeeLogin) {
        const defaultPassword = config.defaultEmployeeLoginPassword;
        const hashedPassword = await hashPassword(defaultPassword);
        const user = await User.create(
          {
            firstName: body.firstName,
            lastName: body.lastName || '',
            email: body.email,
            password: hashedPassword,
            role: 'employee',
            status: 'active',
          },
          { transaction },
        );
        userId = user.id;
      }

      const result = await Employee.create(
        { ...body, canEmployeeLogin: !!canEmployeeLogin, userId },
        { transaction },
      );

      await transaction.commit();

      // Return with associations
      const employee = await Employee.findByPk(result.id, { include: includeAssociations });
      return employee;
    } catch (error) {
      await transaction.rollback();
      console.error('EmployeeRepository createEmployee error:', error);
      throw error;
    }
  },

  async getAllEmployee(req) {
    const {
      query: {
        limit,
        offset,
        page,
        search,
        q,
        sortBy,
        sortType,
        sortOrder,
        order,
        employmentStatus,
        employmentType,
        departmentId,
        designationId,
        branchId,
        locationId,
        shiftId,
        managerId,
        gender,
        fromDate,
        toDate,
        filters: rawFilters,
      } = {},
    } = req;

    // Extract filters object (support object, stringified JSON, and flat keys like filters[name])
    let filters = {};
    if (typeof rawFilters === 'object' && rawFilters !== null) {
      filters = { ...rawFilters };
    } else if (typeof rawFilters === 'string') {
      try {
        filters = JSON.parse(rawFilters);
      } catch (e) {
        filters = {};
      }
    }

    // Support flat keys e.g. req.query['filters[name]']
    if (req.query) {
      Object.keys(req.query).forEach((key) => {
        const match = key.match(/^filters\[([^\]]+)\]$/);
        if (match && match[1]) {
          filters[match[1]] = req.query[key];
        }
      });
    }

    const where = {};

    // Employment status filter
    const statusVal = (
      filters.employmentStatus !== undefined ? filters.employmentStatus : employmentStatus
    )?.toString().trim();

    if (statusVal === 'all') {
      // Show everything including deleted — no filter
    } else if (statusVal) {
      where.employmentStatus = statusVal;
    } else {
      // By default, exclude deleted employees
      // where.employmentStatus = { [Op.ne]: 'deleted' };
    }

    // Employment type filter
    const typeVal = (
      filters.employmentType !== undefined ? filters.employmentType : employmentType
    )?.toString().trim();

    if (typeVal && typeVal !== 'all') {
      where.employmentType = typeVal;
    }

    // Gender filter
    const genderVal = (
      filters.gender !== undefined ? filters.gender : gender
    )?.toString().trim();

    if (genderVal && genderVal !== 'all') {
      where.gender = genderVal;
    }
    // Filterable string columns on Employee model
    const filterFields = [
      'employeeCode',
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
    ];

    filterFields.forEach((field) => {
      const val = (filters[field] !== undefined ? filters[field] : req.query?.[field])?.toString().trim();
      if (val) {
        where[field] = {
          [Op.like]: `%${val}%`,
        };
      }
    });

    // Foreign key filters (departmentId, designationId, branchId, locationId, shiftId, managerId)
    const fkFields = ['departmentId', 'designationId', 'branchId', 'locationId', 'shiftId', 'managerId'];
    fkFields.forEach((field) => {
      const val = filters[field] !== undefined ? filters[field] : req.query?.[field];
      if (val !== undefined && val !== null && val !== '') {
        where[field] = parseInt(val, 10);
      }
    });

    // General search across multiple fields
    const searchTerm = (search || q || filters.search || filters.q)?.toString().trim();
    if (searchTerm) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${searchTerm}%` } },
        { lastName: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
        { employeeCode: { [Op.like]: `%${searchTerm}%` } },
        { phoneNumber: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    // Date filters (based on dateOfJoining)
    const filterFromDate = filters.fromDate || fromDate;
    const filterToDate = filters.toDate || toDate;

    if (filterFromDate && filterToDate) {
      where.dateOfJoining = {
        [Op.between]: [filterFromDate, filterToDate],
      };
    } else if (filterFromDate) {
      where.dateOfJoining = {
        [Op.gte]: filterFromDate,
      };
    } else if (filterToDate) {
      where.dateOfJoining = {
        [Op.lte]: filterToDate,
      };
    }

    // Allowed sorting fields
    const allowedSortFields = [
      'id',
      'employeeCode',
      'firstName',
      'lastName',
      'email',
      'dateOfJoining',
      'dateOfLeaving',
      'employmentType',
      'employmentStatus',
      'departmentId',
      'designationId',
      'branchId',
      'locationId',
      'shiftId',
      'createdAt',
      'updatedAt',
    ];

    const sortField = sortBy || req.query?.sortColumn || filters.sortBy || filters.sortColumn;
    const safeSortBy = allowedSortFields.includes(sortField)
      ? sortField
      : 'createdAt';

    // Handle sortType, sortOrder, and order ('asc' / 'desc')
    const sortDirection = sortType || sortOrder || order || filters.sortOrder || filters.sortType || 'DESC';
    const safeSortType =
      String(sortDirection).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Pagination limit (clamped between 1 and 100, default 10)
    const limitVal = limit || filters.limit;
    const pageVal = page || filters.page;
    const offsetVal = offset || filters.offset;

    const safeLimit = Math.min(
      Math.max(parseInt(limitVal, 10) || 10, 1),
      100
    );

    // Calculate offset: support 1-based `page` or 0-based `offset`
    let safeOffset = 0;
    if (pageVal !== undefined && pageVal !== null && pageVal !== '') {
      const pageNumber = Math.max(parseInt(pageVal, 10) || 1, 1);
      safeOffset = (pageNumber - 1) * safeLimit;
    } else if (offsetVal !== undefined && offsetVal !== null && offsetVal !== '') {
      safeOffset = Math.max(parseInt(offsetVal, 10) || 0, 0);
    }

    const result = await Employee.findAndCountAll({
      where,
      include: includeAssociations,
      order: [[safeSortBy, safeSortType]],
      limit: safeLimit,
      offset: safeOffset,
      distinct: true,
    });
    const totalItems = result.count;
    const totalPages = Math.ceil(totalItems / safeLimit);
    const currentPage = Math.floor(safeOffset / safeLimit) + 1;

    return {
      employees: result.rows,
      pagination: {
        page: currentPage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  },

  async getEmployeeById(id) {
    try {
      const result = await Employee.findByPk(id, {
        include: [
          ...includeAssociations,
          { model: Employee, as: 'teamMembers', attributes: ['id', 'firstName', 'lastName', 'employeeCode', 'employmentStatus'] },
        ],
      });
      return result;
    } catch (error) {
      console.error('EmployeeRepository getEmployeeById error:', error);
      throw Error(error);
    }
  },

  async editEmployee(req) {
    const transaction = await sequelize.transaction();
    try {
      const { canEmployeeLogin, ...body } = req.body;
      const { id } = req.params;

      const existingEmployee = await Employee.findByPk(id);
      if (!existingEmployee) {
        await transaction.rollback();
        return null;
      }

      const updateData = { ...body };

      // Handle canEmployeeLogin toggle
      if (canEmployeeLogin !== undefined) {
        updateData.canEmployeeLogin = !!canEmployeeLogin;

        if (canEmployeeLogin && !existingEmployee.userId) {
          // Toggled ON and employee does NOT have a linked User yet
          const email = body.email || existingEmployee.email;
          const firstName = body.firstName || existingEmployee.firstName;
          const lastName = body.lastName !== undefined ? body.lastName : existingEmployee.lastName;

          // Check if this email is already taken by another User
          const existingUser = await User.findOne({
            where: { email },
            transaction,
          });

          if (existingUser) {
            await transaction.rollback();
            const error = new Error('This email is already registered with another user account');
            error.statusCode = 409;
            throw error;
          }

          // Email is available - create a new User for this employee
          const defaultPassword = config.defaultEmployeeLoginPassword || '12345678';
          const hashedPassword = await hashPassword(defaultPassword);
          const user = await User.create(
            {
              firstName,
              lastName: lastName || '',
              email,
              password: hashedPassword,
              role: 'employee',
              status: 'active',
            },
            { transaction },
          );
          updateData.userId = user.id;

        } else if (canEmployeeLogin && existingEmployee.userId) {
          // Already has login - just update employee, re-activate User if needed
          await User.update(
            { status: 'active' },
            { where: { id: existingEmployee.userId }, transaction },
          );

        } else if (!canEmployeeLogin && existingEmployee.userId) {
          // Toggled OFF: deactivate the linked User and unlink
          await User.update(
            { status: 'inactive' },
            { where: { id: existingEmployee.userId }, transaction },
          );
          updateData.userId = null;
        }
      }

      await Employee.update(updateData, { where: { id }, transaction });

      await transaction.commit();

      const updatedEmployee = await Employee.findByPk(id, { include: includeAssociations });
      return updatedEmployee;
    } catch (error) {
      await transaction.rollback();
      console.error('EmployeeRepository editEmployee error:', error);
      throw error;
    }
  },

  async deleteEmployee(req) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      // Find the employee to check for a linked user
      const employee = await Employee.findByPk(id, { transaction });

      // Soft-delete the employee
      await Employee.update(
        { employmentStatus: 'deleted', canEmployeeLogin: false },
        { where: { id }, transaction },
      );

      // If the employee has a linked User, deactivate that too
      if (employee && employee.userId) {
        await User.update(
          { status: 'deleted' },
          { where: { id: employee.userId }, transaction },
        );
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error('EmployeeRepository deleteEmployee error:', error);
      throw Error(error);
    }
  },

  async restoreEmployee(req) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      // Restore the employee
      await Employee.update(
        { employmentStatus: 'active' },
        { where: { id }, transaction },
      );

      // If the employee has a linked User, reactivate that too
      const employee = await Employee.findByPk(id, { transaction });
      if (employee && employee.userId) {
        await User.update(
          { status: 'active' },
          { where: { id: employee.userId }, transaction },
        );
        // Re-enable login since the user account is being restored
        await Employee.update(
          { canEmployeeLogin: true },
          { where: { id }, transaction },
        );
      }

      await transaction.commit();

      const restoredEmployee = await Employee.findByPk(id, { include: includeAssociations });
      return restoredEmployee;
    } catch (error) {
      await transaction.rollback();
      console.error('EmployeeRepository restoreEmployee error:', error);
      throw Error(error);
    }
  },

  async updateEmployeeStatus(req) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { employmentStatus: newStatus } = req.body;

      const employee = await Employee.findByPk(id, { transaction });

      const updateData = { employmentStatus: newStatus };

      // Statuses that should disable employee login
      const disableLoginStatuses = ['deleted', 'inactive', 'terminated', 'resigned'];

      if (disableLoginStatuses.includes(newStatus)) {
        updateData.canEmployeeLogin = false;
        // Also deactivate the linked User
        if (employee && employee.userId) {
          const userStatus = newStatus === 'deleted' ? 'deleted' : 'inactive';
          await User.update(
            { status: userStatus },
            { where: { id: employee.userId }, transaction },
          );
        }
      } else if (newStatus === 'active' && employee && employee.userId) {
        // Re-activate the linked User
        updateData.canEmployeeLogin = true;
        await User.update(
          { status: 'active' },
          { where: { id: employee.userId }, transaction },
        );
      }

      await Employee.update(updateData, { where: { id }, transaction });

      await transaction.commit();

      const updatedEmployee = await Employee.findByPk(id, { include: includeAssociations });
      return updatedEmployee;
    } catch (error) {
      await transaction.rollback();
      console.error('EmployeeRepository updateEmployeeStatus error:', error);
      throw Error(error);
    }
  },

  async findOne(where) {
    try {
      return await Employee.findOne({
        where,
      });
    } catch (error) {
      console.error('EmployeeRepository findOne error:', error);
      throw Error(error);
    }
  },
};
