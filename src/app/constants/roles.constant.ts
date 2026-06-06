export const USER_ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  TEAM_MEMBER: 'team_member',
} as const; 

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
