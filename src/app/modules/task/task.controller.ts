import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/sendResponse.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import {
  createTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
  updateTaskStatusService,
  deleteTaskService,
  addAttachmentService,
} from './task.service.js';
import AppError from '../../errors/AppError.js';

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const result = await createTaskService(req.body, req.user!._id, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: MESSAGES.TASK.CREATED,
    data: result,
  });
});

export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAllTasksService(req.user!._id, req.user!.role, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.TASK.FETCHED,
    data: result.tasks,
    meta: result.meta,
  });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const result = await getTaskByIdService(req.params.id, req.user!._id, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.TASK.SINGLE_FETCHED,
    data: result,
  });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const result = await updateTaskService(
    req.params.id,
    req.body,
    req.user!._id,
    req.user!.role,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.TASK.UPDATED,
    data: result,
  });
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await updateTaskStatusService(
    req.params.id,
    req.body.status,
    req.user!._id,
    req.user!.role,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.TASK.STATUS_UPDATED,
    data: result,
  });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await deleteTaskService(req.params.id, req.user!._id, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.TASK.DELETED,
    data: null,
  });
});

export const uploadAttachment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    throw new AppError('No file selected', 400);
  }

  const task = await addAttachmentService(
    req.params.id,
    req.files as Express.Multer.File[],
    req.user!._id,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.TASK.ATTACHMENT_ADDED,
    data: task,
  });
});
