import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsService } from '../services/ticketsService.js';
import type { TicketRelation } from '../services/ticketsService.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import type { BadgeVariant } from '../components/ui/Badge.js';
import { Spinner } from '../components/ui/Spinner.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { Button } from '../components/ui/Button.js';
import { Clipboard, AlertCircle } from 'lucide-react';

const MyJobs: React.FC = () => {
  const [jobs, setJobs] = useState<TicketRelation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsService.getMyJobs();
      setJobs(data);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load assigned jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-text">My Jobs</h1>
        <p className="text-text-muted text-sm mt-1">Review and update status on your assigned workshop service tickets</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="p-6 bg-error-bg border border-error text-error rounded-lg flex items-center gap-4">
          <AlertCircle size={24} />
          <div className="flex-1">
            <h3 className="font-bold text-lg">Error Loading Jobs</h3>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={fetchJobs}>
            Try Again
          </Button>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs assigned to you yet"
          description="Enjoy the breather! When an admin assigns you a ticket, it will appear here instantly."
          icon={<Clipboard size={40} />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              onClick={() => navigate(`/tickets/${job.id}`)}
              className="flex flex-col gap-4 hover:border-primary-hover active:border-primary-hover"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs uppercase font-semibold tracking-wider text-text-muted">
                    Registration
                  </span>
                  <h2 className="text-xl font-bold text-text mt-0.5">{job.vehicle?.registration_number || 'N/A'}</h2>
                </div>
                <Badge variant={job.status === 'in_progress' ? 'in_progress' : job.status as BadgeVariant}>
                  {job.status.replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-text-muted">
                  Vehicle
                </span>
                <p className="text-base font-semibold text-text mt-0.5">
                  {job.vehicle?.make} {job.vehicle?.model} {job.vehicle?.year ? `(${job.vehicle?.year})` : ''}
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <span className="text-xs uppercase font-semibold tracking-wider text-text-muted">
                  Job Description
                </span>
                <p className="text-sm text-text-muted mt-1 line-clamp-2">
                  {job.description}
                </p>
              </div>

              <div className="text-xs text-text-muted mt-auto pt-2 flex justify-between">
                <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
                <span>Last Updated: {new Date(job.updated_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
