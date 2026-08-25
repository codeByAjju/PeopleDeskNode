import httpStatus from "http-status";
import HttpStatus from "http-status";

/**
 * Check resource access permission
 * According to user role
 * @param {Array} userTypeArr
 * @param {function} next
 * @param {object} req
 */
const resourceAccessMiddleware = (userTypeArr) => async (req, res, next) => {
  try {
    if (userTypeArr.includes(req.userRole)) {
      next();
    } else {
      const error = new Error("INVALID_USER_ACCESS");
      error.status = HttpStatus.BAD_REQUEST;
      error.message = ` Resource can not be accesse by ${req.userRole} `;
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: error.message, status: false });
    }
  } catch (error) {
    error.status = HttpStatus.UNAUTHORIZED;
    next(error);
  }
};

export default resourceAccessMiddleware;
