import { Types } from 'mongoose';
import { Project } from './project.model.js';
import { User } from '../user/user.model.js';
import { Task } from '../task/task.model.js';
import { TASK_STATUS } from '../../constants/status.constant.js';
import logActivity from '../../helper/logActivity.js';
import sendNotification from '../../helper/sendNotification.js';
import AppError from '../../errors/AppError.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import { CreateProjectInput, UpdateProjectInput } from './project.validation.js';
import { IUserPayload, PaginationMeta } from '../../types/index.js';
import { IProject, IMemberWorkload, IProjectProgress } from './project.interface.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import { buildPaginationOptions, buildSearchFilter } from '../../utils/queryBuilder.js';

export const createProjectService = async (
  data: CreateProjectInput,
  ownerId: string,
): Promise<IProject> => {
  const project = await Project.create({
    ...data,
    owner: ownerId,
    members: [ownerId], // Owner automatically becomes first member
  });

  logActivity({
    action: 'PROJECT_CREATED',
    performedBy: ownerId,
    targetType: 'Project',
    targetId: project._id as Types.ObjectId,
    projectId: project._id as Types.ObjectId,
    description: `Project "${project.name}" was created`,
  });

  return await project.populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' },
  ]);
};

export const getAllProjectsService = async (
  userId: string,
  role: string,
  query: Record<string, unknown>,
): Promise<{ projects: IProject[]; meta: PaginationMeta }> => {
  if (role === USER_ROLES.TEAM_MEMBER) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  const { skip, limit, page, sortObj } = buildPaginationOptions(query);
  const searchFilter = buildSearchFilter(query.search as string, ['name', 'description']);

  const filter: any = {
    ...(searchFilter as any),
  };

  if (role !== USER_ROLES.ADMIN) {
    filter.members = new Types.ObjectId(userId);
  }

  if (query.status) {
    filter.status = query.status;
  }

  const [total, projects] = await Promise.all([
    Project.countDocuments(filter),
    Project.find(filter)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    projects: projects as unknown as IProject[],
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getProjectByIdService = async (
  projectId: string,
  userId: string,
  role: string,
): Promise<IProject> => {
  if (role === USER_ROLES.TEAM_MEMBER) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  const project = await Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar')
    .lean();

  if (!project) {
    throw new AppError(MESSAGES.PROJECT.NOT_FOUND, 404);
  }

  const isMember = project.members.some((member: any) => member._id.toString() === userId);
  
  if (role !== USER_ROLES.ADMIN && !isMember) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  return project as unknown as IProject;
};

export const updateProjectService = async (
  projectId: string,
  data: UpdateProjectInput,
  userId: string,
  role: string,
): Promise<IProject> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(MESSAGES.PROJECT.NOT_FOUND, 404);
  }

  const isOwner = project.owner.toString() === userId;
  if (role !== USER_ROLES.ADMIN && role !== USER_ROLES.PROJECT_MANAGER && !isOwner) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  const updatedProject = await Project.findByIdAndUpdate(projectId, data, {
    new: true,
  })
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar')
    .lean();

  return updatedProject as unknown as IProject;
};

export const deleteProjectService = async (
  projectId: string,
  userId: string,
  role: string,
): Promise<null> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(MESSAGES.PROJECT.NOT_FOUND, 404);
  }

  const isOwner = project.owner.toString() === userId;
  if (role !== USER_ROLES.ADMIN && !isOwner) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  await Project.findByIdAndDelete(projectId);
  
  await Task.deleteMany({ project: projectId });

  logActivity({
    action: 'PROJECT_DELETED',
    performedBy: userId,
    targetType: 'Project',
    targetId: projectId,
    description: `Project "${project.name}" was deleted`,
  });

  return null;
};

export const addMemberToProjectService = async (
  projectId: string,
  memberId: string,
  requesterId: string,
  role: string,
): Promise<IProject> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(MESSAGES.PROJECT.NOT_FOUND, 404);
  }

  const userToAdd = await User.findById(memberId);
  if (!userToAdd || !userToAdd.isActive) {
    throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
  }

  const isAlreadyMember = project.members.some((m) => m.toString() === memberId);
  if (isAlreadyMember) {
    throw new AppError(MESSAGES.PROJECT.ALREADY_MEMBER, 409);
  }

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    { $push: { members: memberId } },
    { new: true },
  )
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar')
    .lean();

  logActivity({
    action: 'MEMBER_ADDED',
    performedBy: requesterId,
    targetType: 'User',
    targetId: memberId,
    projectId: projectId,
    description: `User "${userToAdd.name}" was added to the project`,
  });

  sendNotification({
    recipientId: memberId,
    senderId: requesterId,
    message: `You were added to the project: "${project.name}"`,
    type: 'member_added',
    relatedProjectId: projectId,
  });

  return updatedProject as unknown as IProject;
};

export const removeMemberFromProjectService = async (
  projectId: string,
  memberId: string,
  requesterId: string,
  role: string,
): Promise<IProject> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(MESSAGES.PROJECT.NOT_FOUND, 404);
  }

  if (project.owner.toString() === memberId) {
    throw new AppError(MESSAGES.PROJECT.CANNOT_REMOVE_OWNER, 400);
  }

  const isMember = project.members.some((m) => m.toString() === memberId);
  if (!isMember) {
    throw new AppError(MESSAGES.PROJECT.NOT_MEMBER, 404);
  }

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    { $pull: { members: memberId } },
    { new: true },
  )
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar')
    .lean();

  return updatedProject as unknown as IProject;
};

export const getProjectWorkloadService = async (
  projectId: string,
  userId: string,
  role: string,
): Promise<IMemberWorkload[]> => {
  if (role === USER_ROLES.TEAM_MEMBER) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  const project = await Project.findById(projectId).populate('members', 'name email avatar');
  if (!project) {
    throw new AppError(MESSAGES.PROJECT.NOT_FOUND, 404);
  }

  const isMember = project.members.some((member: any) => member._id.toString() === userId);
  if (role !== USER_ROLES.ADMIN && !isMember) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  const tasks = await Task.find({ project: projectId });

  const workload: IMemberWorkload[] = project.members.map((member: any) => {
    const memberTasks = tasks.filter((t) => t.assignedTo?.toString() === member._id.toString());
    const totalTasks = memberTasks.length;
    const completedTasks = memberTasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = memberTasks.filter(
      (t) => t.status !== TASK_STATUS.COMPLETED && new Date(t.dueDate) < new Date(),
    ).length;

    return {
      userId: member._id,
      name: member.name,
      email: member.email,
      avatar: member.avatar,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    };
  });

  return workload;
};

export const getProjectProgressService = async (
  projectId: string,
  role: string,
): Promise<IProjectProgress> => {
  if (role === USER_ROLES.TEAM_MEMBER) {
    throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(MESSAGES.PROJECT.NOT_FOUND, 404);
  }

  const totalTasks = await Task.countDocuments({ project: projectId });
  const completedTasks = await Task.countDocuments({ project: projectId, status: TASK_STATUS.COMPLETED });
  const overdueTasks = await Task.countDocuments({
    project: projectId,
    status: { $ne: TASK_STATUS.COMPLETED },
    dueDate: { $lt: new Date() },
  });

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    projectId: project._id,
    projectName: project.name,
    totalTasks,
    completedTasks,
    progressPercentage,
    overdueTasks,
  };
};
