import { Response, NextFunction } from 'express';
import { loginUser } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'No active session found.'
      });
    }
    return res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
}
