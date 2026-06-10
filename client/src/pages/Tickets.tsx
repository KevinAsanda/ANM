import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ticketsService } from '../services/ticketsService.js';
import type { TicketRelation } from '../services/ticketsService.js';
import { Table } from '../components/ui/Table.js';
import type { TableColumn } from '../components/ui/Table.js';
import { Badge } from '../components/ui/Badge.js';
import type { BadgeVariant } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { Spinner } from '../components/ui/Spinner.js';
import { PlusCircle, AlertCircle, FileText } from 'lucide-react';

const Tickets: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'all';

  const [tickets, setTickets] = useState<TicketRelation[]>([]);
  const [activeTab, setActiveTab] = useState<string>(statusParam);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchTickets = async (statusFilter?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsService.getTickets(statusFilter === 'all' ? undefined : statusFilter);
      setTickets(data);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError(err.message || 'Failed to load service tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (statusParam) {
      setActiveTab(statusParam);
    }
  }, [statusParam]);

  useEffect(() => {
    fetchTickets(activeTab);
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ status: tabId });
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Draft Requests' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const columns: TableColumn<TicketRelation>[] = [
    {
      key: 'registration_number',
      header: 'Vehicle Reg',
      render: (row) => row.vehicle?.registration_number || 'N/A'
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => row.customer?.name || 'N/A'
    },
    {
      key: 'mechanic',
      header: 'Assigned Mechanic',
      render: (row) => row.mechanic?.name || 'Unassigned'
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'in_progress' ? 'in_progress' : row.status as BadgeVariant}>
          {row.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'created_at',
      header: 'Date Created',
      render: (row) => new Date(row.created_at).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-medium text-4xl text-text">Service Tickets</h1>
          <p className="text-text-muted text-sm mt-1 font-light">Manage active workshop job cards and status states</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/tickets/new')} className="gap-2 self-start sm:self-auto">
          <PlusCircle size={18} />
          New Ticket
        </Button>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-wider border-b-2 -mb-[2px] transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text hover:border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 animate-fade-in">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="p-6 bg-error-bg border border-error text-error rounded-xl flex items-center gap-4 animate-fade-in">
          <AlertCircle size={24} />
          <div className="flex-1">
            <h3 className="font-display font-medium text-xl">Error Loading Tickets</h3>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => fetchTickets(activeTab)}>
            Try Again
          </Button>
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No service tickets found"
          description={
            activeTab === 'all'
              ? 'Create a service ticket to digitize workshop job cards.'
              : `There are currently no tickets matching the "${activeTab.replace('_', ' ')}" filter.`
          }
          icon={<FileText size={40} />}
          action={
            activeTab === 'all'
              ? {
                  label: 'Create First Ticket',
                  onClick: () => navigate('/tickets/new')
                }
              : undefined
          }
        />
      ) : (
        <Table
          columns={columns}
          data={tickets}
          onRowClick={(row) => navigate(`/tickets/${row.id}`)}
        />
      )}
    </div>
  );
};

export default Tickets;
