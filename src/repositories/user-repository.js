import httpStatus from 'http-status';
import models from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from '../services/jwt.js';


const { User } = models;
export default {
  async createHashPassword(password) {
    try {
      const salt = await bcrypt.genSalt();
      return await bcrypt.hash(password, salt);

    }
    catch (error) {
      //console.log(error);
    }
  },

  async signup(req) {
    try {
      const bodyData = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email: bodyData.email } });
      if (existingUser) {
        const error = new Error('Email already registered. Please use a different email or try logging in.');
        error.status = 400;
        throw error;
      }

      const hashPassword = await this.createHashPassword(bodyData.password);
      bodyData.password = hashPassword;
      bodyData.role = 'user'
      const result = await User.create(bodyData);
      if (result)
        return result;
      return false;

    } catch (error) {
      throw error;
    }
  },
  async signin(request) {
    const { email, password } = request.body;
    const havingEmail = await User.findOne({ where: { email: email } });
    if (havingEmail) {
      const isPasswordMatch = await this.compareUserPassword(password, havingEmail.password);
      if (isPasswordMatch) {
        const { ...userData } = havingEmail.get();
        const token = jwt.createToken(userData)
        userData.token = token;
        User.update({ token: token }, { where: { id: havingEmail.id } });
        return { token, ...userData };
      } else {
        // Password doesn't match
        return { status: false, msg: "Invalid password" };
      }
    }
    // User not found
    return { status: false, msg: "User not found with this email" };
  },
  async compareUserPassword(password, hashPassword) {
    let isPasswordMatch = '';
    if (password && hashPassword) {
      isPasswordMatch = await bcrypt.compare(password, hashPassword);
    }
    return isPasswordMatch;
  },

  async userUpdateProfile(request) {
    try {
      const updateData = request.body || {};
      const userId = updateData.id || updateData.userId;
      const lookup = userId ? { id: userId } : { email: updateData.email };

      const userRecord = await User.findOne({ where: lookup });
      if (!userRecord) {
        return { status: false, msg: "User not found" };
      }

      const allowedFields = ['firstName', 'lastName', 'address', 'profileImageURL'];
      const payload = {};
      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined && updateData[field] !== null) {
          payload[field] = updateData[field];
        }
      });

      await userRecord.update(payload);
      const { password, token, passwordResetToken, ...userData } = userRecord.toJSON();
      return { userData, status: true, msg: "Profile updated successfully" };
    } catch (error) {
      console.error('Repository profile update error:', error);
      return { status: false, msg: "Failed to update profile" };
    }
  },
  async findOne(where) {
    try {
      const havingWhere = where.email ? { email: where.email } : {};
      const attributes = { exclude: ["password", "verifyToken"] };
      const userData = await User.findOne({
        where: {
          ...where,
        },
      });
      return userData;
    } catch (error) {
      console.log(error);
      throw Error(error);
    }
  },
}
