import { ActivityLog } from './activityLog.model.js';
import { Project } from '../project/project.model.js';
import AppError from '../../errors/AppError.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import { IActivityLog } from './activityLog.interface.js';
import { PaginationMeta } from '../../types/index.js';
import QueryBuilder from '../../builder/QueryBuilder.js';

export const getProjectActivityLogsService = async (
  projectId: string,
  query: Record<string, unknown>,
  userId: string,
  role: string,
): Promise<{ logs: IActivityLog[]; meta: PaginationMeta }> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(MESSAGES.PROJECT.NOT_FOUND, 404);
  }

  if (role !== USER_ROLES.ADMIN) {
    const isMember = project.members.some((m) => m.toString() === userId);
    if (!isMember) {
      throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
    }
  }

  const logQuery = ActivityLog.find({ projectId });
  const builder = new QueryBuilder(logQuery, query).filter().paginate();
  if (!query.sort) builder.modelQuery = builder.modelQuery.sort('-createdAt');

  const logs = await builder.modelQuery.populate('performedBy', 'name email avatar').lean();
  const metaData = await builder.countTotal();

  return {
    logs: logs as unknown as IActivityLog[],
    meta: {
      total: metaData.total,
      page: metaData.page,
      limit: metaData.limit,
      totalPages: metaData.totalPage,
    },
  };
};

export const getAllActivityLogsService = async (
  query: Record<string, unknown>,
  role: string,
): Promise<{ logs: IActivityLog[]; meta: PaginationMeta }> => {
  if (role !== USER_ROLES.ADMIN) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  let logQuery = ActivityLog.find();

  if (query.from && query.to) {
    logQuery = logQuery.find({
      createdAt: {
        $gte: new Date(query.from as string),
        $lte: new Date(query.to as string),
      },
    });
    delete query.from;
    delete query.to;
  }

  const builder = new QueryBuilder(logQuery, query).filter().paginate();
  if (!query.sort) builder.modelQuery = builder.modelQuery.sort('-createdAt');

  const logs = await builder.modelQuery
    .populate('performedBy', 'name email avatar')
    .populate('projectId', 'name')
    .lean();

  const metaData = await builder.countTotal();

  return {
    logs: logs as unknown as IActivityLog[],
    meta: {
      total: metaData.total,
      page: metaData.page,
      limit: metaData.limit,
      totalPages: metaData.totalPage,
    },
  };
};

export const getUserActivityLogsService = async (
  targetUserId: string,
  query: Record<string, unknown>,
  userId: string,
  role: string,
): Promise<{ logs: IActivityLog[]; meta: PaginationMeta }> => {
  if (role !== USER_ROLES.ADMIN && targetUserId !== userId) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  const logQuery = ActivityLog.find({ performedBy: targetUserId });
  const builder = new QueryBuilder(logQuery, query).filter().paginate();
  if (!query.sort) builder.modelQuery = builder.modelQuery.sort('-createdAt');

  const logs = await builder.modelQuery
    .populate('projectId', 'name')
    .lean();

  const metaData = await builder.countTotal();

  return {
    logs: logs as unknown as IActivityLog[],
    meta: {
      total: metaData.total,
      page: metaData.page,
      limit: metaData.limit,
      totalPages: metaData.totalPage,
    },
  };
};
