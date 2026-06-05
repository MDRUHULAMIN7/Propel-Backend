export const PROJECT_STATUS = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
} as const;

export const TASK_STATUS = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
} as const;

export const TASK_PRIORITY = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];
