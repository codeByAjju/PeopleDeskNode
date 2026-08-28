import models from '../models/index.js';
import utility from '../utils/index.js';
import { Op } from 'sequelize';

const { Employee, Department, Designation, Branch, Location, Shift, Country, State, City, User } = models;

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

export default {
  async createEmployee(req) {
    try {
      const { body } = req;
      const result = await Employee.create(body);
      // Return with associations
      const employee = await Employee.findByPk(result.id, { include: includeAssociations });
      return employee;
    } catch (error) {
      console.error('EmployeeRepository createEmployee error:', error);
      throw Error(error);
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

    if (statusVal && statusVal !== 'all') {
      where.employmentStatus = statusVal;
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
    try {
      const { body } = req;
      const { id } = req.params;

      await Employee.update(body, { where: { id } });

      const updatedEmployee = await Employee.findByPk(id, { include: includeAssociations });

      return updatedEmployee;
    } catch (error) {
      console.error('EmployeeRepository editEmployee error:', error);
      throw Error(error);
    }
  },

  async deleteEmployee(req) {
    try {
      const { id } = req.params;
      const deletedEmployee = await Employee.update(
        { employmentStatus: 'inactive' },
        { where: { id } },
      );
      return deletedEmployee;
    } catch (error) {
      console.error('EmployeeRepository deleteEmployee error:', error);
      throw Error(error);
    }
  },

  async restoreEmployee(req) {
    try {
      const { id } = req.params;
      await Employee.update({ employmentStatus: 'active' }, { where: { id } });
      const restoredEmployee = await Employee.findByPk(id, { include: includeAssociations });
      return restoredEmployee;
    } catch (error) {
      console.error('EmployeeRepository restoreEmployee error:', error);
      throw Error(error);
    }
  },

  async updateEmployeeStatus(req) {
    try {
      const { id } = req.params;
      const { employmentStatus: newStatus } = req.body;

      await Employee.update({ employmentStatus: newStatus }, { where: { id } });
      const updatedEmployee = await Employee.findByPk(id, { include: includeAssociations });
      return updatedEmployee;
    } catch (error) {
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
