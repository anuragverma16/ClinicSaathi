import { Router } from 'express';
import * as c from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();
router.post('/register', authLimiter, c.register);
router.post('/login', authLimiter, c.login);
router.post('/logout', c.logout);
router.post('/forgot-password', authLimiter, c.forgotPassword);
router.post('/reset-password', authLimiter, c.resetPassword);
router.get('/me', authenticateUser, c.me);
export default router;
