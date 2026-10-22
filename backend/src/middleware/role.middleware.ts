import { NextFunction, Request, Response } from 'express';
import { Role } from '../utils/constants';
import { AppError } from '../utils/AppError';

/** SUPER_ADMIN is always allowed. */
export const authorizeRoles =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role) return next(new AppError('Authentication required', 401));
    if (role !== 'SUPER_ADMIN' && !roles.includes(role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
