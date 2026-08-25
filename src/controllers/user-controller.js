import models from '../models/index.js';
import services from '../services/jwt.js';
import config from '../config/index.js';
import repositories from '../repositories/index.js';
import httpStatus, { status } from 'http-status';
import model from '../models/index.js';
import bcrypt from 'bcryptjs';

const { userRepository } = repositories;
const { user } = models;

export default {
  async signUp(req, res, next) {
    try {
      const result = await userRepository.signup(req);
      if (result) {
        return res.status(httpStatus.OK).json({ result,message: "submitted", status: true });
      } else {
        //console.log(error);
        return res.status(httpStatus.BAD_REQUEST).json({ message: "bad request", status: false });
      }
    } catch (error) {
      next(error);
    }
  },

  async signIn(req, res, next) {
    try {
      const data = await userRepository.signin(req);
      if (data?.token) {
        return res.status(httpStatus.OK).json({
          data,
          message: 'Signin successful',
          status: true
        });
      }

      // Handle authentication failure
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: data?.msg || 'Invalid email or password',
        status: false
      });
    } catch (error) {
      next(error)
    }
  },

    async userUpdateProfile(request, response, next) {
        try {
            const result = await userRepository.userUpdateProfile(request);
            if (result.status) {
                return response.status(httpStatus.OK).json({
                    status: true,
                    message: result.msg || 'Profile updated successfully',
                    data: result.userData,
                });
            }
            return response.status(httpStatus.BAD_REQUEST).json({
                status: false,
                message: result.msg || 'Profile update failed',
            });
        } catch (error) {
            next(error);
        }
    },
}