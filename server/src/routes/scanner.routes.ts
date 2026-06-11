import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as scannerController from '../controllers/scanner.controller.js';

const router = Router();

// Enforce authentication on all remote barcode scanner routes
router.use(authenticate);

router.post('/register', scannerController.registerSession);
router.get('/poll', scannerController.pollSession);
router.post('/scan', scannerController.scanBarcode);

export default router;
