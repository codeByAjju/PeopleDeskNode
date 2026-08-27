import models from '../models/index.js';
import utility from '../utils/index.js';
import { Op } from 'sequelize';

const { Location, Branch, Country, State, City, Employee } = models;

export default {
  async createLocation(req) {
    try {
      const { body } = req;
      const result = await Location.create(body);
      return result;
    } catch (error) {
      console.error('LocationRepository createLocation error:', error);
      throw Error(error);
    }
  },

  async getAllLocation(req) {
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
        branchId,
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
    const filterBranchId = filters.branchId || filters.branch_id || branchId || req.query?.branchId || req.query?.branch_id;
    if (filterBranchId) {
      where.branchId = parseInt(filterBranchId, 10);
    }

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

    // Filterable string columns on Location model
    const filterFields = [
      'name',
      'code',
      'address',
      'postalCode',
    ];

    filterFields.forEach((field) => {
      const val = (filters[field] !== undefined ? filters[field] : req.query?.[field])?.toString().trim();
      if (val) {
        where[field] = {
          [Op.like]: `%${val}%`,
        };
      }
    });

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
        { address: { [Op.like]: `%${searchTerm}%` } },
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
      'address',
      'branchId',
      'countryId',
      'stateId',
      'cityId',
      'postalCode',
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

    const result = await Location.findAndCountAll({
      where,
      order: [[safeSortBy, safeSortType]],
      limit: safeLimit,
      offset: safeOffset,
      include: [
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code', 'status'],
        },
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
      locations: result.rows,
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

  async getLocationById(id) {
    try {
      const result = await Location.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code', 'status'],
          },
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
      console.error('LocationRepository getLocationById error:', error);
      throw Error(error);
    }
  },

  async editLocation(req) {
    try {
      const { body } = req;
      const { id } = req.params;

      await Location.update(body, { where: { id } });

      const updatedLocation = await Location.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code', 'status'],
          },
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

      return updatedLocation;
    } catch (error) {
      console.error('LocationRepository editLocation error:', error);
      throw Error(error);
    }
  },

  async deleteLocation(req) {
    try {
      const { id } = req.params;
      const deletedLocation = await Location.update({ status: 'deleted' }, { where: { id } });
      return deletedLocation;
    } catch (error) {
      console.error('LocationRepository deleteLocation error:', error);
      throw Error(error);
    }
  },

  async restoreLocation(req) {
    try {
      const { id } = req.params;
      await Location.update({ status: 'active' }, { where: { id } });
      const restoredLocation = await Location.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code', 'status'],
          },
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
      return restoredLocation;
    } catch (error) {
      console.error('LocationRepository restoreLocation error:', error);
      throw Error(error);
    }
  },

  async getLocationByBranch(branchId) {
    try {
      const result = await Location.findAll({
        where: {
          branchId,
          status: { [Op.ne]: 'deleted' },
        },
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'name', 'code', 'status'],
          },
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
      console.error('LocationRepository getLocationByBranch error:', error);
      throw Error(error);
    }
  },

  async findOne(where) {
    try {
      return await Location.findOne({
        where,
      });
    } catch (error) {
      console.error('LocationRepository findOne error:', error);
      throw Error(error);
    }
  },

  async getEmployeeCountByLocation(locationId) {
    try {
      return await Employee.count({
        where: {
          locationId,
          employmentStatus: {
            [Op.notIn]: ['terminated', 'resigned'],
          },
        },
      });
    } catch (error) {
      console.error('LocationRepository getEmployeeCountByLocation error:', error);
      throw Error(error);
    }
  },
};
