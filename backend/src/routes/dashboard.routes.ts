import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticateUser);
router.get('/stats', getStats);
export default router;
