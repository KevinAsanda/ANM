import { Response, NextFunction } from 'express';
import {
  getDashboardStats,
  getRecentTickets,
  getLowStockItems
} from '../services/dashboard.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await getDashboardStats();
    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

export async function getRecent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const recent = await getRecentTickets();
    return res.status(200).json(recent);
  } catch (error) {
    next(error);
  }
}

export async function getLowStock(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const lowStock = await getLowStockItems();
    return res.status(200).json(lowStock);
  } catch (error) {
    next(error);
  }
}
