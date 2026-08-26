import models from '../models/index.js';
import utility from '../utils/index.js';
import { Op } from 'sequelize';

const { Designation } = models;
export default {
  async createDesignation(req) {
    try {
      const { body } = req;
      const result = await Designation.create(body);
      return result;
    } catch (error) {
      console.log("error", error)
      throw Error(error);
    }
  },
  async createBulkDesignation(req) {
    try {
      const { body } = req;
      return await Designation.bulkCreate(body);
    } catch (error) {
      throw Error(error);
    }
  },
  async getAllDesignation(req) {
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

    // Extract filters object
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

    if (req.query) {
      Object.keys(req.query).forEach((key) => {
        const match = key.match(/^filters\[([^\]]+)\]$/);
        if (match && match[1]) {
          filters[match[1]] = req.query[key];
        }
      });
    }

    const where = {};

    const statusVal = (filters.status !== undefined ? filters.status : status)?.toString().trim();
    if (statusVal && statusVal !== 'all') {
      where.status = statusVal;
    } else if (!statusVal) {
      where.status = {
        [Op.ne]: 'deleted',
      };
    }

    // Filterable string columns
    const filterFields = ['name', 'code', 'description', 'level'];
    filterFields.forEach((field) => {
      const val = (filters[field] !== undefined ? filters[field] : req.query?.[field])?.toString().trim();
      if (val) {
        if (field === 'level') {
          where[field] = parseInt(val, 10);
        } else {
          where[field] = {
            [Op.like]: `%${val}%`,
          };
        }
      }
    });

    // General search
    const searchTerm = (search || q || filters.search || filters.q)?.toString().trim();
    if (searchTerm) {
      where[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { code: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
        { level: { [Op.like]: `%${searchTerm}%` } },
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
      "id",
      "name",
      "code",
      "level",
      "status",
      "createdAt",
      "updatedAt",
    ];

    const sortField = sortBy || req.query?.sortColumn || filters.sortBy || filters.sortColumn;
    const safeSortBy = allowedSortFields.includes(sortField)
      ? sortField
      : "createdAt";

    const sortDirection = sortType || sortOrder || order || filters.sortOrder || filters.sortType || "DESC";
    const safeSortType =
      String(sortDirection).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const limitVal = limit || filters.limit;
    const pageVal = page || filters.page;
    const offsetVal = offset || filters.offset;

    const safeLimit = Math.min(
      Math.max(parseInt(limitVal, 10) || 10, 1),
      100
    );

    let safeOffset = 0;
    if (pageVal !== undefined && pageVal !== null && pageVal !== '') {
      const pageNumber = Math.max(parseInt(pageVal, 10) || 1, 1);
      safeOffset = (pageNumber - 1) * safeLimit;
    } else if (offsetVal !== undefined && offsetVal !== null && offsetVal !== '') {
      safeOffset = Math.max(parseInt(offsetVal, 10) || 0, 0);
    }

    const result = await Designation.findAndCountAll({
      where,
      order: [[safeSortBy, safeSortType]],
      limit: safeLimit,
      offset: safeOffset,
    });

    const totalItems = result.count;
    const totalPages = Math.ceil(totalItems / safeLimit);
    const currentPage = Math.floor(safeOffset / safeLimit) + 1;

    return {
      designations: result.rows,
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
  async editDesignation(req) {
    try {
      const { body } = req;
      const { id } = req.params;

      await Designation.update(body, { where: { id } });

      const updatedDesignation = await Designation.findByPk(id);

      return updatedDesignation;
    } catch (error) {
      throw Error(error);
    }
  },
  async deleteDesignation(req) {
    try {
      const { id } = req.params;
      const deletedDesignation = await Designation.update({ status: 'deleted' }, { where: { id } });
      return deletedDesignation;
    } catch (error) {
      throw Error(error);
    }
  },
  async restoreDesignation(req) {
    try {
      const { id } = req.params;
      await Designation.update({ status: 'active' }, { where: { id } });
      const restoredDesignation = await Designation.findByPk(id);
      return restoredDesignation;
    } catch (error) {
      throw Error(error);
    }
  },
  async getDesignationByDepartment(departmentId) {
    try {
      const result = await Designation.findAll({ where: { departmentId } });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  async findOne(where) {
    try {
      return await Designation.findOne({
        where,
      });
    } catch (error) {
      console.log(`DesignationRepository findOne error:`, error);
      throw Error(error);
    }
  },
}
