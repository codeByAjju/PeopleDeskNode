import { Op } from 'sequelize';
import models from '../models/index.js';

const { Country } = models;

export default {
  async getAllCountries(req) {
    try {
      const { search, q, status, limit, page } = req.query || {};
      const where = {};

      const statusVal = status?.toString().trim();
      if (statusVal && statusVal !== 'all') {
        where.status = statusVal;
      } else if (!statusVal) {
        where.status = 'active';
      }

      const searchTerm = (search || q)?.toString().trim();
      if (searchTerm) {
        where[Op.or] = [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { isoCode: { [Op.like]: `%${searchTerm}%` } },
        ];
      }

      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const limitNum = Math.min(parseInt(limit, 10) || 100, 500);

      const { rows: countries, count: total } = await Country.findAndCountAll({
        where,
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'isoCode', 'phoneCode', 'currencySymbol', 'status'],
        limit: limitNum,
        offset: (pageNum - 1) * limitNum,
      });

      return {
        countries,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      };
    } catch (error) {
      console.error('countryRepository.getAllCountries error:', error);
      throw error;
    }
  },

  async getCountryById(id) {
    try {
      return await Country.findOne({
        where: {
          id,
          status: { [Op.ne]: 'deleted' },
        },
      });
    } catch (error) {
      console.error('countryRepository.getCountryById error:', error);
      throw Error(error);
    }
  },

  async findOne(where) {
    try {
      return await Country.findOne({
        where,
      });
    } catch (error) {
      console.error('countryRepository.findOne error:', error);
      throw Error(error);
    }
  },
};
