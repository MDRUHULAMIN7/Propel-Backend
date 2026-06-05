import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { IUserPayload } from '../types/index.js';

export const generateAccessToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });
};

export const generateRefreshToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
};

export const generateBothTokens = (
  payload: IUserPayload,
): { accessToken: string; refreshToken: string } => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
});
