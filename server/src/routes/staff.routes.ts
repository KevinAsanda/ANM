import { Router } from 'express';
import { z } from 'zod';
import { getStaff, postStaff } from '../controllers/staff.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const createMechanicSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', getStaff);
router.post('/', validateRequest(createMechanicSchema), postStaff);

export default router;
