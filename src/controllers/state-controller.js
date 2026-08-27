import httpStatus from 'http-status';
import repositories from '../repositories/index.js';

const { stateRepository } = repositories;

export default {
  async getStatesByCountry(req, res, next) {
    try {
      const { countryId } = req.params;
      const states = await stateRepository.getStatesByCountryId(countryId, req);

      const formatted = states.map((item) => ({
        id: item.id,
        countryId: item.countryId,
        name: item.name,
        status: item.status,
        country: item.country,
        value: item.id,
        label: item.name,
      }));

      return res.status(httpStatus.OK).json({
        status: true,
        message: 'States fetched successfully',
        result: formatted,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStateById(req, res, next) {
    try {
      const { state } = req;
      return res.status(httpStatus.OK).json({
        status: true,
        message: 'State fetched successfully',
        result: {
          id: state.id,
          countryId: state.countryId,
          name: state.name,
          status: state.status,
          country: state.country,
          value: state.id,
          label: state.name,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
