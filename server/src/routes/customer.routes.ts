import { Router } from 'express';
import { z } from 'zod';
import { getCustomers, createCustomer } from '../controllers/customer.controller.js';
import { getCustomerVehicles } from '../controllers/vehicle.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
    phone: z.string().min(10, 'Phone must be at least 10 digits').max(20, 'Phone cannot exceed 20 digits'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
  }),
});

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', getCustomers);
router.post('/', validateRequest(createCustomerSchema), createCustomer);
router.get('/:id/vehicles', getCustomerVehicles);

export default router;
