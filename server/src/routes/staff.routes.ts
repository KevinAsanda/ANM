import { Router } from 'express';
import { getStaff } from '../controllers/staff.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', getStaff);

export default router;
