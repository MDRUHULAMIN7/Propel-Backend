import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/sendResponse.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import {
  createProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
  deleteProjectService,
  addMemberToProjectService,
  removeMemberFromProjectService,
  getProjectWorkloadService,
  getProjectProgressService,
} from './project.service.js';

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const result = await createProjectService(req.body, req.user!._id);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: MESSAGES.PROJECT.CREATED,
    data: result,
  });
});

export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const result = await getAllProjectsService(req.user!._id, req.user!.role, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.PROJECT.FETCHED,
    data: result.projects,
    meta: result.meta,
  });
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const result = await getProjectByIdService(req.params.id, req.user!._id, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.PROJECT.SINGLE_FETCHED,
    data: result,
  });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const result = await updateProjectService(
    req.params.id,
    req.body,
    req.user!._id,
    req.user!.role,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.PROJECT.UPDATED,
    data: result,
  });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await deleteProjectService(req.params.id, req.user!._id, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.PROJECT.DELETED,
    data: null,
  });
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const result = await addMemberToProjectService(
    req.params.id,
    req.body.memberId,
    req.user!._id,
    req.user!.role,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.PROJECT.MEMBER_ADDED,
    data: result,
  });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const result = await removeMemberFromProjectService(
    req.params.id,
    req.params.memberId,
    req.user!._id,
    req.user!.role,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.PROJECT.MEMBER_REMOVED,
    data: result,
  });
});

export const getProjectWorkload = asyncHandler(async (req: Request, res: Response) => {
  const result = await getProjectWorkloadService(
    req.params.id,
    req.user!._id,
    req.user!.role,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.PROJECT.WORKLOAD_FETCHED,
    data: result,
  });
});

export const getProjectProgress = asyncHandler(async (req: Request, res: Response) => {
  const result = await getProjectProgressService(req.params.id, req.user!.role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: MESSAGES.PROJECT.PROGRESS_FETCHED,
    data: result,
  });
});
