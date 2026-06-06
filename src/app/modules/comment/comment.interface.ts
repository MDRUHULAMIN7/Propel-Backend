import { Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  project: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
