import { Document, Types } from 'mongoose';

export type ActionType =
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_DELETED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_COMPLETED'
  | 'TASK_DELETED'
  | 'COMMENT_ADDED'
  | 'COMMENT_DELETED'
  | 'FILE_UPLOADED';

export type TargetType = 'Project' | 'Task' | 'User' | 'Comment';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  action: ActionType;
  performedBy: Types.ObjectId;
  targetType: TargetType;
  targetId: Types.ObjectId;
  projectId: Types.ObjectId | null;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface LogActivityInput {
  action: ActionType;
  performedBy: string | Types.ObjectId;
  targetType: TargetType;
  targetId: string | Types.ObjectId;
  projectId?: string | Types.ObjectId | null;
  description: string;
  metadata?: Record<string, unknown>;
}
