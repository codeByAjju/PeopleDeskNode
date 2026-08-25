import httpStatus from "http-status";
import jwt from "../services/jwt.js";
import userRepository from "../repositories/user-repository.js";

/**
 * Check user authorization
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const authValidateRequest = async (req, res, next) => {
  try {
    const authHeader = req.headers && req.headers.authorization;

    if (!authHeader) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "TOKEN_NOT_FOUND", status: false });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "TOKEN_BAD_FORMAT", status: false });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "TOKEN_BAD_FORMAT", status: false });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verifyToken(token);
    } catch (err) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "INVALID TOKEN OR SESSION EXPIRE", status: false });
    }

    if (!decodedToken) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "INVALID TOKEN OR SESSION EXPIRE", status: false });
    }

    const user = await userRepository.findOne({ id: decodedToken.id });
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "ACCOUNT_INACTIVE", status: false });
    }

    const userToken = user.dataValues?.token;
    if (!userToken) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "SESSION_EXPIRE", status: false });
    }

    req.user = user;
    req.userRole = user.dataValues?.role;
    req.userToken = userToken;
    return next();
  } catch (error) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "SESSION_EXPIRE", status: false });
  }
};

export default authValidateRequest;
