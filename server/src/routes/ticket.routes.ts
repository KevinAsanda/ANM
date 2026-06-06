import { Router } from 'express';
import { z } from 'zod';
import {
  getTickets,
  getMyJobs,
  postTicket,
  getTicket,
  patchTicketStatus,
  patchTicketNotes
} from '../controllers/ticket.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const createTicketSchema = z.object({
  body: z.object({
    vehicle_id: z.string().uuid('Invalid vehicle ID'),
    staff_id: z.string().uuid('Invalid staff ID'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    labour_cost: z.number().nonnegative('Labour cost must be 0 or greater').optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  }),
});

const updateNotesSchema = z.object({
  body: z.object({
    notes: z.string(),
  }),
});

router.use(authenticate);

// Mechanic jobs endpoint
router.get('/my-jobs', requireRole('mechanic'), getMyJobs);

// Admin endpoints for list and create
router.get('/', requireRole('admin'), getTickets);
router.post('/', requireRole('admin'), validateRequest(createTicketSchema), postTicket);

// Shared route (authorization checked inside controller)
router.get('/:id', getTicket);
router.patch('/:id/status', validateRequest(updateStatusSchema), patchTicketStatus);

// Admin note update
router.patch('/:id/notes', requireRole('admin'), validateRequest(updateNotesSchema), patchTicketNotes);

export default router;
