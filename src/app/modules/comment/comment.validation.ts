import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    taskId: z.string({ required_error: 'Task ID is required' }),
    content: z
      .string({ required_error: 'Comment content is required' })
      .min(1, 'Comment cannot be empty')
      .max(1000, 'Comment must be at most 1000 characters'),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z
      .string({ required_error: 'Comment content is required' })
      .min(1)
      .max(1000),
  }),
  params: z.object({ id: z.string() }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
