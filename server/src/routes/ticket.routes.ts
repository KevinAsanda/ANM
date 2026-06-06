import { Router } from 'express';
import { z } from 'zod';
import {
  getTickets,
  getMyJobs,
  postTicket,
  getTicket,
  patchTicketStatus,
  patchTicketNotes,
  postTicketPart,
  getTicketPartsList
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

const logPartSchema = z.object({
  body: z.object({
    inventory_id: z.string().regex(/^[a-zA-Z0-9-]{4,36}$/, 'Invalid inventory ID'),
    qty_used: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1'),
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

// Parts logging routes (auth checked inside controller: admin or assigned mechanic only)
router.post('/:id/parts', validateRequest(logPartSchema), postTicketPart);
router.get('/:id/parts', getTicketPartsList);

export default router;
