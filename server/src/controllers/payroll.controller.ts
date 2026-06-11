import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import * as payrollService from '../services/payroll.service.js';

// 1. Clock In
export async function clockIn(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const staffId = req.user?.id;
    if (!staffId) {
      return res.status(401).json({ error: 'Unauthorized: User context missing' });
    }

    const timesheet = await payrollService.clockIn(staffId);
    return res.status(201).json(timesheet);
  } catch (error: any) {
    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}

// 2. Clock Out
export async function clockOut(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const staffId = req.user?.id;
    if (!staffId) {
      return res.status(401).json({ error: 'Unauthorized: User context missing' });
    }

    const timesheet = await payrollService.clockOut(staffId);
    return res.status(200).json(timesheet);
  } catch (error: any) {
    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}

// 3. Get Current Clock-In Status
export async function getClockStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const staffId = req.user?.id;
    if (!staffId) {
      return res.status(401).json({ error: 'Unauthorized: User context missing' });
    }

    const timesheet = await payrollService.getClockStatus(staffId);
    return res.status(200).json(timesheet);
  } catch (error) {
    next(error);
  }
}

// 4. Get Payroll Summary Logs
export async function getPayrollSummary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User context missing' });
    }

    let logs;
    if (user.role === 'admin') {
      // Admin can view all or filter by staff_id query parameter
      const staffIdQuery = req.query.staff_id as string | undefined;
      logs = await payrollService.getPayrollSummary(staffIdQuery);
    } else {
      // Mechanic can ONLY view their own logs
      logs = await payrollService.getPayrollSummary(user.id);
    }

    return res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
}

// 5. Approve Timesheet
export async function approveTimesheet(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user?.id;
    if (!adminId || req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Timesheet ID is required' });
    }

    const approvedRecord = await payrollService.approveTimesheet(id, adminId);
    return res.status(200).json(approvedRecord);
  } catch (error: any) {
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    if (error.status === 400) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}
