import { Request, Response, NextFunction } from 'express';
import {
  listTickets,
  listMechanicTickets,
  createTicket,
  getTicketDetails,
  updateTicketStatus,
  updateTicketNotes,
  logPartOnTicket,
  getTicketParts,
  createBookingRequest,
  getTicketByTrackingToken,
  approveBooking
} from '../services/ticket.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getTickets(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { status } = req.query;
    const tickets = await listTickets(status as string);
    return res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
}

export async function getMyJobs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || req.user.role !== 'mechanic') {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Mechanic access only.'
      });
    }

    const tickets = await listMechanicTickets(req.user.id);
    return res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
}

export async function postTicket(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { vehicle_id, staff_id, description, labour_cost } = req.body;
    const createdBy = req.user!.id; // Authenticated admin

    const ticket = await createTicket(
      vehicle_id,
      staff_id,
      createdBy,
      description,
      labour_cost ? Number(labour_cost) : 0.00
    );
    return res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
}

export async function getTicket(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Ticket ID is required.'
      });
    }

    const ticket = await getTicketDetails(id);

    // Enforce authorization check: mechanic can only view if assigned
    if (req.user!.role === 'mechanic' && ticket.staff_id !== req.user!.id) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not have permission to view this ticket.'
      });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
}

export async function patchTicketStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Ticket ID and status are required.'
      });
    }

    const ticket = await updateTicketStatus(
      id,
      status,
      req.user!.role,
      req.user!.id
    );

    return res.status(200).json({
      id: ticket.id,
      status: ticket.status,
      updated_at: ticket.updated_at
    });
  } catch (error: any) {
    // Pass custom error status or forward
    next(error);
  }
}

export async function patchTicketNotes(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!id || notes === undefined) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Ticket ID and notes are required.'
      });
    }

    const ticket = await updateTicketNotes(id, notes);
    return res.status(200).json({
      id: ticket.id,
      notes: ticket.notes,
      updated_at: ticket.updated_at
    });
  } catch (error) {
    next(error);
  }
}

export async function postTicketPart(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: ticketId } = req.params;
    const { inventory_id, qty_used } = req.body;

    const loggedBy = req.user!.id;
    const userRole = req.user!.role;

    const partLog = await logPartOnTicket(
      ticketId,
      inventory_id,
      Number(qty_used),
      loggedBy,
      userRole
    );

    return res.status(201).json(partLog);
  } catch (error) {
    next(error);
  }
}

export async function getTicketPartsList(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: ticketId } = req.params;
    const loggedBy = req.user!.id;
    const userRole = req.user!.role;

    const parts = await getTicketParts(ticketId, loggedBy, userRole);
    return res.status(200).json(parts);
  } catch (error) {
    next(error);
  }
}

export async function postBookingRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      registrationNumber,
      make,
      model,
      year,
      description,
      preferredDate,
      preferredTime
    } = req.body;

    const ticket = await createBookingRequest(
      customerName,
      customerPhone,
      customerEmail || null,
      registrationNumber,
      make,
      model,
      year ? Number(year) : null,
      description,
      preferredDate,
      preferredTime
    );

    return res.status(201).json({
      message: 'Booking request submitted successfully.',
      ticketId: ticket.id,
      trackingToken: ticket.tracking_token,
      trackingUrl: `/public/track/${ticket.tracking_token}`
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrackingDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { trackingToken } = req.params;
    if (!trackingToken) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Tracking token is required.'
      });
    }

    const details = await getTicketByTrackingToken(trackingToken);
    return res.status(200).json(details);
  } catch (error) {
    next(error);
  }
}

export async function patchApproveBooking(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { staffId, labourCost } = req.body;

    if (!id || !staffId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Ticket ID and Mechanic ID (staffId) are required.'
      });
    }

    const ticket = await approveBooking(id, staffId, Number(labourCost));
    return res.status(200).json({
      message: 'Booking request approved and ticket transitioned to pending status.',
      ticket
    });
  } catch (error) {
    next(error);
  }
}

export async function sendTrackingEmail(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Ticket ID is required.'
      });
    }

    const ticket = await getTicketDetails(id);
    if (!ticket.customer || !ticket.customer.email) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Customer email is not registered for this ticket.'
      });
    }

    if (!ticket.tracking_token) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Tracking token has not been generated for this ticket.'
      });
    }

    const clientUrl = process.env.CLIENT_CUSTOMER_URL || 'http://localhost:5173';
    const trackingUrl = `${clientUrl}/public/track/${ticket.tracking_token}`;
    const subject = `Track your vehicle repair status at ANM Workshop`;
    const body = `Hi ${ticket.customer.name},\n\nYour vehicle repair request for ${ticket.vehicle?.make} ${ticket.vehicle?.model} (${ticket.vehicle?.registration_number}) is registered under status "${ticket.status.toUpperCase()}".\n\nYou can track its live status, parts utilized, and invoice here:\n${trackingUrl}\n\nRegards,\nANM Workshop Team`;

    console.log(`
=========================================
[SIMULATED EMAIL SENT]
To: ${ticket.customer.email}
Subject: ${subject}
Body: 
${body}
=========================================
`);

    return res.status(200).json({
      success: true,
      message: 'Tracking link email simulated successfully.',
      recipient: ticket.customer.email,
      simulatedEmail: {
        to: ticket.customer.email,
        subject,
        body
      }
    });
  } catch (error) {
    next(error);
  }
}
