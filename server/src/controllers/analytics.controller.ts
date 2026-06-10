import { Response, NextFunction } from 'express';
import { getFinancialAnalytics } from '../services/analytics.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getFinancials(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Only admins should reach this, route is protected by requireRole('admin') middleware
    const { range } = req.query;
    
    // Validate range values
    const allowedRanges = ['30_days', '90_days', 'year_to_date'];
    const selectedRange = allowedRanges.includes(range as string) 
      ? (range as string) 
      : '30_days';

    const report = await getFinancialAnalytics(selectedRange);
    return res.status(200).json(report);
  } catch (error) {
    next(error);
  }
}
