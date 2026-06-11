import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsService } from '../services/ticketsService.js';
import type { TicketRelation } from '../services/ticketsService.js';
import { InvoiceDetailCard } from '../components/invoices/InvoiceDetailCard.js';
import { Button } from '../components/ui/Button.js';
import { Spinner } from '../components/ui/Spinner.js';
import { AlertCircle, ArrowLeft, Printer, Wrench, Shield, Clipboard, CheckCircle, HelpCircle, Calendar } from 'lucide-react';

export const PublicTracker: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketRelation | null>(null);
  const [invoice, setInvoice] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsService.getTrackingDetails(token);
      setTicket(data.ticket);
      setInvoice(data.invoice);
    } catch (err: any) {
      console.error('Error fetching tracking details:', err);
      setError(err.message || 'Tracking token not found. Please double-check your link.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-xs text-text-muted">Loading live vehicle tracking details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 flex justify-center items-center font-sans">
        <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-8 shadow-sm text-center flex flex-col items-center gap-4 animate-scale-in">
          <AlertCircle size={48} className="text-error" />
          <div>
            <h2 className="font-display font-medium text-2xl text-text">Tracking Record Not Found</h2>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              {error || 'We could not find a service ticket associated with this tracking token. Please double check the link sent to your phone.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full mt-4">
            <Button variant="primary" onClick={() => navigate('/')} size="md" className="font-semibold">
              Go to Home Page
            </Button>
            <Button variant="secondary" onClick={fetchTracking} size="md" className="font-semibold">
              Try Reloading
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Stepper helper
  const getStepStatus = (step: 'draft' | 'pending' | 'in_progress' | 'completed') => {
    const statusOrder = ['draft', 'pending', 'in_progress', 'completed'];
    const ticketIndex = statusOrder.indexOf(ticket.status === 'cancelled' ? 'completed' : ticket.status);
    const stepIndex = statusOrder.indexOf(step);

    if (ticket.status === 'cancelled') {
      return { active: false, done: false, cancelled: true };
    }

    if (ticketIndex === stepIndex) {
      return { active: true, done: false, cancelled: false };
    }
    if (ticketIndex > stepIndex) {
      return { active: false, done: true, cancelled: false };
    }
    return { active: false, done: false, cancelled: false };
  };

  // Convert raw parts list and ticket info into a mock invoice structure for the InvoiceDetailCard component
  const getMappedInvoiceForCard = () => {
    if (!invoice) return null;
    return {
      ...invoice,
      ticket: {
        ...ticket,
        ticket_parts: (ticket.parts_used || []).map((p: any) => ({
          id: p.id,
          qty_used: p.qty_used,
          unit_cost_at_time: p.unit_cost_at_time,
          inventory: {
            part_name: p.part_name,
            part_number: null
          }
        }))
      }
    };
  };

  const mappedInvoice = getMappedInvoiceForCard();

  return (
    <div className="min-h-screen bg-background py-8 px-4 font-sans text-text select-text print:bg-white print:p-0">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
        {/* Navigation Block */}
        <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-6 py-4 shadow-sm print:hidden">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
              Live Status:
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${
              ticket.status === 'completed' 
                ? 'bg-success/10 border-success/30 text-success' 
                : ticket.status === 'cancelled'
                ? 'bg-error/10 border-error/30 text-error'
                : ticket.status === 'in_progress'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-amber/10 border-amber/30 text-amber-700'
            }`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Cancelled Banner */}
        {ticket.status === 'cancelled' && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-xs text-error font-medium flex gap-2 print:hidden">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Booking / Service Cancelled</p>
              <p className="mt-0.5 text-error/80 leading-relaxed">This ticket was cancelled by management. Please contact ANM Workshop support for further enquiries.</p>
            </div>
          </div>
        )}

        {/* Stepper Card */}
        {ticket.status !== 'cancelled' && (
          <div className="bg-surface border border-border rounded-xl p-8 shadow-sm print:hidden">
            <h2 className="font-display font-medium text-lg text-primary mb-6">Repair Progress Timeline</h2>
            
            <div className="flex flex-col md:row items-start md:items-center justify-between gap-6 md:gap-4 relative">
              {/* Stepper Steps */}
              {[
                { key: 'draft', label: 'Requested', desc: 'Booking Draft Created', icon: <Clipboard size={18} /> },
                { key: 'pending', label: 'Scheduled', desc: 'Mechanic Assigned', icon: <Calendar size={18} /> },
                { key: 'in_progress', label: 'Repairing', desc: 'Work In Progress', icon: <Wrench size={18} /> },
                { key: 'completed', label: 'Completed', desc: 'Ready for Collection', icon: <CheckCircle size={18} /> }
              ].map((step, index) => {
                const status = getStepStatus(step.key as any);
                return (
                  <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1 w-full relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      status.done 
                        ? 'bg-primary border-primary text-white' 
                        : status.active 
                        ? 'bg-primary/10 border-primary text-primary font-bold ring-2 ring-primary/20' 
                        : 'bg-background border-border text-text-muted'
                    }`}>
                      {status.done ? <CheckCircle size={18} /> : step.icon}
                    </div>
                    <div className="text-left md:text-center">
                      <p className={`text-xs font-semibold ${status.active ? 'text-primary' : 'text-text'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5 font-light">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vehicle & Customer Specs */}
        <div className="grid md:grid-cols-2 gap-6 print:hidden">
          {/* Vehicle card */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-display font-medium text-md text-primary border-b border-border pb-2">Vehicle Specifications</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">Registration Number</span>
                <span className="font-semibold text-text mt-0.5 block">{ticket.vehicle?.registration_number}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">Year</span>
                <span className="text-text mt-0.5 block">{ticket.vehicle?.year || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">Manufacturer Make</span>
                <span className="text-text mt-0.5 block">{ticket.vehicle?.make}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">Model Variant</span>
                <span className="text-text mt-0.5 block">{ticket.vehicle?.model}</span>
              </div>
            </div>
          </div>

          {/* Details card */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-display font-medium text-md text-primary border-b border-border pb-2">Service Details</h3>
            <div className="text-xs flex flex-col gap-3">
              <div>
                <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">Reported Issues</span>
                <p className="text-text mt-1 leading-relaxed bg-background p-2 rounded-lg border border-border/60">
                  {ticket.description}
                </p>
              </div>
              {ticket.notes && (
                <div>
                  <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">Workshop Update Notes</span>
                  <p className="text-text mt-1 leading-relaxed bg-primary/5 p-2 rounded-lg border border-primary/20 italic">
                    {ticket.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logged Parts list */}
        {ticket.status !== 'draft' && ticket.status !== 'cancelled' && (ticket.parts_used?.length || 0) > 0 && (
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm print:hidden">
            <h3 className="font-display font-medium text-md text-primary border-b border-border pb-2 mb-4">
              Logged Parts Used
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase font-semibold text-text-muted tracking-wider bg-background/50">
                    <th className="px-4 py-2.5">Part Name</th>
                    <th className="px-4 py-2.5 text-center">Quantity</th>
                    <th className="px-4 py-2.5 text-right">Unit Price</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ticket.parts_used?.map((part: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 font-medium text-text">{part.part_name}</td>
                      <td className="px-4 py-3 text-center text-text-muted">{part.qty_used}</td>
                      <td className="px-4 py-3 text-right text-text-muted">ZAR {Number(part.unit_cost_at_time).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-text font-semibold">ZAR {(part.qty_used * part.unit_cost_at_time).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoice detail section (Only when completed) */}
        {ticket.status === 'completed' && mappedInvoice && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-surface border border-border rounded-xl px-6 py-4 shadow-sm print:hidden">
              <div>
                <h3 className="font-display font-medium text-lg text-primary">Final Service Invoice</h3>
                <p className="text-[10px] text-text-muted mt-0.5">Please check final invoice calculations and payment instructions below.</p>
              </div>
              <Button variant="secondary" onClick={handlePrint} className="gap-2 shrink-0">
                <Printer size={16} />
                Print Invoice
              </Button>
            </div>
            <InvoiceDetailCard invoice={mappedInvoice} showBankingDetails={true} />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-text-muted py-6 print:hidden">
          <p>© {new Date().getFullYear()} ANM Workshop Pinetown. All rights reserved.</p>
          <p className="mt-1 font-light">Need help? Contact support desk at +27 31 701 1234.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicTracker;
