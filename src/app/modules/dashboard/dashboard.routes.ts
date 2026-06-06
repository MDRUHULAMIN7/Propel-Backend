import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import {
  getDashboardStats,
  getChartData,
  getMyTasksSummary,
} from './dashboard.controller.js';

const router = Router();
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/charts', getChartData);
router.get('/my-summary', getMyTasksSummary);

export default router;
