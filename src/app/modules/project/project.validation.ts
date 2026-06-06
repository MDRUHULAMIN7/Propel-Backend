import { z } from 'zod';
import { PROJECT_STATUS } from '../../constants/status.constant.js';

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Project name is required' })
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must be at most 100 characters'),
    description: z.string().max(500).optional().default(''),
    deadline: z
      .string({ required_error: 'Deadline is required' })
      .refine(
        (date) => new Date(date) > new Date(),
        'Deadline cannot be in the past',
      ),
    status: z
      .enum([PROJECT_STATUS.ACTIVE, PROJECT_STATUS.COMPLETED, PROJECT_STATUS.ON_HOLD])
      .optional()
      .default(PROJECT_STATUS.ACTIVE),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().max(500).optional(),
    deadline: z
      .string()
      .refine((date) => new Date(date) > new Date(), 'Deadline cannot be in the past')
      .optional(),
    status: z
      .enum([PROJECT_STATUS.ACTIVE, PROJECT_STATUS.COMPLETED, PROJECT_STATUS.ON_HOLD])
      .optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Project ID is required' }),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    memberId: z.string({ required_error: 'Member ID is required' }),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
