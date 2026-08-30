import models from '../models/index.js';
import utility from '../utils/index.js';
import { Op } from 'sequelize';

const { Branch, Country, State, City, Employee } = models;
export default {
  async createBranch(req) {
    try {
      const { body } = req;
      const result = await Branch.create(body);
      return result;
    } catch (error) {
      console.log("error", error)
      throw Error(error);
    }
  },
  async getAllBranch(req) {
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
        countryId,
        stateId,
        cityId,
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

    // Direct ID filters
    const filterCountryId = filters.countryId || filters.country_id || countryId || req.query?.countryId || req.query?.country_id;
    if (filterCountryId) {
      where.countryId = parseInt(filterCountryId, 10);
    }

    const filterStateId = filters.stateId || filters.state_id || stateId || req.query?.stateId || req.query?.state_id;
    if (filterStateId) {
      where.stateId = parseInt(filterStateId, 10);
    }

    const filterCityId = filters.cityId || filters.city_id || cityId || req.query?.cityId || req.query?.city_id;
    if (filterCityId) {
      where.cityId = parseInt(filterCityId, 10);
    }

    // Filterable string columns on Company model
    const filterFields = [
      'name',
      'code',
      'address',
      'postalCode',
      'phoneNumber'
    ];

    filterFields.forEach((field) => {
      const val = (filters[field] !== undefined ? filters[field] : req.query?.[field])?.toString().trim();
      if (val) {
        where[field] = {
          [Op.like]: `%${val}%`,
        };
      }
    });

    // Support field aliases (phone -> phoneNumber, postal_code -> postalCode)
    const phoneVal = (filters.phone !== undefined ? filters.phone : req.query?.phone || filters.phone_number || req.query?.phone_number)?.toString().trim();
    if (phoneVal && !where.phoneNumber) {
      where.phoneNumber = {
        [Op.like]: `%${phoneVal}%`,
      };
    }

    const postalCodeVal = (filters.postal_code !== undefined ? filters.postal_code : req.query?.postal_code)?.toString().trim();
    if (postalCodeVal && !where.postalCode) {
      where.postalCode = {
        [Op.like]: `%${postalCodeVal}%`,
      };
    }

    // General search across multiple fields
    const searchTerm = (search || q || filters.search || filters.q)?.toString().trim();
    if (searchTerm) {
      where[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { code: { [Op.like]: `%${searchTerm}%` } },
        { phoneNumber: { [Op.like]: `%${searchTerm}%` } },
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
      "phoneNumber",
      "address",
      "countryId",
      "stateId",
      "cityId",
      "postalCode",
      "status",
      "createdAt",
      "updatedAt",
    ];

    const sortField = sortBy || req.query?.sortColumn || filters.sortBy || filters.sortColumn;
    const safeSortBy = allowedSortFields.includes(sortField)
      ? sortField
      : "createdAt";

    // Handle sortType, sortOrder, and order ('asc' / 'desc')
    const sortDirection = sortType || sortOrder || order || filters.sortOrder || filters.sortType || "DESC";
    const safeSortType =
      String(sortDirection).toUpperCase() === "ASC" ? "ASC" : "DESC";

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

    const result = await Branch.findAndCountAll({
      where,
      order: [[safeSortBy, safeSortType]],
      limit: safeLimit,
      offset: safeOffset,
      include: [
        {
          model: Country,
          as: 'country',
          attributes: ['id', 'name', 'isoCode', 'phoneCode', 'currencySymbol'],
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name'],
        },
        {
          model: City,
          as: 'city',
          attributes: ['id', 'name'],
        },
      ],
    });

    const totalItems = result.count;
    const totalPages = Math.ceil(totalItems / safeLimit);
    const currentPage = Math.floor(safeOffset / safeLimit) + 1;

    return {
      branches: result.rows,
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
  async getBranchById(id) {
    try {
      const result = await Branch.findByPk(id, {
        include: [
          {
            model: Country,
            as: 'country',
            attributes: ['id', 'name', 'isoCode', 'phoneCode', 'currencySymbol'],
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name'],
          },
          {
            model: City,
            as: 'city',
            attributes: ['id', 'name'],
          },
        ],
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  async editBranch(req) {
    try {
      const { body } = req;
      const { id } = req.params;

      await Branch.update(body, { where: { id } });

      const updatedBranch = await Branch.findByPk(id, {
        include: [
          {
            model: Country,
            as: 'country',
            attributes: ['id', 'name', 'isoCode', 'phoneCode', 'currencySymbol'],
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name'],
          },
          {
            model: City,
            as: 'city',
            attributes: ['id', 'name'],
          },
        ],
      });

      return updatedBranch;
    } catch (error) {
      throw Error(error);
    }
  },
  async deleteBranch(req) {
    try {
      const { id } = req.params;
      const deletedBranch = await Branch.update({ status: 'deleted' }, { where: { id } });
      return deletedBranch;
    } catch (error) {
      throw Error(error);
    }
  },
  async restoreBranch(req) {
    try {
      const { id } = req.params;
      await Branch.update({ status: 'active' }, { where: { id } });
      const restoredBranch = await Branch.findByPk(id);
      return restoredBranch;
    } catch (error) {
      throw Error(error);
    }
  },
  async getBranchByCity(cityId) {
    try {
      const result = await Branch.findAll({ where: { cityId } });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  async getBranchByState(stateId) {
    try {
      const result = await Branch.findAll({ where: { stateId } });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  async findOne(where) {
    try {
      return await Branch.findOne({
        where,
      });
    } catch (error) {
      console.log(`BranchRepository findOne error:`, error);
      throw Error(error);
    }
  },
  async getBranchByCountry(countryId) {
    try {
      const result = await Branch.findAll({
        where: { countryId },
        include: [
          {
            model: Country,
            as: 'country',
            attributes: ['id', 'name', 'isoCode', 'phoneCode', 'currencySymbol'],
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name'],
          },
          {
            model: City,
            as: 'city',
            attributes: ['id', 'name'],
          },
        ],
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  async getBranchStats(req) {
    try {
      // Query database counts
      const [
        totalBranches,
        activeBranches,
        inactiveBranches,
        deletedBranches
      ] = await Promise.all([
        Branch.count(),
        Branch.count({ where: { status: 'active' } }),
        Branch.count({ where: { status: 'inactive' } }),
        Branch.count({ where: { status: 'deleted' } })
      ]);

      return {
        totalBranches,
        activeBranches,
        inactiveBranches,
        deletedBranches
      };
    } catch (error) {
      console.error('BranchRepository getBranchStats error:', error);
      throw error;
    }
  },

  async getEmployeeByBranch(req) {
    try {
      const { branchId } = req.params;
      const result = await Employee.findAll({
        where: { branchId },
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code', 'phone', 'address'],
          },
        ],
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

}
