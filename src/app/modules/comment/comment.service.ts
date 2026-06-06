import { Comment } from './comment.model.js';
import { Task } from '../task/task.model.js';
import { Project } from '../project/project.model.js';
import AppError from '../../errors/AppError.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import { CreateCommentInput } from './comment.validation.js';
import { IComment } from './comment.interface.js';
import { PaginationMeta } from '../../types/index.js';
import logActivity from '../../helper/logActivity.js';
import sendNotification from '../../helper/sendNotification.js';

export const createCommentService = async (
  data: CreateCommentInput,
  authorId: string,
  role: string,
): Promise<IComment> => {
  const task = await Task.findById(data.taskId).populate('project');
  if (!task) {
    throw new AppError(MESSAGES.TASK.NOT_FOUND, 404);
  }

  const project = await Project.findById(task.project);
  if (!project) {
    throw new AppError(MESSAGES.PROJECT.NOT_FOUND, 404);
  }

  if (role !== USER_ROLES.ADMIN) {
    const isMember = project.members.some((m) => m.toString() === authorId);
    if (!isMember) {
      throw new AppError(MESSAGES.PROJECT.FORBIDDEN, 403);
    }
  }

  const comment = await Comment.create({
    task: data.taskId,
    project: project._id,
    author: authorId,
    content: data.content,
  });

  logActivity({
    action: 'COMMENT_ADDED',
    performedBy: authorId,
    targetType: 'Comment',
    targetId: comment._id,
    projectId: project._id,
    description: `Comment added to task "${task.title}"`,
  });

  // Notify task assignee (skip if they're the comment author)
  if (task.assignedTo && task.assignedTo.toString() !== authorId) {
    sendNotification({
      recipientId: task.assignedTo.toString(),
      senderId: authorId,
      message: `Someone commented on your task: "${task.title}"`,
      type: 'comment_added',
      relatedProjectId: project._id.toString(),
      relatedTaskId: task._id.toString(),
    });
  }

  return (await comment.populate([
    { path: 'author', select: 'name email avatar' },
  ])) as unknown as IComment;
};

export const getTaskCommentsService = async (
  taskId: string,
  query: Record<string, unknown>,
): Promise<{ comments: IComment[]; meta: PaginationMeta }> => {
  const page = Math.max(1, parseInt(String(query.page || '1')));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'))));
  const skip = (page - 1) * limit;

  const [total, comments] = await Promise.all([
    Comment.countDocuments({ task: taskId }),
    Comment.find({ task: taskId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 }) // oldest first (chat-like)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    comments: comments as unknown as IComment[],
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateCommentService = async (
  commentId: string,
  content: string,
  userId: string,
): Promise<IComment> => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(MESSAGES.COMMENT.NOT_FOUND, 404);
  }

  if (comment.author.toString() !== userId) {
    throw new AppError(MESSAGES.COMMENT.UNAUTHORIZED_EDIT, 403);
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content, isEdited: true },
    { new: true },
  ).populate('author', 'name email avatar');

  return updatedComment as unknown as IComment;
};

export const deleteCommentService = async (
  commentId: string,
  userId: string,
  role: string,
): Promise<void> => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(MESSAGES.COMMENT.NOT_FOUND, 404);
  }

  const isAuthor = comment.author.toString() === userId;
  const isAdmin = role === USER_ROLES.ADMIN;

  if (!isAuthor && !isAdmin) {
    throw new AppError(MESSAGES.COMMENT.UNAUTHORIZED_DELETE, 403);
  }

  logActivity({
    action: 'COMMENT_DELETED',
    performedBy: userId,
    targetType: 'Comment',
    targetId: commentId,
    projectId: comment.project,
    description: `Comment deleted from task`,
  });

  await Comment.findByIdAndDelete(commentId);
};
