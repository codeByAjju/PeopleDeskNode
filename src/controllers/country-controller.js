import httpStatus from 'http-status';
import repositories from '../repositories/index.js';

const { countryRepository } = repositories;

export default {
  async getAllCountries(req, res, next) {
    try {
      const countries = await countryRepository.getAllCountries(req);
      const formatted = countries.map((item) => ({
        id: item.id,
        name: item.name,
        isoCode: item.isoCode,
        phoneCode: item.phoneCode,
        currencySymbol: item.currencySymbol,
        status: item.status,
        value: item.id,
        label: item.name,
      }));

      return res.status(httpStatus.OK).json({
        status: true,
        message: 'Countries fetched successfully',
        result: formatted,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCountryById(req, res, next) {
    try {
      const { country } = req;
      return res.status(httpStatus.OK).json({
        status: true,
        message: 'Country fetched successfully',
        result: {
          id: country.id,
          name: country.name,
          isoCode: country.isoCode,
          phoneCode: country.phoneCode,
          currencySymbol: country.currencySymbol,
          status: country.status,
          value: country.id,
          label: country.name,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
