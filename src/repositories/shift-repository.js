import models from '../models/index.js';
import utility from '../utils/index.js';
import { Op } from 'sequelize';

const { Shift, Employee } = models;

export default {
  async createShift(req) {
    try {
      const { body } = req;
      const result = await Shift.create(body);
      return result;
    } catch (error) {
      console.error('ShiftRepository createShift error:', error);
      throw Error(error);
    }
  },

  async getAllShift(req) {
    const {
      query: {
        limit,
        offset,
        page,
        name,
        search,
        q,
        sortBy,
        sortType,
        sortOrder,
        order,
        status,
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

    // Status filter: handle filters.status, status from query, or default (exclude deleted)
    const statusVal = (
      filters.status !== undefined ? filters.status : status
    )?.toString().trim();

    if (statusVal && statusVal !== 'all') {
      where.status = statusVal;
    }

    // Filterable string columns on Shift model
    const filterFields = [
      'name',
      'code',
    ];

    filterFields.forEach((field) => {
      const val = (filters[field] !== undefined ? filters[field] : req.query?.[field])?.toString().trim();
      if (val) {
        where[field] = {
          [Op.like]: `%${val}%`,
        };
      }
    });

    // General search across multiple fields
    const searchTerm = (search || q || filters.search || filters.q)?.toString().trim();
    if (searchTerm) {
      where[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { code: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    // Date filters
    const filterFromDate = filters.fromDate || fromDate;
    const filterToDate = filters.toDate || toDate;

    if (filterFromDate && filterToDate) {
      const startDate = utility.getStartDateFormater(filterFromDate);
      const endDate = utility.getEndDateFormater(filterToDate);

      where.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    } else if (filterFromDate) {
      const startDate = utility.getStartDateFormater(filterFromDate);

      where.createdAt = {
        [Op.gte]: startDate,
      };
    } else if (filterToDate) {
      const endDate = utility.getEndDateFormater(filterToDate);

      where.createdAt = {
        [Op.lte]: endDate,
      };
    }

    // Allowed sorting fields
    const allowedSortFields = [
      'id',
      'name',
      'code',
      'startTime',
      'endTime',
      'breakDuration',
      'workingHours',
      'status',
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

    const result = await Shift.findAndCountAll({
      where,
      order: [[safeSortBy, safeSortType]],
      limit: safeLimit,
      offset: safeOffset,
    });

    const totalItems = result.count;
    const totalPages = Math.ceil(totalItems / safeLimit);
    const currentPage = Math.floor(safeOffset / safeLimit) + 1;

    return {
      shifts: result.rows,
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

  async getShiftById(id) {
    try {
      const result = await Shift.findByPk(id);
      return result;
    } catch (error) {
      console.error('ShiftRepository getShiftById error:', error);
      throw Error(error);
    }
  },

  async editShift(req) {
    try {
      const { body } = req;
      const { id } = req.params;

      await Shift.update(body, { where: { id } });

      const updatedShift = await Shift.findByPk(id);

      return updatedShift;
    } catch (error) {
      console.error('ShiftRepository editShift error:', error);
      throw Error(error);
    }
  },

  async deleteShift(req) {
    try {
      const { id } = req.params;
      const deletedShift = await Shift.update({ status: 'deleted' }, { where: { id } });
      return deletedShift;
    } catch (error) {
      console.error('ShiftRepository deleteShift error:', error);
      throw Error(error);
    }
  },

  async restoreShift(req) {
    try {
      const { id } = req.params;
      await Shift.update({ status: 'active' }, { where: { id } });
      const restoredShift = await Shift.findByPk(id);
      return restoredShift;
    } catch (error) {
      console.error('ShiftRepository restoreShift error:', error);
      throw Error(error);
    }
  },

  async getShiftStats(shiftId) {
    try {
      const shift = await Shift.findByPk(shiftId);

      if (!shift) return null;

      const totalEmployees = await Employee.count({
        where: { shiftId },
      });

      const activeEmployees = await Employee.count({
        where: {
          shiftId,
          employmentStatus: {
            [Op.notIn]: ['terminated', 'resigned'],
          },
        },
      });

      return {
        shift,
        stats: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees: totalEmployees - activeEmployees,
        },
      };
    } catch (error) {
      console.error('ShiftRepository getShiftStats error:', error);
      throw Error(error);
    }
  },

  async findOne(where) {
    try {
      return await Shift.findOne({
        where,
      });
    } catch (error) {
      console.error('ShiftRepository findOne error:', error);
      throw Error(error);
    }
  },

  async getEmployeeCountByShift(shiftId) {
    try {
      return await Employee.count({
        where: {
          shiftId,
          employmentStatus: {
            [Op.notIn]: ['terminated', 'resigned'],
          },
        },
      });
    } catch (error) {
      console.error('ShiftRepository getEmployeeCountByShift error:', error);
      throw Error(error);
    }
  },
};
