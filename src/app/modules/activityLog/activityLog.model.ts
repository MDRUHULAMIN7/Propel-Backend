import { Schema, model } from 'mongoose';
import { IActivityLog } from './activityLog.interface.js';

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: {
      type: String,
      enum: [
        'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED',
        'MEMBER_ADDED', 'MEMBER_REMOVED',
        'TASK_CREATED', 'TASK_UPDATED', 'TASK_ASSIGNED',
        'TASK_STATUS_CHANGED', 'TASK_COMPLETED', 'TASK_DELETED',
        'COMMENT_ADDED', 'COMMENT_DELETED', 'FILE_UPLOADED',
      ],
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['Project', 'Task', 'User', 'Comment'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toObject: { versionKey: false },
  },
);

// Query optimization
activityLogSchema.index({ projectId: 1, createdAt: -1 });
activityLogSchema.index({ performedBy: 1, createdAt: -1 });

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
