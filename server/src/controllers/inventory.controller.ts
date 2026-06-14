import { Response, NextFunction } from 'express';
import { listInventory, addPart, updatePart, getInventoryForecast } from '../services/inventory.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function getInventory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const lowStock = req.query.low_stock === 'true';
    const items = await listInventory(lowStock);
    return res.status(200).json(items);
  } catch (error) {
    next(error);
  }
}

export async function postPart(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { part_name, part_number, qty_in_stock, reorder_level, unit_cost } = req.body;
    const item = await addPart(
      part_name,
      part_number,
      qty_in_stock !== undefined ? Number(qty_in_stock) : 0,
      reorder_level !== undefined ? Number(reorder_level) : 5,
      unit_cost !== undefined && unit_cost !== null ? Number(unit_cost) : null
    );
    return res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function patchPart(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { part_name, qty_in_stock, reorder_level, unit_cost } = req.body;

    if (!id) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Part ID is required.'
      });
    }

    const updates: any = {};
    if (part_name !== undefined) updates.part_name = part_name;
    if (qty_in_stock !== undefined) updates.qty_in_stock = Number(qty_in_stock);
    if (reorder_level !== undefined) updates.reorder_level = Number(reorder_level);
    if (unit_cost !== undefined) updates.unit_cost = unit_cost !== null ? Number(unit_cost) : null;

    const item = await updatePart(id, updates);
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
}

export async function getAIForecast(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const forecast = await getInventoryForecast();
    return res.status(200).json(forecast);
  } catch (error) {
    next(error);
  }
}
