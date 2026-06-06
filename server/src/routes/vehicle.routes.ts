import { Router } from 'express';
import { z } from 'zod';
import { postVehicle } from '../controllers/vehicle.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const createVehicleSchema = z.object({
  body: z.object({
    customer_id: z.string().uuid('Invalid customer ID'),
    registration_number: z.string().min(2, 'Registration number must be at least 2 characters').max(20),
    vin: z.string().max(17, 'VIN cannot exceed 17 characters').optional().or(z.literal('')),
    make: z.string().min(1, 'Make is required').max(50),
    model: z.string().min(1, 'Model is required').max(50),
    year: z.number().int().min(1900).max(2100).optional().nullable(),
  }),
});

router.use(authenticate);
router.use(requireRole('admin'));

router.post('/', validateRequest(createVehicleSchema), postVehicle);

export default router;
