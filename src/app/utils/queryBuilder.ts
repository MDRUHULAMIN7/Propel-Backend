import { FilterQuery } from 'mongoose';

interface QueryOptions {
  search?: string;
  searchFields?: string[];
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  filters?: Record<string, unknown>;
}

interface PaginationResult {
  skip: number;
  limit: number;
  page: number;
  sortObj: Record<string, 1 | -1>;
}

export const buildPaginationOptions = (options: QueryOptions): PaginationResult => {
  const page = Math.max(1, parseInt(String(options.page || '1')));
  const limit = Math.min(100, Math.max(1, parseInt(String(options.limit || '10'))));
  const skip = (page - 1) * limit;

  const sortBy = options.sortBy || '-createdAt';
  const sortObj: Record<string, 1 | -1> = {};
  sortBy.split(',').forEach((field) => {
    if (field.startsWith('-')) {
      sortObj[field.slice(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  });

  return { skip, limit, page, sortObj };
};

export const buildSearchFilter = (
  search: string | undefined,
  fields: string[],
): FilterQuery<any> => {
  if (!search || !fields.length) return {};

  const regex = { $regex: search, $options: 'i' };
  return fields.length === 1
    ? { [fields[0]]: regex }
    : { $or: fields.map((field) => ({ [field]: regex })) };
};
