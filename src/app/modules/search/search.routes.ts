import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { globalSearch } from './search.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', globalSearch);

export default router;
