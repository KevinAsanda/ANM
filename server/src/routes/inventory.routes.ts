import { Router } from 'express';
import { z } from 'zod';
import { getInventory, postPart, patchPart, getAIForecast } from '../controllers/inventory.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const createPartSchema = z.object({
  body: z.object({
    part_name: z.string().min(1, 'Part name is required').max(100),
    part_number: z.string().max(50).optional().nullable(),
    qty_in_stock: z.number().int().nonnegative('Quantity must be 0 or greater').optional(),
    reorder_level: z.number().int().positive('Reorder level must be at least 1').optional(),
    unit_cost: z.number().nonnegative('Unit cost must be 0 or greater').optional().nullable(),
  }),
});

const updatePartSchema = z.object({
  body: z.object({
    part_name: z.string().min(1).max(100).optional(),
    qty_in_stock: z.number().int().nonnegative('Quantity must be 0 or greater').optional(),
    reorder_level: z.number().int().positive('Reorder level must be at least 1').optional(),
    unit_cost: z.number().nonnegative('Unit cost must be 0 or greater').optional().nullable(),
  }),
});

router.use(authenticate);

// List inventory is open to both admins and mechanics
router.get('/', getInventory);

// AI-based forecast route (admin only)
router.get('/ai-forecast', requireRole('admin'), getAIForecast);

// Admin-only management routes
router.post('/', requireRole('admin'), validateRequest(createPartSchema), postPart);
router.patch('/:id', requireRole('admin'), validateRequest(updatePartSchema), patchPart);

export default router;
