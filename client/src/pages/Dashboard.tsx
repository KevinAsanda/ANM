import React from 'react';
import { useAuth } from '../context/AuthContext.js';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-text mb-2">Admin Dashboard</h1>
      <p className="text-text-muted mb-6">Welcome back, {user?.name}!</p>
      
      <div className="bg-surface p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-lg font-bold text-text mb-4">Workshop Overview</h2>
        <p className="text-text-muted">This is the Admin Dashboard workspace. Sprint 6 will hook up real statistics and low stock warnings here.</p>
      </div>
    </div>
  );
};

export default Dashboard;
