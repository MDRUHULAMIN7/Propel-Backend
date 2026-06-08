import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../user/user.model.js';
import AppError from '../../errors/AppError.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import { generateBothTokens, generateAccessToken } from '../../helper/generateTokens.js';
import config from '../../config/index.js';
import { IUserPayload } from '../../types/index.js';
import { RegisterInput, LoginInput } from './auth.validation.js';
import { USER_ROLES } from '../../constants/roles.constant.js';

export const registerService = async (data: RegisterInput) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError(MESSAGES.USER.EMAIL_EXISTS, 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  
  const newUser = await User.create({
    ...data,
    password: hashedPassword,
  });

  const payload: IUserPayload = {
    _id: newUser._id.toString(),
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };

  const tokens = generateBothTokens(payload);
  
  return {
    user: payload,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

export const loginService = async (data: LoginInput) => {
  const user = await User.findOne({ email: data.email, isActive: true }).select('+password');
  if (!user) {
    throw new AppError(MESSAGES.AUTH.INVALID_EMAIL, 401);
  }

  const isPasswordMatch = await bcrypt.compare(data.password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(MESSAGES.AUTH.INVALID_PASSWORD, 401);
  }

  const payload: IUserPayload = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const tokens = generateBothTokens(payload);

  return {
    user: payload,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

export const refreshTokenService = async (token: string) => {
  const decoded = jwt.verify(token, config.jwt.refreshSecret) as IUserPayload;
  
  const user = await User.findOne({ _id: decoded._id, isActive: true });
  if (!user) {
    throw new AppError('User not found or inactive', 401);
  }

  const payload: IUserPayload = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  
  return { accessToken };
};

export const demoLoginService = async (role: string) => {
  let email = '';
  switch (role) {
    case USER_ROLES.ADMIN:
      email = 'ruhuladmin@gmail.com';
      break;
    case USER_ROLES.PROJECT_MANAGER:
      email = 'mdmahamud59yy@gmail.com';
      break;
    case USER_ROLES.TEAM_MEMBER:
    default:
      email = 'test@gmail.com';
      break;
  }

  const loginData: LoginInput = {
    email,
    password: 'Admin123',
  };

  return loginService(loginData);
};
