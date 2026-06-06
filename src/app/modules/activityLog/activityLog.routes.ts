import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import {
  getProjectLogs,
  getAllLogs,
  getUserLogs,
} from './activityLog.controller.js';

const router = Router();
router.use(authenticate);

router.get('/project/:projectId', getProjectLogs);
router.get('/user/:userId', getUserLogs);
router.get('/', authorize(USER_ROLES.ADMIN), getAllLogs);

export default router;
