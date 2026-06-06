import { Response, NextFunction } from 'express';
import { listStaff, createMechanic } from '../services/staff.service.js';
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

export async function postStaff(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, password } = req.body;
    const staff = await createMechanic(name, email, password);
    return res.status(201).json(staff);
  } catch (error) {
    next(error);
  }
}
