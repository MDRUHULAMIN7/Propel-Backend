import { Document, Types } from 'mongoose';
import { TaskStatus, TaskPriority } from '../../constants/status.constant.js';

export interface IAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  project: Types.ObjectId;
  assignedTo: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}
