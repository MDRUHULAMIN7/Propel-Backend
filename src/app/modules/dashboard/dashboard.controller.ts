import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/sendResponse.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import {
  getDashboardStatsService,
  getChartDataService,
  getMyTasksSummaryService,
} from './dashboard.service.js';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await getDashboardStatsService(req.user!._id, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.DASHBOARD.STATS_FETCHED,
    data: result,
  });
});

export const getChartData = asyncHandler(async (req: Request, res: Response) => {
  const result = await getChartDataService(req.user!._id, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.DASHBOARD.CHARTS_FETCHED,
    data: result,
  });
});

export const getMyTasksSummary = asyncHandler(async (req: Request, res: Response) => {
  const result = await getMyTasksSummaryService(req.user!._id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.DASHBOARD.STATS_FETCHED,
    data: result,
  });
});
