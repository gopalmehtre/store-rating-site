import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { submitRating, updateRating } from '../controllers/rating.controller';

const router = Router();

router.post('/', authenticate, authorize('USER'), submitRating);
router.put('/:id', authenticate, authorize('USER'), updateRating);

export default router;
