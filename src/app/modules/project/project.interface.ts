import { Document, Types } from 'mongoose';
import { ProjectStatus } from '../../constants/status.constant.js';

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  deadline: Date;
  status: ProjectStatus;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMemberWorkload {
  userId: Types.ObjectId;
  name: string;
  email: string;
  avatar: string | null;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface IProjectProgress {
  projectId: Types.ObjectId;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  overdueTasks: number;
}
