import find from 'lodash';
import repositories from '../repositories/index.js';
import httpStatus from 'http-status';
const { mediaRepository } = repositories;
export default {
  async checkMediaFor(req, res, next) {
    const { params: { basePath, basePathArray, mediaFor } } = req;
    try {
      const basePathStr = basePath;
      const basePathStrArray = basePathArray ?? [];
      const regexp = RegExp(`${mediaFor}(\\\\|/)`);
      let message;
      let error;
      if (
        basePathStrArray.length < 1
        && basePathStrArray.some((value) => value instanceof undefined)
      ) {
        next();
      } else {
        basePathStr && basePathStrArray.push(basePathStr);
        if (basePathStrArray && basePathStrArray.length) {
          error = basePathStrArray.find(
            (element) => !element?.match(regexp)
              && (message = `Invalid media type for '${mediaFor}', in '${element}'`),
          );
        }
        if (error) {
          res.status(httpStatus.BAD_REQUEST).json({
            message: "Invalid media type for '" + mediaFor + "', in '" + error + "'",
            status: false,
            result: [],
          });
        } else {
          next();
        }
      }
    } catch (error) {
      next(error);
    }
  },

  async checkMediaExists(req, res, next) {
    const { params: { basePath, basePathArray } } = req;
    try {
      const basePathStr = basePath;
      const basePathStrArray = basePathArray || [];
      let error;
      if (
        basePathStrArray.length < 1 && basePathStrArray.some((value) => value instanceof undefined)
      ) {
        next();
      } else {
        basePathStr && basePathStrArray.push(basePathStr);
        const medias = await mediaRepository.findAllByBasePathIn(
          basePathStrArray,
        );
        error = basePathStrArray.find((element) => {
          const isExist = find(medias, { basePath: element });
          return (
            !isExist?.__wrapped__.length > 0 && `Media file not found, for '${element}'`
          );
        });
        if (error) {
          error = new Error(error);
          next(error);
        } else {
          next();
        }
      }
    } catch (error) {
      next(error);
    }
  },

};
