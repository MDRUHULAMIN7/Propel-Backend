import { Request, Response, NextFunction } from 'express';
import { MongoError } from 'mongodb';
import mongoose from 'mongoose';
import AppError from './AppError.js';

const handleDuplicateKeyError = (err: MongoError): AppError => {
  const field = Object.keys((err as any).keyValue || {})[0] || 'field';
  const value = (err as any).keyValue?.[field];
  return new AppError(`'${value}' is already in use`, 409);
};

const handleValidationError = (err: mongoose.Error.ValidationError): AppError => {
  const messages = Object.values(err.errors).map((e) => e.message).join(', ');
  return new AppError(messages, 400);
};

const handleCastError = (err: mongoose.Error.CastError): AppError =>
  new AppError(`Invalid ID: ${err.value}`, 400);

const handleJWTError = (): AppError =>
  new AppError('Invalid token, please login again', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Token expired, please login again', 401);

const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error: AppError;

  if (err instanceof SyntaxError && 'body' in err) {
    error = new AppError(`Invalid JSON payload passed: ${err.message}`, 400);
  } else if ((err as MongoError).code === 11000) {
    error = handleDuplicateKeyError(err as MongoError);
  } else if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err.name === 'CastError') {
    error = handleCastError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (err instanceof AppError) {
    error = err;
  } else {
    error = new AppError('Internal Server Error', 500);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default globalErrorHandler;
