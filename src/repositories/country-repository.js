import { Op } from 'sequelize';
import models from '../models/index.js';

const { Country } = models;

export default {
  async getAllCountries(req = {}) {
    try {
      const { query: { search, q, status } = {} } = req;
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

      const countries = await Country.findAll({
        where,
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'isoCode', 'phoneCode', 'currencySymbol', 'status'],
      });

      return countries;
    } catch (error) {
      console.error('countryRepository.getAllCountries error:', error);
      throw Error(error);
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
