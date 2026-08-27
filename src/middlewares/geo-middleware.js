import httpStatus from 'http-status';
import models from '../models/index.js';
import { Op } from 'sequelize';

const { Country, State, City } = models;

export const validateLocationHierarchy = async (req, res, next) => {
  try {
    const { countryId, stateId, cityId } = req.body || {};

    // 1. If countryId is provided, verify it exists and is active
    let country = null;
    if (countryId) {
      country = await Country.findOne({
        where: {
          id: countryId,
          status: { [Op.ne]: 'deleted' },
        },
      });

      if (!country) {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: false,
          message: `Country with ID ${countryId} does not exist or is deleted`,
        });
      }
    }

    // 2. If stateId is provided, verify it exists and belongs to countryId
    let state = null;
    if (stateId) {
      state = await State.findOne({
        where: {
          id: stateId,
          status: { [Op.ne]: 'deleted' },
        },
      });

      if (!state) {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: false,
          message: `State with ID ${stateId} does not exist or is deleted`,
        });
      }

      if (countryId && state.countryId !== parseInt(countryId, 10)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: false,
          message: `Invalid location hierarchy: State '${state.name}' (ID: ${stateId}) does not belong to the selected Country (ID: ${countryId})`,
        });
      }
    }

    // 3. If cityId is provided, verify it exists and belongs to stateId & countryId
    if (cityId) {
      const city = await City.findOne({
        where: {
          id: cityId,
          status: { [Op.ne]: 'deleted' },
        },
      });

      if (!city) {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: false,
          message: `City with ID ${cityId} does not exist or is deleted`,
        });
      }

      if (stateId && city.stateId !== parseInt(stateId, 10)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: false,
          message: `Invalid location hierarchy: City '${city.name}' (ID: ${cityId}) does not belong to the selected State (ID: ${stateId})`,
        });
      }

      if (countryId && city.countryId !== parseInt(countryId, 10)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: false,
          message: `Invalid location hierarchy: City '${city.name}' (ID: ${cityId}) does not belong to the selected Country (ID: ${countryId})`,
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkCountryExists = async (req, res, next) => {
  try {
    const countryId = req.params.countryId || req.params.id || req.body.countryId;
    if (!countryId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: false,
        message: 'Country ID is required',
      });
    }

    const country = await Country.findOne({
      where: {
        id: countryId,
        status: { [Op.ne]: 'deleted' },
      },
    });

    if (!country) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: false,
        message: 'Country not found',
      });
    }

    req.country = country;
    next();
  } catch (error) {
    next(error);
  }
};

export const checkStateExists = async (req, res, next) => {
  try {
    const stateId = req.params.stateId || req.params.id || req.body.stateId;
    if (!stateId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: false,
        message: 'State ID is required',
      });
    }

    const state = await State.findOne({
      where: {
        id: stateId,
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

    if (!state) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: false,
        message: 'State not found',
      });
    }

    req.state = state;
    next();
  } catch (error) {
    next(error);
  }
};

export const checkCityExists = async (req, res, next) => {
  try {
    const cityId = req.params.cityId || req.params.id || req.body.cityId;
    if (!cityId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: false,
        message: 'City ID is required',
      });
    }

    const city = await City.findOne({
      where: {
        id: cityId,
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

    if (!city) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: false,
        message: 'City not found',
      });
    }

    req.city = city;
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  validateLocationHierarchy,
  checkCountryExists,
  checkStateExists,
  checkCityExists,
};
