import { z } from 'zod';
import { USER_ROLES } from '../../constants/roles.constant.js';

export const updateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters')
      .optional(),
    avatar: z.string().url('Please provide a valid URL').optional(),
  }),
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(
      [USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.TEAM_MEMBER],
      { required_error: 'Role is required' },
    ),
  }),
  params: z.object({
    id: z.string({ required_error: 'User ID is required' }),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
