import { Request, Response, NextFunction } from 'express';
import AppError from '../errors/AppError.js';
import { UserRole } from '../constants/roles.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';

// Usage: authorize('Admin', 'Project Manager')
const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, 401);

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new AppError(MESSAGES.AUTH.FORBIDDEN, 403);
    }

    next();
  };
};

export default authorize;
