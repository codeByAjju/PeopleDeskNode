import { Op } from 'sequelize';
import models from '../models/index.js';

const { State, Country } = models;

export default {
  async getStatesByCountryId(countryId, req = {}) {
    try {
      const { query: { search, q, status } = {} } = req;
      const where = {
        countryId: parseInt(countryId, 10),
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

      const states = await State.findAll({
        where,
        order: [['name', 'ASC']],
        attributes: ['id', 'countryId', 'name', 'status'],
        include: [
          {
            model: Country,
            as: 'country',
            attributes: ['id', 'name', 'isoCode'],
          },
        ],
      });

      return states;
    } catch (error) {
      console.error('stateRepository.getStatesByCountryId error:', error);
      throw Error(error);
    }
  },

  async getStateById(id) {
    try {
      return await State.findOne({
        where: {
          id,
          status: { [Op.ne]: 'deleted' },
        },
        include: [
          {
            model: Country,
            as: 'country',
            attributes: ['id', 'name', 'isoCode'],
          },
        ],
      });
    } catch (error) {
      console.error('stateRepository.getStateById error:', error);
      throw Error(error);
    }
  },

  async findOne(where) {
    try {
      return await State.findOne({
        where,
      });
    } catch (error) {
      console.error('stateRepository.findOne error:', error);
      throw Error(error);
    }
  },
};
