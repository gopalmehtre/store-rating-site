import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getStores } from '../controllers/store.controller';

const router = Router();

router.get('/', authenticate, authorize('USER', 'ADMIN'), getStores);

export default router;
