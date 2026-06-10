import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicInvoice from './pages/PublicInvoice.js';
import Home from './pages/Home.js';
import PublicBooking from './pages/PublicBooking.js';
import PublicTracker from './pages/PublicTracker.js';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Customer Portal Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/booking" element={<PublicBooking />} />
      <Route path="/public/booking" element={<PublicBooking />} />
      <Route path="/track/:token" element={<PublicTracker />} />
      <Route path="/public/track/:token" element={<PublicTracker />} />
      <Route path="/invoices/:token" element={<PublicInvoice />} />
      <Route path="/public/invoices/:token" element={<PublicInvoice />} />

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
