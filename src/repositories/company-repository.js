import httpStatus from 'http-status';
import models from '../models/index.js';
import utility from '../utils/index.js';
import mediaRepository from './media-repository.js';
import { Op } from 'sequelize';

const { Company, Country, State, City } = models;
export default {
  async createCompany(req) {
    try {
      const { body } = req;
      return await Company.create(body);
    } catch (error) {
      throw Error(error);
    }
  },
  async createBulkCompany(req) {
    try {
      const { body } = req;
      return await Company.bulkCreate(body);
    } catch (error) {
      console.log("error", error)
      throw Error(error);
    }
  },
  async getAllCompany(req) {
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
      'email',
      'phoneNumber',
      'website',
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
        { email: { [Op.like]: `%${searchTerm}%` } },
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
      "email",
      "phoneNumber",
      "website",
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

    const result = await Company.findAndCountAll({
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
      companies: result.rows,
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
  async findOne(where) {
    try {
      return await Company.findOne({
        where,
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
    } catch (error) {
      console.log(`companyRepository.findOne error:`, error);
      throw Error(error);
    }
  },

  async editCompany(req, res, next) {
    const transaction = await models.sequelize.transaction();
    try {
      const { body, company } = req;
      if (body.logo !== company?.dataValues?.logo) {
        // Media file unlink
        await mediaRepository.findMediaByBasePathAndUnlink(
          company?.dataValues?.logo,
        );
        // Media file used
        await mediaRepository.markMediaAsUsed([body.logo]);
      }

      const updateResult = await company.update(body, { transaction });
      await transaction.commit();
      return updateResult;
    } catch (error) {
      await transaction.rollback();
      console.log(`companyRepository.editCompany error:`, error);
      throw Error(error);
    }
  },
  async deleteCompany(req, res, next) {
    try {
      const { company } = req;
      // const { company } = req;
      // const { status, logo } = body;
      const result = await company.update({
        status: 'deleted',
      });

      return result;
      // await mediaRepository.markMediaAsUsed(logo);
      // if (logo !== company?.logo) {
      //   await mediaRepository.findMediaByBasePathAndUnlink(company?.logo);
      //   // Media file used
      //   await mediaRepository.markMediaAsUsed(logo);
      // }
      // return result;
    } catch (error) {
      console.error(`Category update error: ${error},user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },
}
