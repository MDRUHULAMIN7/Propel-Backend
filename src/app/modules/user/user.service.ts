import { User } from './user.model.js';
import AppError from '../../errors/AppError.js';
import { MESSAGES } from '../../constants/messages.constant.js';
import { UpdateUserInput } from './user.validation.js';
import { PaginationMeta, IUserPayload } from '../../types/index.js';
import { IUserSafe } from './user.interface.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import QueryBuilder from '../../builder/QueryBuilder.js';

export const getAllUsersService = async (
  query: Record<string, unknown>,
): Promise<{ users: IUserSafe[]; meta: PaginationMeta }> => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const users = await userQuery.modelQuery.lean();
  const meta = await userQuery.countTotal();

  return {
    users: users as unknown as IUserSafe[],
    meta: {
      total: meta.total,
      page: meta.page,
      limit: meta.limit,
      totalPages: meta.totalPage,
    },
  };
};

export const getUserByIdService = async (id: string): Promise<IUserSafe> => {
  const user = await User.findOne({ _id: id, isActive: true }).lean();
  if (!user) {
    throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
  }
  return user as unknown as IUserSafe;
};

export const updateUserService = async (
  id: string,
  payload: UpdateUserInput,
  currentUser: IUserPayload,
): Promise<IUserSafe> => {
  if (currentUser.role !== USER_ROLES.ADMIN && currentUser._id.toString() !== id) {
    throw new AppError(MESSAGES.AUTH.FORBIDDEN, 403);
  }

  const user = await User.findOne({ _id: id, isActive: true });
  if (!user) {
    throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
  }

  if (payload.name) user.name = payload.name;
  if (payload.avatar) user.avatar = payload.avatar;

  await user.save();
  return user.toObject() as unknown as IUserSafe;
};

export const deleteUserService = async (
  id: string,
  currentUser: IUserPayload,
): Promise<null> => {
  if (currentUser._id.toString() === id) {
    throw new AppError('You cannot delete yourself', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
  }

  user.isActive = false;
  await user.save();

  return null;
};

export const updateUserRoleService = async (
  id: string,
  role: string,
  currentUser: IUserPayload,
): Promise<IUserSafe> => {
  if (currentUser._id.toString() === id) {
    throw new AppError('You cannot change your own role', 400);
  }

  const user = await User.findOne({ _id: id, isActive: true });
  if (!user) {
    throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
  }

  user.role = role as any;
  await user.save();

  return user.toObject() as unknown as IUserSafe;
};
