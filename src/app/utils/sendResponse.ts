import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types/index.js';

interface SendResponseOptions<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

const sendResponse = <T>(res: Response, options: SendResponseOptions<T>): void => {
  const payload: ApiResponse<T> = {
    success: options.success,
    message: options.message,
    data: options.data ?? null,
    meta: options.meta ?? null,
  };
  res.status(options.statusCode).json(payload);
};

export default sendResponse;
