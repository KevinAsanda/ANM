import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as payrollController from '../controllers/payroll.controller.js';

const router = Router();

// All payroll routes require authentication
router.use(authenticate);

// Clock-in / Clock-out session routes (accessible by mechanics and admins)
router.post('/clock-in', payrollController.clockIn);
router.post('/clock-out', payrollController.clockOut);
router.get('/status', payrollController.getClockStatus);

// Summary log route (admins can see everyone; mechanics see their own logs only)
router.get('/summary', payrollController.getPayrollSummary);

// Approval route (Admin only)
router.patch('/:id/approve', requireRole('admin'), payrollController.approveTimesheet);

export default router;
