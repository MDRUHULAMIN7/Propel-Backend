import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/sendResponse.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import {
  getMyNotificationsService,
  markAsReadService,
  markAllAsReadService,
  deleteNotificationService,
} from './notification.service.js';

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const result = await getMyNotificationsService(req.user!._id, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.NOTIFICATION.FETCHED,
    data: result.notifications,
    meta: { ...result.meta, unreadCount: result.unreadCount } as any,
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await markAsReadService(req.params.id, req.user!._id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.NOTIFICATION.MARKED_READ,
    data: result,
  });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await markAllAsReadService(req.user!._id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.NOTIFICATION.ALL_MARKED_READ,
    data: result,
  });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  await deleteNotificationService(req.params.id, req.user!._id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.NOTIFICATION.DELETED,
    data: null,
  });
});
