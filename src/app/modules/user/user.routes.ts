import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import validate from '../../middlewares/validate.js';
import { USER_ROLES } from '../../constants/roles.constant.js';
import { updateUserSchema, updateUserRoleSchema } from './user.validation.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getMyProfile,
} from './user.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', getMyProfile);

router
  .route('/')
  .get(authorize(USER_ROLES.ADMIN), getAllUsers);

router
  .route('/:id')
  .get(getUserById)
  .patch(validate(updateUserSchema), updateUser)
  .delete(authorize(USER_ROLES.ADMIN), deleteUser);

router.patch(
  '/:id/role',
  authorize(USER_ROLES.ADMIN),
  validate(updateUserRoleSchema),
  updateUserRole,
);

export default router;
