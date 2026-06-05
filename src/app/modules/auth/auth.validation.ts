import { z } from 'zod';
import { USER_ROLES } from '../../constants/roles.constant.js';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid email format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase and a number',
      ),
    role: z
      .enum([USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.TEAM_MEMBER])
      .optional()
      .default(USER_ROLES.TEAM_MEMBER),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid email format'),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const demoLoginSchema = z.object({
  body: z.object({
    role: z
      .enum([USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER, USER_ROLES.TEAM_MEMBER])
      .optional()
      .default(USER_ROLES.TEAM_MEMBER),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
