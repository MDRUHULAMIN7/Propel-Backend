import { Schema, model } from 'mongoose';
import { IComment } from './comment.interface.js';

const commentSchema = new Schema<IComment>(
  {
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment must be at most 1000 characters'],
    },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true },
);

commentSchema.index({ task: 1, createdAt: 1 });

export const Comment = model<IComment>('Comment', commentSchema);
