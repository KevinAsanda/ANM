import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import staffRoutes from './routes/staff.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import { errorHandler } from './middleware/error.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/invoices', invoiceRoutes);

// Root path diagnostic route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Server] ANM Service Management API running on http://localhost:${PORT}`);
});
