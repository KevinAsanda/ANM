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
import { ProtectedRoute } from './components/auth/ProtectedRoute.js';
import { RoleRoute } from './components/auth/RoleRoute.js';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <Dashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <Tickets />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/new"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <CreateTicket />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <Inventory />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="admin">
              <Staff />
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
              <MyJobs />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Shared Protected Routes (auth checks only, role filtering handled on detail page or backend) */}
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <TicketDetail />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
