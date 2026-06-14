import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, changePassword, getStoreOwners } from '../controllers/user.controller';

const router = Router();

router.get('/me', authenticate, getProfile);
router.put('/change-password', authenticate, changePassword);
router.get('/store-owners', authenticate, getStoreOwners);

export default router;
