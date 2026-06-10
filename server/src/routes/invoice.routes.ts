import { Router } from 'express';
import {
  getInvoices,
  getInvoice,
  getPublicInvoice,
  postInvoice,
  patchInvoiceStatus
} from '../controllers/invoice.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Public route for customers viewing their invoice via the secure token from WhatsApp
router.get('/public/:token', getPublicInvoice);

// Admin-only invoicing routes
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/', getInvoices);
router.post('/', postInvoice);
router.get('/:id', getInvoice);
router.patch('/:id/status', patchInvoiceStatus);

export default router;
