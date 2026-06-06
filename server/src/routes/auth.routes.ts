import { Router } from 'express';
import { z } from 'zod';
import { login, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticate, me);

export default router;
