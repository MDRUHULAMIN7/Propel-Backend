import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/sendResponse.js';
import { setAuthCookies, clearAuthCookies } from '../../helper/setCookies.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import {
  registerService,
  loginService,
  refreshTokenService,
  demoLoginService,
} from './auth.service.js';
import AppError from '../../errors/AppError.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerService(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: MESSAGES.AUTH.REGISTER_SUCCESS,
    data: result.user,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginService(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.AUTH.LOGIN_SUCCESS,
    data: result.user,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearAuthCookies(res);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.AUTH.LOGOUT_SUCCESS,
    data: null,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new AppError(MESSAGES.AUTH.TOKEN_MISSING, 401);
  }

  const result = await refreshTokenService(token);
  
  // Update only accessToken cookie
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 15 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.AUTH.TOKEN_REFRESHED,
    data: null,
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.USER.PROFILE_FETCHED,
    data: req.user,
  });
});

export const demoLogin = asyncHandler(async (req: Request, res: Response) => {
  const role = req.body.role || 'Team Member';
  const result = await demoLoginService(role);
  setAuthCookies(res, result.accessToken, result.refreshToken);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.AUTH.DEMO_LOGIN_SUCCESS,
    data: result.user,
  });
});
