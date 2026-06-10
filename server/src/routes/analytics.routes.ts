import { Router } from 'express';
import { getFinancials } from '../controllers/analytics.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all analytics endpoints for Admin eyes only
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/financials', getFinancials);

export default router;
