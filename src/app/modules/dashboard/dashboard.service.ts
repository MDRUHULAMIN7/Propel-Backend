import { Types } from 'mongoose';
import { Project } from '../project/project.model.js';
import { Task } from '../task/task.model.js';
import { ActivityLog } from '../activityLog/activityLog.model.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import { TASK_STATUS } from '../../constants/status.constant.js';
import { User } from '../user/user.model.js';

export const getDashboardStatsService = async (userId: string, role: string) => {
  let projectFilter: any = {};
  let taskFilter: any = {};

  if (role === USER_ROLES.PROJECT_MANAGER) {
    projectFilter = { members: new Types.ObjectId(userId) };
    const projects = await Project.find(projectFilter).select('_id');
    const projectIds = projects.map((p) => p._id);
    taskFilter = { project: { $in: projectIds } };
  } else if (role === USER_ROLES.TEAM_MEMBER) {
    projectFilter = { members: new Types.ObjectId(userId) };
    taskFilter = { assignedTo: new Types.ObjectId(userId) };
  }

  const [
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    totalMembers,
  ] = await Promise.all([
    Project.countDocuments(projectFilter),
    Project.countDocuments({ ...projectFilter, status: 'Active' }),
    Project.countDocuments({ ...projectFilter, status: 'Completed' }),
    Task.countDocuments(taskFilter),
    Task.countDocuments({ ...taskFilter, status: TASK_STATUS.COMPLETED }),
    Task.countDocuments({ ...taskFilter, status: { $ne: TASK_STATUS.COMPLETED } }),
    Task.countDocuments({
      ...taskFilter,
      status: { $ne: TASK_STATUS.COMPLETED },
      dueDate: { $lt: new Date() },
    }),
    role === USER_ROLES.ADMIN ? User.countDocuments() : Promise.resolve(undefined),
  ]);

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    ...(role === USER_ROLES.ADMIN && { totalMembers }),
  };
};

export const getChartDataService = async (userId: string, role: string) => {
  let taskFilter: any = {};
  let projectFilter: any = {};
  let projectIds: Types.ObjectId[] = [];

  if (role === USER_ROLES.PROJECT_MANAGER) {
    projectFilter = { members: new Types.ObjectId(userId) };
    const projects = await Project.find(projectFilter).select('_id');
    projectIds = projects.map((p) => p._id as Types.ObjectId);
    taskFilter = { project: { $in: projectIds } };
  } else if (role === USER_ROLES.TEAM_MEMBER) {
    projectFilter = { members: new Types.ObjectId(userId) };
    const projects = await Project.find(projectFilter).select('_id');
    projectIds = projects.map((p) => p._id as Types.ObjectId);
    taskFilter = { assignedTo: new Types.ObjectId(userId) };
  }

  const tasksByPriority = await Task.aggregate([
    { $match: taskFilter },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $project: { priority: '$_id', count: 1, _id: 0 } },
  ]);

  const tasksByStatus = await Task.aggregate([
    { $match: taskFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ]);

  const allProjects = await Project.find(projectFilter).select('_id name');
  const projectProgress = await Promise.all(
    allProjects.map(async (project) => {
      const total = await Task.countDocuments({ project: project._id });
      const completed = await Task.countDocuments({
        project: project._id,
        status: TASK_STATUS.COMPLETED,
      });
      return {
        name: project.name,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }),
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let activityFilter: any = { createdAt: { $gte: sevenDaysAgo } };
  if (role !== USER_ROLES.ADMIN) {
    activityFilter.projectId = { $in: projectIds };
  }

  const weeklyActivity = await ActivityLog.aggregate([
    { $match: activityFilter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } },
  ]);

  return {
    tasksByPriority,
    tasksByStatus,
    projectProgress,
    weeklyActivity,
  };
};

export const getMyTasksSummaryService = async (userId: string) => {
  const taskFilter = { assignedTo: new Types.ObjectId(userId) };

  const [totalTasks, completedTasks, pendingTasks, overdueTasks, upcomingTasks] = await Promise.all(
    [
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: TASK_STATUS.COMPLETED }),
      Task.countDocuments({ ...taskFilter, status: { $ne: TASK_STATUS.COMPLETED } }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: TASK_STATUS.COMPLETED },
        dueDate: { $lt: new Date() },
      }),
      Task.find({
        ...taskFilter,
        status: { $ne: TASK_STATUS.COMPLETED },
        dueDate: {
          $gte: new Date(),
          $lte: new Date(new Date().setDate(new Date().getDate() + 7)),
        },
      })
        .limit(5)
        .sort({ dueDate: 1 })
        .populate('project', 'name')
        .lean(),
    ],
  );

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    upcomingTasks,
  };
};
