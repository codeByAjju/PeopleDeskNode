import httpStatus from 'http-status';
import models from '../models/index.js';
import utility from '../utils/index.js';
import mediaRepository from './media-repository.js';
import { Op } from 'sequelize';

const { Department } = models;
export default {
  async createDepartment(req) {
    try {
      const { body } = req;
      return await Department.create(body);
    } catch (error) {
      throw Error(error);
    }
  },
  async createBulkDepartment(req) {
    try {
      const { body } = req;
      return await Department.bulkCreate(body, { ignoreDuplicates: true });
    } catch (error) {
      throw Error(error);
    }
  },
  async getAllDepartment(req) {
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
    const filterFields = ['name', 'code', 'description'];
    filterFields.forEach((field) => {
      const val = (filters[field] !== undefined ? filters[field] : req.query?.[field])?.toString().trim();
      if (val) {
        where[field] = {
          [Op.like]: `%${val}%`,
        };
      }
    });

    // General search
    const searchTerm = (search || q || filters.search || filters.q)?.toString().trim();
    if (searchTerm) {
      where[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { code: { [Op.like]: `%${searchTerm}%` } },
        { description: { [Op.like]: `%${searchTerm}%` } },
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

    return await Department.findAndCountAll({
      where,
      order: [[safeSortBy, safeSortType]],
      limit: safeLimit,
      offset: safeOffset,
    });
  },
  async editDepartment(req) {
    try {
      const { body } = req;
      const { id } = req.params;

      await Department.update(body, { where: { id } });

      const updatedDepartment = await Department.findByPk(id);

      return updatedDepartment;
    } catch (error) {
      throw Error(error);
    }
  },
  async deleteDepartment(req) {
    try {
      const { id } = req.params;
      const deletedDepartment = await Department.update({ status: 'deleted' }, { where: { id } });
      return deletedDepartment;
    } catch (error) {
      throw Error(error);
    }
  },
  // async getAllDepartment(req) {
  //   const {
  //     query: {
  //       limit,
  //       offset,
  //       page,
  //       name,
  //       search,
  //       q,
  //       sortBy,
  //       sortType,
  //       sortOrder,
  //       order,
  //       status,
  //       fromDate,
  //       toDate,
  //       filters: rawFilters,
  //     } = {},
  //   } = req;

  //   let filters = {};
  //   if (typeof rawFilters === 'object' && rawFilters !== null) {
  //     filters = { ...rawFilters };
  //   } else if (typeof rawFilters === 'string') {
  //     try {
  //       filters = JSON.parse(rawFilters);
  //     } catch (e) {
  //       filters = {};
  //     }
  //   }

  //   if (req.query) {
  //     Object.keys(req.query).forEach((key) => {
  //       const match = key.match(/^filters\[([^\]]+)\]$/);
  //       if (match && match[1]) {
  //         filters[match[1]] = req.query[key];
  //       }
  //     });
  //   }

  //   const where = {};

  //   const statusVal = (filters.status !== undefined ? filters.status : status)?.toString().trim();
  //   if (statusVal && statusVal !== 'all') {
  //     where.status = statusVal;
  //   } else if (!statusVal) {
  //     where.status = {
  //       [Op.ne]: 'deleted',
  //     };
  //   }

  //   const filterFields = ['name', 'code', 'description'];
  //   filterFields.forEach((field) => {
  //     const val = (filters[field] !== undefined ? filters[field] : req.query?.[field])?.toString().trim();
  //     if (val) {
  //       where[field] = {
  //         [Op.like]: `%${val}%`,
  //       };
  //     }
  //   });

  //   const searchTerm = (search || q || filters.search || filters.q)?.toString().trim();
  //   if (searchTerm) {
  //     where[Op.or] = [
  //       { name: { [Op.like]: `%${searchTerm}%` } },
  //       { code: { [Op.like]: `%${searchTerm}%` } },
  //       { description: { [Op.like]: `%${searchTerm}%` } },
  //     ];
  //   }

  //   // Date filters
  //   const filterFromDate = filters.fromDate || fromDate;
  //   const filterToDate = filters.toDate || toDate;

  //   if (filterFromDate && filterToDate) {
  //     const startDate = utility.getStartDateFormater(filterFromDate);
  //     const endDate = utility.getEndDateFormater(filterToDate);

  //     where.createdAt = {
  //       [Op.between]: [startDate, endDate],
  //     };
  //   } else if (filterFromDate) {
  //     const startDate = utility.getStartDateFormater(filterFromDate);

  //     where.createdAt = {
  //       [Op.gte]: startDate,
  //     };
  //   } else if (filterToDate) {
  //     const endDate = utility.getEndDateFormater(filterToDate);

  //     where.createdAt = {
  //       [Op.lte]: endDate,
  //     };
  //   }

  //   const allowedSortFields = [
  //     "id",
  //     "name",
  //     "code",
  //     "status",
  //     "createdAt",
  //     "updatedAt",
  //   ];

  //   const sortField = sortBy || req.query?.sortColumn || filters.sortBy || filters.sortColumn;
  //   const safeSortBy = allowedSortFields.includes(sortField)
  //     ? sortField
  //     : "createdAt";

  //   const sortDirection = sortType || sortOrder || order || filters.sortOrder || filters.sortType || "DESC";
  //   const safeSortType =
  //     String(sortDirection).toUpperCase() === "ASC"
  //       ? "ASC"
  //       : "DESC";

  //   const limitVal = limit || filters.limit;
  //   const pageVal = page || filters.page;
  //   const offsetVal = offset || filters.offset;

  //   const safeLimit = Math.min(
  //     Math.max(parseInt(limitVal, 10) || 10, 1),
  //     100
  //   );

  //   let safeOffset = 0;
  //   if (pageVal !== undefined && pageVal !== null && pageVal !== '') {
  //     const pageNumber = Math.max(parseInt(pageVal, 10) || 1, 1);
  //     safeOffset = (pageNumber - 1) * safeLimit;
  //   } else if (offsetVal !== undefined && offsetVal !== null && offsetVal !== '') {
  //     safeOffset = Math.max(parseInt(offsetVal, 10) || 0, 0);
  //   }

  //   return await Department.findAndCountAll({
  //     where,
  //     order: [[safeSortBy, safeSortType]],
  //     limit: safeLimit,
  //     offset: safeOffset,
  //   });
  // },
  async findOne(where) {
    try {
      return await Department.findOne({
        where,
      });
    } catch (error) {
      console.log(`DepartmentRepository findOne error:`, error);
      throw Error(error);
    }
  },
}
