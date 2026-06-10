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
  getTicketPartsList,
  postBookingRequest,
  getTrackingDetails,
  patchApproveBooking
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
    status: z.enum(['draft', 'pending', 'in_progress', 'completed', 'cancelled']),
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

const publicBookingSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Name must be at least 2 characters'),
    customerPhone: z.string().min(9, 'Phone number must be at least 9 characters'),
    customerEmail: z.string().email('Invalid email address').optional().nullable(),
    registrationNumber: z.string().min(3, 'Registration number must be at least 3 characters'),
    make: z.string().min(2, 'Vehicle make is required'),
    model: z.string().min(2, 'Vehicle model is required'),
    year: z.number().int().min(1900).max(2100).optional().nullable(),
    description: z.string().min(5, 'Issue description must be at least 5 characters'),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Preferred date must be YYYY-MM-DD'),
    preferredTime: z.enum(['morning', 'afternoon']),
  }),
});

const approveBookingSchema = z.object({
  body: z.object({
    staffId: z.string().uuid('Invalid staff UUID'),
    labourCost: z.number().nonnegative('Labour cost must be 0 or greater'),
  }),
});

// Unauthenticated public customer routes
router.post('/public/booking', validateRequest(publicBookingSchema), postBookingRequest);
router.get('/public/track/:trackingToken', getTrackingDetails);

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
router.patch('/:id/approve', requireRole('admin'), validateRequest(approveBookingSchema), patchApproveBooking);

// Parts logging routes (auth checked inside controller: admin or assigned mechanic only)
router.post('/:id/parts', validateRequest(logPartSchema), postTicketPart);
router.get('/:id/parts', getTicketPartsList);

export default router;
