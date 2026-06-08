import { Types } from 'mongoose';
import { Task } from './task.model.js';
import { Project } from '../project/project.model.js';
import AppError from '../../errors/AppError.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import { TASK_STATUS } from '../../constants/status.constant.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import { CreateTaskInput, UpdateTaskInput } from './task.validation.js';
import { buildPaginationOptions, buildSearchFilter } from '../../utils/queryBuilder.js';
import { ITask } from './task.interface.js';
import { PaginationMeta } from '../../types/index.js';
import logActivity from '../../helper/logActivity.js';
import sendNotification from '../../helper/sendNotification.js';
import { uploadToCloudinary } from '../../helper/uploadToCloud.js';
import { Comment } from '../comment/comment.model.js';

export const createTaskService = async (
  data: CreateTaskInput,
  creatorId: string,
  role: string,
): Promise<ITask> => {
  const project = await Project.findById(data.project);
  if (!project) {
    throw new AppError(MESSAGES.PROJECT.NOT_FOUND, 404);
  }

  if (role !== USER_ROLES.ADMIN) {
    const isMember = project.members.some((m) => m.toString() === creatorId);
    if (!isMember) {
      throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
    }
  }

  if (data.assignedTo) {
    const isAssigneeMember = project.members.some((m) => m.toString() === data.assignedTo);
    if (!isAssigneeMember) {
      throw new AppError(MESSAGES.TASK.ASSIGNEE_NOT_MEMBER, 400);
    }
  }

  const existingTask = await Task.findOne({ title: data.title, project: data.project });
  if (existingTask) {
    throw new AppError(MESSAGES.TASK.DUPLICATE_TITLE, 409);
  }

  const task = await Task.create({ ...data, createdBy: creatorId });

  logActivity({
    action: 'TASK_CREATED',
    performedBy: creatorId,
    targetType: 'Task',
    targetId: task._id as Types.ObjectId,
    projectId: task.project,
    description: `Task "${task.title}" was created`,
  });

  if (data.assignedTo) {
    sendNotification({
      recipientId: data.assignedTo,
      senderId: creatorId,
      message: `You have been assigned to a new task: "${task.title}"`,
      type: 'task_assigned',
      relatedProjectId: task.project.toString(),
      relatedTaskId: task._id.toString(),
    });
  }

  return (await task.populate([
    { path: 'assignedTo', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'project', select: 'name' },
  ])) as unknown as ITask;
};

export const getAllTasksService = async (
  userId: string,
  role: string,
  query: Record<string, unknown>,
): Promise<{ tasks: ITask[]; meta: PaginationMeta }> => {
  const { skip, limit, page, sortObj } = buildPaginationOptions(query);
  const searchFilter = buildSearchFilter(query.search as string, ['title', 'description']);

  let filter: any = { ...(searchFilter as any) };

  if (role !== USER_ROLES.ADMIN) {
    const userProjects = await Project.find({ members: new Types.ObjectId(userId) }).select('_id');
    const projectIds = userProjects.map((p) => p._id);
    filter.project = { $in: projectIds };
  }

  if (query.overdue === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $ne: TASK_STATUS.COMPLETED };
  } else if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.assignedTo) {
    filter.assignedTo = new Types.ObjectId(query.assignedTo as string);
  }

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    tasks: tasks as unknown as ITask[],
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getTaskByIdService = async (
  taskId: string,
  userId: string,
  role: string,
): Promise<ITask> => {
  const task = await Task.findById(taskId)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name members');

  if (!task) {
    throw new AppError(MESSAGES.TASK.NOT_FOUND, 404);
  }

  if (role !== USER_ROLES.ADMIN) {
    const project = task.project as any;
    const isMember = project.members.some((m: any) => m.toString() === userId);
    if (!isMember) {
      throw new AppError(MESSAGES.TASK.FORBIDDEN, 403);
    }
  }

  return task as unknown as ITask;
};

