import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getOwnerDashboard } from '../controllers/owner.controller';

const router = Router();

router.get('/dashboard', authenticate, authorize('STORE_OWNER'), getOwnerDashboard);

export default router;
