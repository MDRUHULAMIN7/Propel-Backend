import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface.js';

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'task_assigned', 'task_completed', 'task_updated',
        'task_overdue', 'project_update', 'comment_added',
        'member_added', 'member_removed',
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedProject: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    relatedTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

// Query optimization
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
