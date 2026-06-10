import { Request, Response, NextFunction } from 'express';
import {
  createInvoice,
  listInvoices,
  getInvoiceDetails,
  getInvoiceByToken,
  updateInvoiceStatus
} from '../services/invoice.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getInvoices(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { status } = req.query;
    const invoices = await listInvoices(status as string);
    return res.status(200).json(invoices);
  } catch (error) {
    next(error);
  }
}

export async function getInvoice(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invoice ID is required.'
      });
    }

    const invoice = await getInvoiceDetails(id);
    return res.status(200).json(invoice);
  } catch (error) {
    next(error);
  }
}

export async function getPublicInvoice(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Secure token is required.'
      });
    }

    const invoice = await getInvoiceByToken(token);
    return res.status(200).json(invoice);
  } catch (error) {
    next(error);
  }
}

export async function postInvoice(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { ticket_id, labour_cost } = req.body;
    if (!ticket_id) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Ticket ID is required.'
      });
    }

    const invoice = await createInvoice(
      ticket_id,
      labour_cost !== undefined ? Number(labour_cost) : undefined
    );
    return res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
}

export async function patchInvoiceStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { status, payment_method } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invoice ID and status are required.'
      });
    }

    if (status !== 'unpaid' && status !== 'paid' && status !== 'void') {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid status. Must be unpaid, paid, or void.'
      });
    }

    if (payment_method && payment_method !== 'cash' && payment_method !== 'card' && payment_method !== 'eft') {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid payment method. Must be cash, card, or eft.'
      });
    }

    const invoice = await updateInvoiceStatus(id, status, payment_method);
    return res.status(200).json(invoice);
  } catch (error) {
    next(error);
  }
}
