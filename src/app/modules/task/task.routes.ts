import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import validate from '../../middlewares/validate.js';
import { upload } from '../../middlewares/upload.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from './task.validation.js';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  uploadAttachment,
} from './task.controller.js';

const router = Router();
router.use(authenticate);

router
  .route('/')
  .get(getAllTasks)
  .post(
    authorize(USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER),
    validate(createTaskSchema),
    createTask,
  );

router
  .route('/:id')
  .get(getTaskById)
  .patch(validate(updateTaskSchema), updateTask)
  .delete(
    authorize(USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER),
    deleteTask,
  );

router.patch(
  '/:id/status',
  validate(updateTaskStatusSchema),
  updateTaskStatus,
);

router.post(
  '/:id/attachments',
  upload.array('files', 5),
  uploadAttachment,
);

export default router;
