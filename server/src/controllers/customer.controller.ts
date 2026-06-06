import { Response, NextFunction } from 'express';
import { listCustomers, createOrGetCustomer } from '../services/customer.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getCustomers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const customers = await listCustomers();
    return res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
}

export async function createCustomer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, phone, email } = req.body;
    const result = await createOrGetCustomer(name, phone, email);
    const statusCode = result.deduplicated ? 200 : 201;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
}
