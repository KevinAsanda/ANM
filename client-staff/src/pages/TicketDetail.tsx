import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { ticketsService } from '../services/ticketsService.js';
import type { TicketRelation } from '../services/ticketsService.js';
import { inventoryService } from '../services/inventoryService.js';
import { staffService } from '../services/staffService.js';
import { Badge } from '../components/ui/Badge.js';
import type { BadgeVariant } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Select } from '../components/ui/Select.js';
import { Textarea } from '../components/ui/Textarea.js';
import { Spinner } from '../components/ui/Spinner.js';
import { ArrowLeft, AlertCircle, Save, CheckCircle, Smartphone, Mail } from 'lucide-react';
import { MobileScannerModal } from '../components/inventory/MobileScannerModal.js';
import { AIDiagnosticsAssistant } from '../components/tickets/AIDiagnosticsAssistant.js';

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

  // Booking approval states
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [labourCostInput, setLabourCostInput] = useState<string>('0.00');
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // Parts logging states
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [qtyToLog, setQtyToLog] = useState<number>(1);
  const [isLoggingPart, setIsLoggingPart] = useState<boolean>(false);
  const [logPartError, setLogPartError] = useState<string | null>(null);
  const [logPartSuccess, setLogPartSuccess] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // Email sending states
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleBarcodeScanned = (barcode: string) => {
    // Search inventoryItems for the barcode matching part_number
    const matchedPart = inventoryItems.find(item => 
      item.part_number && item.part_number.trim() === barcode.trim()
    );

    if (matchedPart) {
      setSelectedPartId(matchedPart.id);
      setLogPartError(null);
      setLogPartSuccess(`Barcode matched: ${matchedPart.part_name}`);
      setIsScannerOpen(false);
    } else {
      setLogPartError(`No part found in inventory with barcode/number: ${barcode}`);
    }
  };

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
      
      if (data.status === 'draft' && data.ai_diagnostics?.estimated_duration_hours) {
        const calculatedCost = data.ai_diagnostics.estimated_duration_hours * 350;
        setLabourCostInput(calculatedCost.toFixed(2));
      }
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

  const fetchInventory = async () => {
    try {
      const items = await inventoryService.getInventory();
      setInventoryItems(items);
    } catch (err) {
      console.error('Failed to load inventory for parts logging:', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const staff = await staffService.getStaff();
      setStaffList(staff.filter((s: any) => s.role === 'mechanic'));
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchInventory();
    if (isAdmin) {
      fetchStaff();
    }
  }, [id, isAdmin]);

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

  const handleSendEmail = async () => {
    if (!id || !ticket?.customer?.email) return;

    setIsSendingEmail(true);
    setEmailSuccess(null);
    setEmailError(null);

    try {
      const response = await ticketsService.sendTrackingEmail(id);
      setEmailSuccess(`Tracking link email simulated successfully to ${response.recipient}!`);
      setTimeout(() => setEmailSuccess(null), 5000);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to send tracking link email.');
      setTimeout(() => setEmailError(null), 5000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleApproveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!selectedStaffId) {
      setApprovalError('Please select a mechanic to assign.');
      return;
    }

    const cost = parseFloat(labourCostInput);
    if (isNaN(cost) || cost < 0) {
      setApprovalError('Labour cost must be 0 or greater.');
      return;
    }

    setIsApproving(true);
    setApprovalError(null);
    try {
      await ticketsService.approveBooking(id, {
        staffId: selectedStaffId,
        labourCost: cost
      });
      // Success: reload the ticket
      await fetchTicket();
    } catch (err: any) {
      setApprovalError(err.message || 'Failed to approve booking request.');
    } finally {
      setIsApproving(false);
    }
  };

  const selectedPart = inventoryItems.find(item => item.id === selectedPartId);

  const handleLogPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedPartId || qtyToLog < 1) return;

    if (selectedPart && selectedPart.qty_in_stock < qtyToLog) {
      setLogPartError(`Insufficient stock. Only ${selectedPart.qty_in_stock} units available.`);
      return;
    }

    setIsLoggingPart(true);
    setLogPartError(null);
    setLogPartSuccess(null);

    try {
      await ticketsService.logPart(id, {
        inventory_id: selectedPartId,
        qty_used: qtyToLog
      });

      setLogPartSuccess('Part logged successfully!');
      setSelectedPartId('');
      setQtyToLog(1);

      // Re-fetch details and inventory
      await Promise.all([fetchTicket(), fetchInventory()]);

      setTimeout(() => setLogPartSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error logging part:', err);
      setLogPartError(err.message || 'Failed to log part.');
    } finally {
      setIsLoggingPart(false);
    }
  };

  const isAssignedMechanic = user?.role === 'mechanic' && ticket?.staff_id === user.id;
  const canLogParts = ticket && (isAdmin || isAssignedMechanic) && ticket.status !== 'completed' && ticket.status !== 'cancelled' && ticket.status !== 'draft';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl mx-auto mt-8 animate-fade-in">
        <div className="p-6 bg-error-bg border border-error text-error rounded-xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <h3 className="font-display font-medium text-xl">Error Loading Ticket</h3>
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
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(isAdmin ? '/tickets' : '/my-jobs')}
            className="p-2 border border-border rounded-xl text-text-muted hover:bg-background hover:text-text transition-colors"
            aria-label="Back to tickets list"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display font-medium text-3xl text-text flex flex-wrap items-center gap-3">
              Job Card: {ticket.vehicle?.registration_number}
              <Badge variant={ticket.status === 'in_progress' ? 'in_progress' : ticket.status as BadgeVariant}>
                {ticket.status.replace('_', ' ')}
              </Badge>
            </h1>
            <p className="text-xs text-text-muted mt-1 font-light">
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
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col gap-4">
            <h2 className="font-display font-medium text-xl text-text border-b border-border pb-2">Customer & Vehicle Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider block mb-1">Customer Name</span>
                <p className="text-text font-medium">{ticket.customer?.name}</p>
              </div>
              {isAdmin && (
                <>
                  <div>
                    <span className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider block mb-1">Customer Phone</span>
                    <p className="text-text font-medium">{ticket.customer?.phone}</p>
                  </div>
                  <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <div>
                      <span className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider block mb-1">Email Address</span>
                      <p className="text-text font-medium">{ticket.customer?.email || 'N/A'}</p>
                      {emailSuccess && (
                        <p className="text-xs text-success font-medium mt-1 animate-fade-in">{emailSuccess}</p>
                      )}
                      {emailError && (
                        <p className="text-xs text-error font-medium mt-1 animate-fade-in">{emailError}</p>
                      )}
                    </div>
                    {ticket.customer?.email && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleSendEmail}
                        loading={isSendingEmail}
                        className="text-xs shrink-0 flex items-center gap-1.5 border border-primary/20 hover:bg-primary/10"
                      >
                        <Mail size={14} className="text-primary" />
                        Send Tracking Link
                      </Button>
                    )}
                  </div>
                </>
              )}
              <div className="border-t border-border pt-4 sm:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider block mb-1">Vehicle Registration</span>
                  <p className="text-text font-medium">{ticket.vehicle?.registration_number}</p>
                </div>
                <div>
                  <span className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider block mb-1">Make & Model</span>
                  <p className="text-text font-medium">{ticket.vehicle?.make} {ticket.vehicle?.model}</p>
                </div>
                <div>
                  <span className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider block mb-1">Year</span>
                  <p className="text-text font-medium">{ticket.vehicle?.year || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col gap-2">
            <h2 className="font-display font-medium text-xl text-text border-b border-border pb-2">Description of Work</h2>
            <p className="text-text text-sm leading-relaxed whitespace-pre-line mt-2">
              {ticket.description}
            </p>
          </div>

          {/* AI Diagnostics Assistant */}
          {ticket && (
            <AIDiagnosticsAssistant
              ticketId={ticket.id}
              ticketDescription={ticket.description}
              initialDiagnostics={(ticket as any).ai_diagnostics}
              onSelectPart={(partId, qty) => {
                setSelectedPartId(partId);
                setQtyToLog(qty);
              }}
              canModify={canLogParts}
            />
          )}

          {/* Notes Section - Editable for Admin, Read-only snippet for Mechanic */}
          {isAdmin ? (
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col gap-4">
              <h2 className="font-display font-medium text-xl text-text border-b border-border pb-2 flex items-center justify-between">
                Workshop Notes
                {notesMessage && (
                  <span className="text-xs text-success flex items-center gap-1 font-normal animate-fade-in">
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
                className="self-end tracking-wider text-[0.8rem] font-semibold uppercase"
              >
                <Save size={14} className="mr-2" />
                Save Notes
              </Button>
            </div>
          ) : ticket.notes ? (
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col gap-2">
              <h2 className="font-display font-medium text-xl text-text border-b border-border pb-2">Special Instructions / Notes</h2>
              <p className="text-text-muted text-sm leading-relaxed whitespace-pre-line mt-2 italic bg-background/40 p-4 rounded-xl border border-border">
                {ticket.notes}
              </p>
            </div>
          ) : null}

          {/* Parts Used Section */}
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col gap-4">
            <h2 className="font-display font-medium text-xl text-text border-b border-border pb-2">Parts Used on Ticket</h2>
            {ticket.parts_used && ticket.parts_used.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background/50 text-text-muted">
                      <th className="px-4 py-3 text-[0.7rem] font-semibold tracking-wider uppercase">Part Name</th>
                      <th className="px-4 py-3 text-[0.7rem] font-semibold tracking-wider uppercase">Qty</th>
                      <th className="px-4 py-3 text-[0.7rem] font-semibold tracking-wider uppercase">Unit Cost</th>
                      <th className="px-4 py-3 text-[0.7rem] font-semibold tracking-wider uppercase">Total</th>
                      <th className="px-4 py-3 text-[0.7rem] font-semibold tracking-wider uppercase">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ticket.parts_used.map((part) => (
                      <tr key={part.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-text">{part.part_name}</td>
                        <td className="px-4 py-3 text-text-muted">{part.qty_used}</td>
                        <td className="px-4 py-3 text-text-muted">R {part.unit_cost_at_time.toFixed(2)}</td>
                        <td className="px-4 py-3 text-text font-medium">R {(part.qty_used * part.unit_cost_at_time).toFixed(2)}</td>
                        <td className="px-4 py-3 text-[0.75rem] text-text-muted font-light">{part.logged_by_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">No parts have been logged against this service ticket yet.</p>
            )}

            {canLogParts && (
              <div className="border-t border-border pt-4 mt-2">
                <h3 className="font-display font-medium text-lg text-text mb-3">Log a Part</h3>
                <form onSubmit={handleLogPart} className="flex flex-col md:flex-row items-end gap-4">
                  <div className="flex-1 min-w-[200px] w-full">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Select
                          label="Select Part"
                          value={selectedPartId}
                          onChange={(e) => {
                            setSelectedPartId(e.target.value);
                            setLogPartError(null);
                          }}
                          options={[
                            { value: '', label: 'Select a part...' },
                            ...inventoryItems.map(item => ({
                              value: item.id,
                              label: `${item.part_name} (${item.part_number || 'N/A'}) - R ${item.unit_cost?.toFixed(2) || '0.00'}`
                            }))
                          ]}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsScannerOpen(true)}
                        className="p-2 border-dashed h-[42px] shrink-0"
                        title="Scan part using phone"
                      >
                        <Smartphone size={18} />
                      </Button>
                    </div>
                    {selectedPart && (
                      <p className={`text-xs mt-1 font-semibold ${selectedPart.qty_in_stock <= selectedPart.reorder_level ? 'text-warning' : 'text-text-muted'}`}>
                        Live Stock Remaining: {selectedPart.qty_in_stock} unit{selectedPart.qty_in_stock !== 1 ? 's' : ''} 
                        {selectedPart.qty_in_stock <= selectedPart.reorder_level && ' (Low Stock Alert)'}
                      </p>
                    )}
                  </div>
                  
                  <div className="w-full md:w-24">
                    <label htmlFor="qty_used" className="block text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                      Qty
                    </label>
                    <input
                      id="qty_used"
                      type="number"
                      min={1}
                      max={selectedPart ? selectedPart.qty_in_stock : undefined}
                      value={qtyToLog}
                      onChange={(e) => setQtyToLog(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface transition-all"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!selectedPartId || (selectedPart && selectedPart.qty_in_stock < qtyToLog)}
                    loading={isLoggingPart}
                    className="w-full md:w-auto tracking-wider text-[0.8rem] font-semibold uppercase h-[42px]"
                  >
                    Log Part
                  </Button>
                </form>

                {logPartError && (
                  <p className="text-xs text-error mt-2 flex items-center gap-1 animate-fade-in">
                    <AlertCircle size={14} /> {logPartError}
                  </p>
                )}

                {logPartSuccess && (
                  <p className="text-xs text-success mt-2 flex items-center gap-1 font-medium animate-fade-in">
                    <CheckCircle size={14} /> {logPartSuccess}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Status Control and Assignments */}
        <div className="flex flex-col gap-6">
          {ticket.status === 'draft' ? (
            isAdmin ? (
              <form onSubmit={handleApproveBooking} className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col gap-4">
                <h2 className="font-display font-medium text-xl text-text border-b border-border pb-2">
                  Review & Approve Request
                </h2>

                {ticket.ai_diagnostics && (ticket.ai_diagnostics.suggested_category || ticket.ai_diagnostics.estimated_duration_hours) && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs flex flex-col gap-1.5 animate-fade-in">
                    <span className="font-semibold text-primary block text-[10px] uppercase tracking-wider">AI Booking Insights</span>
                    {ticket.ai_diagnostics.suggested_category && (
                      <p className="text-text">
                        <span className="font-semibold text-text-muted">Suggested Category:</span> {ticket.ai_diagnostics.suggested_category}
                      </p>
                    )}
                    {ticket.ai_diagnostics.estimated_duration_hours && (
                      <p className="text-text">
                        <span className="font-semibold text-text-muted">Estimated Duration:</span> {ticket.ai_diagnostics.estimated_duration_hours} Hours
                      </p>
                    )}
                    {ticket.ai_diagnostics.reasoning && (
                      <p className="text-[10px] text-text-muted italic bg-white/40 dark:bg-slate-900/20 p-2 rounded border border-blue-50/30 mt-1">
                        "{ticket.ai_diagnostics.reasoning}"
                      </p>
                    )}
                  </div>
                )}
                
                <Select
                  label="Assign Mechanic*"
                  value={selectedStaffId}
                  onChange={(e) => {
                    setSelectedStaffId(e.target.value);
                    setApprovalError(null);
                  }}
                  options={[
                    { value: '', label: 'Select mechanic...' },
                    ...staffList.map(s => ({ value: s.id, label: s.name }))
                  ]}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="labour_cost" className="block text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider">
                    Labour Fee Estimate (ZAR)*
                  </label>
                  <input
                    id="labour_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={labourCostInput}
                    onChange={(e) => {
                      setLabourCostInput(e.target.value);
                      setApprovalError(null);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface transition-all"
                    required
                  />
                </div>

                {approvalError && (
                  <p className="text-xs text-error flex items-center gap-1 mt-1 animate-fade-in">
                    <AlertCircle size={14} /> {approvalError}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  loading={isApproving}
                  className="w-full tracking-wider text-[0.8rem] font-semibold uppercase mt-2"
                >
                  Approve & Create Ticket
                </Button>
              </form>
            ) : (
              <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col gap-4">
                <h2 className="font-display font-medium text-xl text-text border-b border-border pb-2">
                  Booking Status
                </h2>
                <p className="text-sm text-text-muted italic leading-relaxed">
                  This booking request is pending admin review and mechanic assignment.
                </p>
              </div>
            )
          ) : (
            <>
              <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col gap-4">
                <h2 className="font-display font-medium text-xl text-text border-b border-border pb-2 flex items-center justify-between">
                  Job Status Control
                  {statusMessage && (
                    <span className="text-xs text-success flex items-center gap-1 font-normal animate-fade-in">
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
                  className="w-full tracking-wider text-[0.8rem] font-semibold uppercase"
                >
                  Update Status
                </Button>
              </div>

              <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col gap-4 text-sm">
                <h2 className="font-display font-medium text-xl text-text border-b border-border pb-2">Assignments</h2>
                <div>
                  <span className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider block mb-1">Assigned Mechanic</span>
                  <p className="text-text font-medium">{ticket.mechanic?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider block mb-1">Labour Billing</span>
                  <p className="text-text font-semibold text-lg text-primary">R {ticket.labour_cost.toFixed(2)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Remote Phone Scanner Modal */}
      <MobileScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        title="Scan Part to Ticket Log"
      />
    </div>
  );
};

export default TicketDetail;
