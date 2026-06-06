import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';

const MyJobs: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">My Jobs (Mechanic Portal)</h1>
      <p className="text-text-muted mb-6">Welcome, {user?.name} ({user?.email})!</p>
      
      <div className="bg-surface p-6 rounded shadow border border-border">
        <p className="mb-4">This is the Mechanic My Jobs placeholder.</p>
        <Button variant="danger" onClick={logout}>
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default MyJobs;
