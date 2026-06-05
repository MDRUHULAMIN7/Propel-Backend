import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import validate from '../../middlewares/validate.js';
import { registerSchema, loginSchema, demoLoginSchema } from './auth.validation.js';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  demoLogin,
} from './auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/demo-login', validate(demoLoginSchema), demoLogin);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
