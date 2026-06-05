import { Request } from 'express';
import { UserRole } from '../constants/roles.constant.js';

export interface IUserPayload {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: IUserPayload;
}

export type TTokenType = 'access' | 'refresh';

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  search?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T | null;
  meta: PaginationMeta | null;
}
