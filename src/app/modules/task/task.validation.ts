import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY } from '../../constants/status.constant.js';

const futureDateCheck = (date: string) => new Date(date) > new Date();

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Task title is required' })
      .min(3, 'Title must be at least 3 characters')
      .max(150, 'Title must be at most 150 characters'),
    description: z.string().max(1000).optional().default(''),
    project: z.string({ required_error: 'Project ID is required' }),
    assignedTo: z.string().optional(),
    dueDate: z
      .string({ required_error: 'Due Date is required' })
      .refine(futureDateCheck, 'Due date cannot be in the past'),
    priority: z
      .enum([TASK_PRIORITY.HIGH, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.LOW])
      .optional()
      .default(TASK_PRIORITY.MEDIUM),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150).optional(),
    description: z.string().max(1000).optional(),
    assignedTo: z.string().nullable().optional(),
    dueDate: z
      .string()
      .refine(futureDateCheck, 'Due date cannot be in the past')
      .optional(),
    priority: z
      .enum([TASK_PRIORITY.HIGH, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.LOW])
      .optional(),
    status: z
      .enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED])
      .optional(),
  }),
  params: z.object({ id: z.string() }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED],
      { required_error: 'Status is required' },
    ),
  }),
  params: z.object({ id: z.string() }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
