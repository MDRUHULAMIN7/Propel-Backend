import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/sendResponse.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import {
  getProjectActivityLogsService,
  getAllActivityLogsService,
  getUserActivityLogsService,
} from './activityLog.service.js';

export const getProjectLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await getProjectActivityLogsService(
    req.params.projectId,
    req.query,
    req.user!._id,
    req.user!.role,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.ACTIVITY_LOG.FETCHED,
    data: result.logs,
    meta: result.meta,
  });
});

export const getAllLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAllActivityLogsService(req.query, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.ACTIVITY_LOG.FETCHED,
    data: result.logs,
    meta: result.meta,
  });
});

export const getUserLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await getUserActivityLogsService(
    req.params.userId,
    req.query,
    req.user!._id,
    req.user!.role,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.ACTIVITY_LOG.FETCHED,
    data: result.logs,
    meta: result.meta,
  });
});
