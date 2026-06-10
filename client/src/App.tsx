import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import Tickets from './pages/Tickets.js';
import CreateTicket from './pages/CreateTicket.js';
import TicketDetail from './pages/TicketDetail.js';
import Inventory from './pages/Inventory.js';
import Staff from './pages/Staff.js';
import MyJobs from './pages/MyJobs.js';
import Invoices from './pages/Invoices.js';
import InvoiceDetail from './pages/InvoiceDetail.js';
import PublicInvoice from './pages/PublicInvoice.js';
import Analytics from './pages/Analytics.js';
import Home from './pages/Home.js';
import PublicBooking from './pages/PublicBooking.js';
import PublicTracker from './pages/PublicTracker.js';
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';
import { RoleRoute } from './components/auth/RoleRoute.js';
import { AppShell } from './components/layout/AppShell.js';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/public/booking" element={<PublicBooking />} />
      <Route path="/public/track/:token" element={<PublicTracker />} />
      <Route path="/public/invoices/:token" element={<PublicInvoice />} />

      {/* Protected Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <AppShell>
                <Dashboard />
              </AppShell>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <AppShell>
                <Tickets />
              </AppShell>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/new"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <AppShell>
                <CreateTicket />
              </AppShell>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <AppShell>
                <Inventory />
              </AppShell>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <AppShell>
                <Staff />
              </AppShell>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <AppShell>
                <Invoices />
              </AppShell>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <AppShell>
                <InvoiceDetail />
              </AppShell>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <AppShell>
                <Analytics />
              </AppShell>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Protected Mechanic Routes */}
      <Route
        path="/my-jobs"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="mechanic">
              <AppShell>
                <MyJobs />
              </AppShell>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Shared Protected Routes (auth checks only, role filtering handled on detail page or backend) */}
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <TicketDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
