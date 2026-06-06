import { Document, Types } from 'mongoose';

export type NotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'task_updated'
  | 'task_overdue'
  | 'project_update'
  | 'comment_added'
  | 'member_added'
  | 'member_removed';

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedProject: Types.ObjectId | null;
  relatedTask: Types.ObjectId | null;
  createdAt: Date;
}

export interface SendNotificationInput {
  recipientId: string;
  senderId: string;
  message: string;
  type: NotificationType;
  relatedProjectId?: string;
  relatedTaskId?: string;
}
