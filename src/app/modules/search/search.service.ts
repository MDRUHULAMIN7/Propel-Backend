import { Types } from 'mongoose';
import { Project } from '../project/project.model.js';
import { Task } from '../task/task.model.js';
import { User } from '../user/user.model.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import { buildSearchFilter } from '../../utils/queryBuilder.js';
import { IProject } from '../project/project.interface.js';
import { ITask } from '../task/task.interface.js';
import { IUser } from '../user/user.interface.js';

export const globalSearchService = async (
  query: string,
  userId: string,
  role: string,
): Promise<{ projects: IProject[]; tasks: ITask[]; users: IUser[]; totalResults: number }> => {
  const projectSearchFilter = buildSearchFilter(query, ['name', 'description']);
  const taskSearchFilter = buildSearchFilter(query, ['title', 'description']);
  const userSearchFilter = buildSearchFilter(query, ['name', 'email']);

  let projectFilter: any = { ...projectSearchFilter };
  let taskFilter: any = { ...taskSearchFilter };

  if (role !== USER_ROLES.ADMIN) {
    projectFilter = {
      ...projectFilter,
      members: new Types.ObjectId(userId),
    };

    const userProjects = await Project.find({ members: new Types.ObjectId(userId) }).select('_id');
    const projectIds = userProjects.map((p) => p._id);
    taskFilter = {
      ...taskFilter,
      project: { $in: projectIds },
    };
  }

  const searchPromises: any[] = [
    Project.find(projectFilter).limit(5).lean(),
    Task.find(taskFilter)
      .populate('project', 'name')
      .populate('assignedTo', 'name avatar')
      .limit(5)
      .lean(),
  ];

  if (role === USER_ROLES.ADMIN) {
    searchPromises.push(User.find(userSearchFilter).select('-password').limit(5).lean());
  } else {
    searchPromises.push(Promise.resolve([]));
  }

  const [projects, tasks, users] = await Promise.all(searchPromises);

  const totalResults = projects.length + tasks.length + users.length;

  return {
    projects: projects as unknown as IProject[],
    tasks: tasks as unknown as ITask[],
    users: users as unknown as IUser[],
    totalResults,
  };
};
