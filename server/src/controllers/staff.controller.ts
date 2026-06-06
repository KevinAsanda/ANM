import { Response, NextFunction } from 'express';
import { listStaff } from '../services/staff.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getStaff(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const staff = await listStaff();
    return res.status(200).json(staff);
  } catch (error) {
    next(error);
  }
}
