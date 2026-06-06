import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import validate from '../../middlewares/validate.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from './project.validation.js';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectWorkload,
  getProjectProgress,
} from './project.controller.js';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(getAllProjects)
  .post(
    authorize(USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER),
    validate(createProjectSchema),
    createProject,
  );

router
  .route('/:id')
  .get(getProjectById)
  .patch(
    authorize(USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER),
    validate(updateProjectSchema),
    updateProject,
  )
  .delete(authorize(USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER), deleteProject);

router.post(
  '/:id/members',
  authorize(USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER),
  validate(addMemberSchema),
  addMember,
);

router.delete(
  '/:id/members/:memberId',
  authorize(USER_ROLES.ADMIN, USER_ROLES.PROJECT_MANAGER),
  removeMember,
);

router.get('/:id/workload', getProjectWorkload);
router.get('/:id/progress', getProjectProgress);

export default router;
