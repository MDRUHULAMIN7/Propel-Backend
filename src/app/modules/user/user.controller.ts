import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/sendResponse.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  updateUserRoleService,
} from './user.service.js';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAllUsersService(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.USER.FETCHED,
    data: result.users,
    meta: result.meta,
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const result = await getUserByIdService(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.USER.SINGLE_FETCHED,
    data: result,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await updateUserService(req.params.id, req.body, req.user!);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.USER.UPDATED,
    data: result,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await deleteUserService(req.params.id, req.user!);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.USER.DELETED,
    data: null,
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const result = await updateUserRoleService(req.params.id, req.body.role, req.user!);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.USER.UPDATED,
    data: result,
  });
});

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await getUserByIdService(req.user!._id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.USER.PROFILE_FETCHED,
    data: result,
  });
});
