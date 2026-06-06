import { Response, NextFunction } from 'express';
import { listVehiclesByCustomer, createVehicle } from '../services/vehicle.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getCustomerVehicles(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Customer ID param is required.'
      });
    }

    const vehicles = await listVehiclesByCustomer(id);
    return res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
}

export async function postVehicle(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { customer_id, registration_number, vin, make, model, year } = req.body;
    const vehicle = await createVehicle(
      customer_id,
      registration_number,
      vin,
      make,
      model,
      year
    );
    return res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
}