export const updateTaskService = async (
  taskId: string,
  data: UpdateTaskInput,
  userId: string,
  role: string,
): Promise<ITask> => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(MESSAGES.TASK.NOT_FOUND, 404);
  }

  if (role === USER_ROLES.ADMIN) {
    throw new AppError("Admins can only view tasks, not update them.", 403);
  }

  if (role === USER_ROLES.PROJECT_MANAGER) {
    const project = await Project.findById(task.project);
    const isMember = project?.members.some((m) => m.toString() === userId);
    if (!isMember) {
      throw new AppError("You must be a member of this project to update its tasks.", 403);
    }
  }

  if (role === USER_ROLES.TEAM_MEMBER) {
    if (task.assignedTo?.toString() !== userId) {
      throw new AppError(MESSAGES.TASK.CANNOT_EDIT_OTHERS, 403);
    }
    // Team Members can only update status
    data = { status: data.status };
  }

  if (data.assignedTo !== undefined) {
    if (task.status === TASK_STATUS.COMPLETED) {
      throw new AppError(MESSAGES.TASK.ALREADY_COMPLETED, 400);
    }

    if (data.assignedTo !== null) {
      const project = await Project.findById(task.project);
      const isAssigneeMember = project?.members.some((m) => m.toString() === data.assignedTo);
      if (!isAssigneeMember) {
        throw new AppError(MESSAGES.TASK.ASSIGNEE_NOT_MEMBER, 400);
      }
    }
  }

  if (data.title && data.title !== task.title) {
    const existingTask = await Task.findOne({ title: data.title, project: task.project });
    if (existingTask) {
      throw new AppError(MESSAGES.TASK.DUPLICATE_TITLE, 409);
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, data, { new: true })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name');

  if (data.assignedTo && data.assignedTo !== task.assignedTo?.toString()) {
    logActivity({
      action: 'TASK_ASSIGNED',
      performedBy: userId,
      targetType: 'Task',
      targetId: taskId,
      projectId: task.project,
      description: `Task "${task.title}" was assigned`,
    });

    sendNotification({
      recipientId: data.assignedTo,
      senderId: userId,
      message: `You have been assigned to the task: "${task.title}"`,
      type: 'task_assigned',
      relatedProjectId: task.project.toString(),
      relatedTaskId: taskId,
    });
  }

  return updatedTask as unknown as ITask;
};

export const updateTaskStatusService = async (
  taskId: string,
  status: string,
  userId: string,
  role: string,
): Promise<ITask> => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(MESSAGES.TASK.NOT_FOUND, 404);
  }

  if (role === USER_ROLES.ADMIN) {
    throw new AppError("Admins can only view tasks, not update them.", 403);
  }

  if (role === USER_ROLES.PROJECT_MANAGER) {
    const project = await Project.findById(task.project);
    const isMember = project?.members.some((m) => m.toString() === userId);
    if (!isMember) {
      throw new AppError("You must be a member of this project to update its tasks.", 403);
    }
  }

  if (role === USER_ROLES.TEAM_MEMBER) {
    if (task.assignedTo?.toString() !== userId) {
      throw new AppError(MESSAGES.TASK.CANNOT_EDIT_OTHERS, 403);
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { status },
    { new: true },
  )
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name');

  if (status === TASK_STATUS.COMPLETED) {
    logActivity({
      action: 'TASK_COMPLETED',
      performedBy: userId,
      targetType: 'Task',
      targetId: taskId,
      projectId: task.project,
      description: `Task "${task.title}" is completed`,
    });

    sendNotification({
      recipientId: task.createdBy.toString(),
      senderId: userId,
      message: `Task "${task.title}" is completed`,
      type: 'task_completed',
      relatedProjectId: task.project.toString(),
      relatedTaskId: taskId,
    });
  } else {
    logActivity({
      action: 'TASK_STATUS_CHANGED',
      performedBy: userId,
      targetType: 'Task',
      targetId: taskId,
      projectId: task.project,
      description: `Task "${task.title}" status changed to ${status}`,
    });
  }

  return updatedTask as unknown as ITask;
};

export const deleteTaskService = async (
  taskId: string,
  userId: string,
  role: string,
): Promise<void> => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(MESSAGES.TASK.NOT_FOUND, 404);
  }

  if (role === USER_ROLES.TEAM_MEMBER) {
    throw new AppError(MESSAGES.TASK.FORBIDDEN, 403);
  }

  await Task.findByIdAndDelete(taskId);
  
  await Comment.deleteMany({ task: taskId });
};

export const addAttachmentService = async (
  taskId: string,
  files: Express.Multer.File[],
  userId: string,
): Promise<ITask> => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError(MESSAGES.TASK.NOT_FOUND, 404);

  // Upload all files to Cloudinary
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
      'tasks',
    ),
  );

  const uploadResults = await Promise.all(uploadPromises);

  // Push attachments to Task
  const newAttachments = uploadResults.map((result) => ({
    fileName: result.fileName,
    fileUrl: result.url,
    fileType: result.fileType,
    fileSize: result.fileSize,
    uploadedBy: new Types.ObjectId(userId),
    uploadedAt: new Date(),
  }));

  task.attachments.push(...newAttachments);
  await task.save();

  logActivity({
    action: 'FILE_UPLOADED',
    performedBy: userId,
    targetType: 'Task',
    targetId: task._id as Types.ObjectId,
    projectId: task.project,
    description: `${files.length} files uploaded to task "${task.title}"`,
  });

  return task as unknown as ITask;
};
