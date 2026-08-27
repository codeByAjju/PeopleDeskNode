import httpStatus from 'http-status';
import repositories from '../repositories/index.js';

const { cityRepository } = repositories;

export default {
  async getCitiesByState(req, res, next) {
    try {
      const { stateId } = req.params;
      const cities = await cityRepository.getCitiesByStateId(stateId, req);

      const formatted = cities.map((item) => ({
        id: item.id,
        stateId: item.stateId,
        countryId: item.countryId,
        name: item.name,
        status: item.status,
        state: item.state,
        country: item.country,
        value: item.id,
        label: item.name,
      }));

      return res.status(httpStatus.OK).json({
        status: true,
        message: 'Cities fetched successfully',
        result: formatted,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCityById(req, res, next) {
    try {
      const { city } = req;
      return res.status(httpStatus.OK).json({
        status: true,
        message: 'City fetched successfully',
        result: {
          id: city.id,
          stateId: city.stateId,
          countryId: city.countryId,
          name: city.name,
          status: city.status,
          state: city.state,
          country: city.country,
          value: city.id,
          label: city.name,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
