import { Router } from 'express';
import { getStats, getRecent, getLowStock } from '../controllers/dashboard.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/stats', getStats);
router.get('/recent-tickets', getRecent);
router.get('/low-stock', getLowStock);

export default router;
