import React from 'react';
import type { Invoice } from '../../services/invoiceService.js';
import { InvoiceStatusBadge } from './InvoiceStatusBadge.js';

interface InvoiceDetailCardProps {
  invoice: Invoice;
  showBankingDetails?: boolean;
}

export const InvoiceDetailCard: React.FC<InvoiceDetailCardProps> = ({ 
  invoice, 
  showBankingDetails = true 
}) => {
  const formattedDate = new Date(invoice.created_at).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const ticket = invoice.ticket || {};
  const vehicle = ticket.vehicle || {};
  const customer = vehicle.customer || {};
  const partsUsed = ticket.ticket_parts || [];

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden animate-fade-in print:border-none print:shadow-none print:bg-white print:p-0">
      {/* Invoice Brand Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-8 py-8 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:bg-none print:px-0 print:py-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-display text-xl font-bold print:border print:border-primary print:text-primary print:bg-white">
              A
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-wide text-text">ANM Workshop</h2>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Automotive Service Management</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-text-muted leading-relaxed font-sans">
            <p>12 Marianheights Rd, Pinetown, 3610</p>
            <p>Phone: +27 31 701 2345 | Email: service@anm.co.za</p>
          </div>
        </div>

        <div className="text-left md:text-right">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text uppercase print:text-3xl">Invoice</h1>
          <div className="mt-2 space-y-1 text-sm">
            <p className="font-mono text-text font-semibold">
              <span className="text-text-muted font-sans font-normal">No:</span> {invoice.invoice_no}
            </p>
            <p className="text-text-muted">
              <span className="font-normal">Date:</span> {formattedDate}
            </p>
            <div className="mt-2 inline-block print:block">
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Bill To & Vehicle Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-8 border-b border-border print:px-0 print:py-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Bill To</h3>
          <div className="text-text space-y-1 font-sans">
            <p className="text-base font-semibold">{customer.name || 'N/A'}</p>
            <p className="text-sm">Phone: {customer.phone || 'N/A'}</p>
            {customer.email && <p className="text-sm">Email: {customer.email}</p>}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Vehicle Details</h3>
          <div className="text-text space-y-1 font-sans">
            <p className="text-base font-semibold">
              {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
            </p>
            <p className="text-sm font-mono font-semibold">
              <span className="text-text-muted font-sans font-normal">Registration:</span> {vehicle.registration_number || 'N/A'}
            </p>
            <p className="text-sm text-text-muted leading-relaxed italic mt-2">
              <span className="font-sans font-semibold not-italic text-text-muted block text-xs uppercase tracking-wider mb-1">Service Description</span>
              "{ticket.description || 'General automotive inspection and maintenance.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Parts & Labor Table */}
      <div className="px-8 py-8 print:px-0 print:py-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-text-muted">
                <th className="py-3 pr-4">Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price (ZAR)</th>
                <th className="py-3 pl-4 text-right">Total (ZAR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {/* Labor Item */}
              <tr>
                <td className="py-4 pr-4 font-medium text-text">
                  Labour / Service Charges
                  <p className="text-xs text-text-muted font-normal mt-0.5">Professional vehicle diagnostics & technician labor</p>
                </td>
                <td className="py-4 px-4 text-center text-text-muted">1</td>
                <td className="py-4 px-4 text-right text-text">
                  {Number(invoice.labour_cost).toFixed(2)}
                </td>
                <td className="py-4 pl-4 text-right font-medium text-text">
                  {Number(invoice.labour_cost).toFixed(2)}
                </td>
              </tr>

              {/* Parts Used */}
              {partsUsed.map((part: any, index: number) => {
                const partName = part.inventory?.part_name || 'Spare Part';
                const partNum = part.inventory?.part_number ? ` (${part.inventory.part_number})` : '';
                const qty = Number(part.qty_used);
                const unitCost = Number(part.unit_cost_at_time);
                const lineTotal = qty * unitCost;

                return (
                  <tr key={part.id || index}>
                    <td className="py-4 pr-4 font-medium text-text">
                      {partName}
                      {partNum && <span className="font-mono text-xs text-text-muted">{partNum}</span>}
                    </td>
                    <td className="py-4 px-4 text-center text-text-muted">{qty}</td>
                    <td className="py-4 px-4 text-right text-text">
                      {unitCost.toFixed(2)}
                    </td>
                    <td className="py-4 pl-4 text-right font-medium text-text">
                      {lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}

              {partsUsed.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 pr-4 text-xs italic text-text-muted">
                    No replacement parts logged on this service ticket.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals & Banking Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-8 bg-gradient-to-b from-transparent to-primary/5 border-t border-border print:bg-none print:px-0 print:py-6 print:gap-4">
        {/* EFT Banking Details */}
        <div>
          {showBankingDetails && (
            <div className="border border-border/80 bg-surface/50 rounded-lg p-4 font-sans text-xs text-text-muted leading-relaxed print:border-none print:p-0">
              <h4 className="font-bold text-text uppercase tracking-wider mb-2">EFT Payment Details</h4>
              <p><span className="font-medium">Bank:</span> First National Bank (FNB)</p>
              <p><span className="font-medium">Account Name:</span> ANM Operations</p>
              <p><span className="font-medium">Account Number:</span> 62908123456</p>
              <p><span className="font-medium">Branch Code:</span> 250655</p>
              <p className="mt-2 font-semibold text-text font-mono">
                <span className="font-sans font-normal text-text-muted">Payment Reference:</span> {invoice.invoice_no}
              </p>
              <p className="mt-2 italic text-[10px]">Please email your proof of payment to accounts@anm.co.za.</p>
            </div>
          )}
        </div>

        {/* Calculations Block */}
        <div className="flex flex-col items-end justify-start font-sans">
          <div className="w-full max-w-sm space-y-2.5 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Labour Subtotal</span>
              <span>ZAR {Number(invoice.labour_cost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Parts Subtotal</span>
              <span>ZAR {Number(invoice.parts_cost).toFixed(2)}</span>
            </div>
            <div className="border-t border-border my-1"></div>
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span>ZAR {(Number(invoice.labour_cost) + Number(invoice.parts_cost)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>VAT (15%)</span>
              <span>ZAR {Number(invoice.tax_amount).toFixed(2)}</span>
            </div>
            <div className="border-t border-border/80 my-1"></div>
            <div className="flex justify-between text-base font-bold text-text bg-primary-light/40 border border-primary/25 rounded px-3 py-2 print:border-none print:bg-none print:px-0 print:py-1">
              <span>Invoice Total</span>
              <span>ZAR {Number(invoice.total_amount).toFixed(2)}</span>
            </div>

            {invoice.payment_method && invoice.status === 'paid' && (
              <div className="text-right text-xs text-text-muted font-medium mt-1">
                Settled via <span className="uppercase font-bold text-success font-sans">{invoice.payment_method}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailCard;
