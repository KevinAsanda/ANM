import { Request, Response, NextFunction } from 'express';

// In-memory registry to hold active remote scanning sessions
interface ScanSession {
  sessionId: string;
  barcode: string | null;
  scannedAt: string | null;
}

const activeSessions: Record<string, ScanSession> = {};

// 1. Register a new scanner session (Desktop client starts listening)
export function registerSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    activeSessions[sessionId] = {
      sessionId,
      barcode: null,
      scannedAt: null
    };

    return res.status(200).json({ message: 'Session registered successfully', sessionId });
  } catch (error) {
    next(error);
  }
}

// 2. Poll for scan events (Desktop client checks for new scans)
export function pollSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.query;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Valid Session ID is required' });
    }

    const session = activeSessions[sessionId];
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const result = { barcode: session.barcode };

    // Clear barcode once polled so it doesn't trigger multiple times
    if (session.barcode) {
      session.barcode = null;
      session.scannedAt = null;
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// 3. Post a scan event (Mobile browser transmits a scanned barcode)
export function scanBarcode(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId, barcode } = req.body;
    if (!sessionId || !barcode) {
      return res.status(400).json({ error: 'Session ID and Barcode are required' });
    }

    const session = activeSessions[sessionId];
    if (!session) {
      return res.status(404).json({ error: 'Active scanning session not found' });
    }

    session.barcode = barcode;
    session.scannedAt = new Date().toISOString();

    return res.status(200).json({ message: 'Barcode transmitted successfully', barcode });
  } catch (error) {
    next(error);
  }
}
