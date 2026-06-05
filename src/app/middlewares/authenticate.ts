import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../errors/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import config from '../config/index.js';
import { IUserPayload } from '../types/index.js';
import { MESSAGES } from '../constants/messages.constant.js';

const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) throw new AppError(MESSAGES.AUTH.TOKEN_MISSING, 401);

    const decoded = jwt.verify(token, config.jwt.accessSecret) as IUserPayload;
    req.user = decoded;
    next();
  },
);

export default authenticate;
