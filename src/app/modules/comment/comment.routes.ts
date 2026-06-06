import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import validate from '../../middlewares/validate.js';
import { createCommentSchema, updateCommentSchema } from './comment.validation.js';
import {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
} from './comment.controller.js';

const router = Router();
router.use(authenticate);

router
  .route('/')
  .get(getTaskComments)
  .post(validate(createCommentSchema), createComment);

router
  .route('/:id')
  .patch(validate(updateCommentSchema), updateComment)
  .delete(deleteComment);

export default router;
