import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { ticketsService } from '../services/ticketsService.js';
import type { TicketRelation } from '../services/ticketsService.js';
import { Badge } from '../components/ui/Badge.js';
import type { BadgeVariant } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Select } from '../components/ui/Select.js';
import { Textarea } from '../components/ui/Textarea.js';
import { Spinner } from '../components/ui/Spinner.js';
import { ArrowLeft, AlertCircle, Save, CheckCircle } from 'lucide-react';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [ticket, setTicket] = useState<TicketRelation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status/Notes states
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [notesText, setNotesText] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [notesMessage, setNotesMessage] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const fetchTicket = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsService.getTicket(id);
      setTicket(data);
      setSelectedStatus(data.status);
      setNotesText(data.notes || '');
    } catch (err: any) {
      console.error('Error fetching ticket details:', err);
      if (err.status === 403) {
        setError('You do not have permission to view this ticket.');
      } else {
        setError(err.message || 'Failed to load ticket details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id || !selectedStatus || !ticket) return;
    setIsUpdatingStatus(true);
    setStatusMessage(null);
    try {
      await ticketsService.updateTicketStatus(id, selectedStatus);
      setStatusMessage('Status updated successfully!');
      
      // Update local ticket state status & updated_at
      setTicket(prev => prev ? {
        ...prev,
        status: selectedStatus as any,
        updated_at: new Date().toISOString()
      } : null);

      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update ticket status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleNotesUpdate = async () => {
    if (!id || !ticket) return;
    setIsSavingNotes(true);
    setNotesMessage(null);
    try {
      await ticketsService.updateTicketNotes(id, notesText);
      setNotesMessage('Notes saved successfully!');

      setTicket(prev => prev ? {
        ...prev,
        notes: notesText,
        updated_at: new Date().toISOString()
      } : null);

      setTimeout(() => setNotesMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving notes:', err);
      setError(err.message || 'Failed to save notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <div className="p-6 bg-error-bg border border-error text-error rounded-lg flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <h3 className="font-bold text-lg">Error Loading Ticket</h3>
          </div>
          <p className="text-sm">{error || 'Ticket details not found.'}</p>
          <div className="flex gap-4 mt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(isAdmin ? '/tickets' : '/my-jobs')}
            >
              Back to List
            </Button>
            {id && !error.includes('permission') && (
              <Button variant="danger" size="sm" onClick={fetchTicket}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filter status dropdown options based on role
  // Mechanics can only change status: Pending -> In Progress, In Progress -> Completed.
  // Admins can do anything.
  const statusOptions = isAdmin
    ? [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    : [
        { value: 'pending', label: 'Pending', disabled: selectedStatus !== 'pending' },
        { value: 'in_progress', label: 'In Progress', disabled: selectedStatus === 'completed' },
        { value: 'completed', label: 'Completed', disabled: selectedStatus === 'pending' }
      ].filter(o => !o.disabled);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(isAdmin ? '/tickets' : '/my-jobs')}
          className="p-2 border border-border rounded-lg text-text-muted hover:bg-slate-100 transition-colors"
          aria-label="Back to tickets list"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-3">
              Job Card: {ticket.vehicle?.registration_number}
              <Badge variant={ticket.status === 'in_progress' ? 'in_progress' : ticket.status as BadgeVariant}>
                {ticket.status.replace('_', ' ')}
              </Badge>
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Created: {new Date(ticket.created_at).toLocaleString()} | Updated: {new Date(ticket.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Customer & Vehicle Info */}
          <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4">
            <h2 className="text-lg font-bold text-text border-b border-border pb-2">Customer & Vehicle Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-text-muted">Customer Name</span>
                <p className="text-text font-bold mt-0.5">{ticket.customer?.name}</p>
              </div>
              {isAdmin && (
                <>
                  <div>
                    <span className="font-semibold text-text-muted">Customer Phone</span>
                    <p className="text-text font-bold mt-0.5">{ticket.customer?.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold text-text-muted">Email Address</span>
                    <p className="text-text font-bold mt-0.5">{ticket.customer?.email || 'N/A'}</p>
                  </div>
                </>
              )}
              <div className="border-t border-border pt-4 col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-text-muted">Vehicle Registration</span>
                  <p className="text-text font-bold mt-0.5">{ticket.vehicle?.registration_number}</p>
                </div>
                <div>
                  <span className="font-semibold text-text-muted">Make & Model</span>
                  <p className="text-text font-bold mt-0.5">{ticket.vehicle?.make} {ticket.vehicle?.model}</p>
                </div>
                <div>
                  <span className="font-semibold text-text-muted">Year</span>
                  <p className="text-text font-bold mt-0.5">{ticket.vehicle?.year || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-2">
            <h2 className="text-lg font-bold text-text border-b border-border pb-2">Description of Work</h2>
            <p className="text-text text-sm leading-relaxed whitespace-pre-line mt-2">
              {ticket.description}
            </p>
          </div>

          {/* Notes Section - Editable for Admin, Read-only snippet for Mechanic */}
          {isAdmin ? (
            <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4">
              <h2 className="text-lg font-bold text-text border-b border-border pb-2 flex items-center justify-between">
                Workshop Notes
                {notesMessage && (
                  <span className="text-xs text-success flex items-center gap-1">
                    <CheckCircle size={14} /> {notesMessage}
                  </span>
                )}
              </h2>
              <Textarea
                label="Admin Notes"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Log internal comments, mechanical diagnostic details..."
                disabled={isSavingNotes}
              />
              <Button
                variant="primary"
                onClick={handleNotesUpdate}
                loading={isSavingNotes}
                className="self-end"
              >
                <Save size={16} className="mr-2" />
                Save Notes
              </Button>
            </div>
          ) : ticket.notes ? (
            <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-2">
              <h2 className="text-lg font-bold text-text border-b border-border pb-2">Special Instructions / Notes</h2>
              <p className="text-text-muted text-sm leading-relaxed whitespace-pre-line mt-2 italic bg-slate-50 p-4 rounded border border-border">
                {ticket.notes}
              </p>
            </div>
          ) : null}

          {/* Parts Used Section - (Sprint 5 implementation, showing empty list or logged parts list) */}
          <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4">
            <h2 className="text-lg font-bold text-text border-b border-border pb-2">Parts Used on Ticket</h2>
            {ticket.parts_used && ticket.parts_used.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-slate-50 text-text-muted font-semibold">
                      <th className="px-4 py-2">Part Name</th>
                      <th className="px-4 py-2">Qty</th>
                      <th className="px-4 py-2">Unit Cost</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ticket.parts_used.map((part) => (
                      <tr key={part.id}>
                        <td className="px-4 py-2 font-medium">{part.part_name}</td>
                        <td className="px-4 py-2">{part.qty_used}</td>
                        <td className="px-4 py-2">R {part.unit_cost_at_time.toFixed(2)}</td>
                        <td className="px-4 py-2">R {(part.qty_used * part.unit_cost_at_time).toFixed(2)}</td>
                        <td className="px-4 py-2 text-text-muted">{part.logged_by_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">No parts have been logged against this service ticket yet. (Sprint 5)</p>
            )}
          </div>
        </div>

        {/* Right Column - Status Control and Assignments */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4">
            <h2 className="text-lg font-bold text-text border-b border-border pb-2 flex items-center justify-between">
              Job Status Control
              {statusMessage && (
                <span className="text-xs text-success flex items-center gap-1 font-normal">
                  <CheckCircle size={14} /> {statusMessage}
                </span>
              )}
            </h2>

            <Select
              label="Select Current Stage"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
              disabled={isUpdatingStatus}
            />

            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              loading={isUpdatingStatus}
              className="w-full"
            >
              Update Status
            </Button>
          </div>

          <div className="bg-surface p-6 rounded-lg shadow-sm border border-border flex flex-col gap-4 text-sm">
            <h2 className="text-lg font-bold text-text border-b border-border pb-2">Assignments</h2>
            <div>
              <span className="font-semibold text-text-muted">Assigned Mechanic</span>
              <p className="text-text font-bold mt-0.5">{ticket.mechanic?.name || 'Unassigned'}</p>
            </div>
            <div>
              <span className="font-semibold text-text-muted">Labour Billing (ZAR)</span>
              <p className="text-text font-bold mt-0.5">R {ticket.labour_cost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
