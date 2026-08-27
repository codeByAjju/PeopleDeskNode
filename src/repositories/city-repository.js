import { Op } from 'sequelize';
import models from '../models/index.js';

const { City, State, Country } = models;

export default {
  async getCitiesByStateId(stateId, req = {}) {
    try {
      const { query: { search, q, status, limit, page } = {} } = req;
      const where = {
        stateId: parseInt(stateId, 10),
      };

      const statusVal = status?.toString().trim();
      if (statusVal && statusVal !== 'all') {
        where.status = statusVal;
      } else if (!statusVal) {
        where.status = 'active';
      }

      const searchTerm = (search || q)?.toString().trim();
      if (searchTerm) {
        where.name = {
          [Op.like]: `%${searchTerm}%`,
        };
      }

      const queryOptions = {
        where,
        order: [['name', 'ASC']],
        attributes: ['id', 'stateId', 'countryId', 'name', 'status'],
        include: [
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name'],
          },
          {
            model: Country,
            as: 'country',
            attributes: ['id', 'name', 'isoCode'],
          },
        ],
      };

      if (limit) {
        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 1000);
        queryOptions.limit = safeLimit;
        if (page) {
          const safePage = Math.max(parseInt(page, 10) || 1, 1);
          queryOptions.offset = (safePage - 1) * safeLimit;
        }
      }

      const cities = await City.findAll(queryOptions);
      return cities;
    } catch (error) {
      console.error('cityRepository.getCitiesByStateId error:', error);
      throw Error(error);
    }
  },

  async getCityById(id) {
    try {
      return await City.findOne({
        where: {
          id,
          status: { [Op.ne]: 'deleted' },
        },
        include: [
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name'],
          },
          {
            model: Country,
            as: 'country',
            attributes: ['id', 'name', 'isoCode'],
          },
        ],
      });
    } catch (error) {
      console.error('cityRepository.getCityById error:', error);
      throw Error(error);
    }
  },

  async findOne(where) {
    try {
      return await City.findOne({
        where,
      });
    } catch (error) {
      console.error('cityRepository.findOne error:', error);
      throw Error(error);
    }
  },
};
