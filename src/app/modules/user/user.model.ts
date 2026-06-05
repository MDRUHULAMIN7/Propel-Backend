import { Schema, model } from 'mongoose';
import { IUser } from './user.interface.js';
import { USER_ROLES } from '../../constants/roles.constant.js';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'নাম দিতে হবে'],
      trim: true,
      minlength: [2, 'নাম কমপক্ষে ২ অক্ষর'],
      maxlength: [50, 'নাম সর্বোচ্চ ৫০ অক্ষর'],
    },
    email: {
      type: String,
      required: [true, 'ইমেইল দিতে হবে'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'পাসওয়ার্ড দিতে হবে'],
      select: false, // query-তে আলাদাভাবে .select('+password') না দিলে আসবে না
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.TEAM_MEMBER,
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Response-এ password আসবে না
      transform: (_doc, ret: any) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

export const User = model<IUser>('User', userSchema);
