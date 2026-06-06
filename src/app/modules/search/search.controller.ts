import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/sendResponse.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import { globalSearchService } from './search.service.js';

export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query.q as string;
  const result = await globalSearchService(q, req.user!._id, req.user!.role);
  
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.SEARCH.RESULTS_FETCHED,
    data: result,
  });
});
