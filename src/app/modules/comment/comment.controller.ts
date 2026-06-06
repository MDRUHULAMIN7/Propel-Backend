import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/sendResponse.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import {
  createCommentService,
  getTaskCommentsService,
  updateCommentService,
  deleteCommentService,
} from './comment.service.js';

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const result = await createCommentService(req.body, req.user!._id, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: MESSAGES.COMMENT.CREATED,
    data: result,
  });
});

export const getTaskComments = asyncHandler(async (req: Request, res: Response) => {
  const taskId = req.query.taskId as string;
  const result = await getTaskCommentsService(taskId, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.COMMENT.FETCHED,
    data: result.comments,
    meta: result.meta,
  });
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const result = await updateCommentService(
    req.params.id,
    req.body.content,
    req.user!._id,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.COMMENT.UPDATED,
    data: result,
  });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  await deleteCommentService(req.params.id, req.user!._id, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.COMMENT.DELETED,
    data: null,
  });
});
