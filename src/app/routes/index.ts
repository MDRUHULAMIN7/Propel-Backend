import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import projectRoutes from '../modules/project/project.routes.js';
import taskRoutes from '../modules/task/task.routes.js';
import activityLogRoutes from '../modules/activityLog/activityLog.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import commentRoutes from '../modules/comment/comment.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import searchRoutes from '../modules/search/search.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/notifications', notificationRoutes);
router.use('/comments', commentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/search', searchRoutes);

export default router;
