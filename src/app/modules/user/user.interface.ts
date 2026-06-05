import { Document, Types } from 'mongoose';
import { UserRole } from '../../constants/roles.constant.js';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// password বাদ দিয়ে safe version — response-এ এটা পাঠাবে
export type IUserSafe = Omit<IUser, 'password'>;
