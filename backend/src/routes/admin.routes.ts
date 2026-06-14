import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.get('/stores', getStores);
router.post('/stores', createStore);

export default router;
