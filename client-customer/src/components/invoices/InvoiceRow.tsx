import React from 'react';
import { Link } from 'react-router-dom';
import { Invoice } from '../../services/invoiceService.js';
import { InvoiceStatusBadge } from './InvoiceStatusBadge.js';

interface InvoiceRowProps {
  invoice: Invoice;
}

export const InvoiceRow: React.FC<InvoiceRowProps> = ({ invoice }) => {
  const formattedDate = new Date(invoice.created_at).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const ticket = invoice.ticket || {};
  const vehicle = ticket.vehicle || {};
  const customer = vehicle.customer || {};

  return (
    <tr className="hover:bg-primary-light/30 transition-colors duration-150 border-b border-border text-sm">
      <td className="px-6 py-4 font-semibold text-text">
        <Link to={`/invoices/${invoice.id}`} className="text-primary hover:underline font-mono">
          {invoice.invoice_no}
        </Link>
      </td>
      <td className="px-6 py-4 font-medium text-text">
        <Link to={`/tickets/${invoice.ticket_id}`} className="text-primary hover:underline font-mono">
          {vehicle.registration_number || 'N/A'}
        </Link>
      </td>
      <td className="px-6 py-4 text-text-muted">
        {customer.name || 'Unknown'}
      </td>
      <td className="px-6 py-4 font-semibold text-text">
        ZAR {Number(invoice.total_amount).toFixed(2)}
      </td>
      <td className="px-6 py-4">
        <InvoiceStatusBadge status={invoice.status} />
      </td>
      <td className="px-6 py-4 text-text-muted">
        {formattedDate}
      </td>
      <td className="px-6 py-4 text-right">
        <Link
          to={`/invoices/${invoice.id}`}
          className="text-primary hover:text-primary-hover font-semibold transition-colors duration-150"
        >
          View Invoice
        </Link>
      </td>
    </tr>
  );
};

export default InvoiceRow;
