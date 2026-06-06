import { Notification } from './notification.model.js';
import AppError from '../../errors/AppError.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import { INotification } from './notification.interface.js';
import { PaginationMeta } from '../../types/index.js';
import QueryBuilder from '../../builder/QueryBuilder.js';

export const getMyNotificationsService = async (
  userId: string,
  query: Record<string, unknown>,
): Promise<{ notifications: INotification[]; unreadCount: number; meta: PaginationMeta }> => {
  const notificationQuery = Notification.find({ recipient: userId });

  if (query.isRead !== undefined) {
    notificationQuery.find({ isRead: query.isRead === 'true' });
    delete query.isRead;
  }

  const builder = new QueryBuilder(notificationQuery, query).filter().paginate();
  if (!query.sort) builder.modelQuery = builder.modelQuery.sort('-createdAt');

  const notifications = await builder.modelQuery
    .populate('sender', 'name email avatar')
    .populate('relatedProject', 'name')
    .populate('relatedTask', 'title')
    .lean();

  const metaData = await builder.countTotal();
  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

  return {
    notifications: notifications as unknown as INotification[],
    unreadCount,
    meta: {
      total: metaData.total,
      page: metaData.page,
      limit: metaData.limit,
      totalPages: metaData.totalPage,
    },
  };
};

export const markAsReadService = async (
  notificationId: string,
  userId: string,
): Promise<INotification> => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError(MESSAGES.NOTIFICATION.NOT_FOUND, 404);
  }

  if (notification.recipient.toString() !== userId) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  const updatedNotification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true },
  ).lean();

  return updatedNotification as unknown as INotification;
};

export const markAllAsReadService = async (
  userId: string,
): Promise<{ modifiedCount: number }> => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true },
  );

  return { modifiedCount: result.modifiedCount };
};

export const deleteNotificationService = async (
  notificationId: string,
  userId: string,
): Promise<void> => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new AppError(MESSAGES.NOTIFICATION.NOT_FOUND, 404);
  }

  if (notification.recipient.toString() !== userId) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  await Notification.findByIdAndDelete(notificationId);
};
