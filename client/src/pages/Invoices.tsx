import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService.js';
import type { Invoice } from '../services/invoiceService.js';
import { Table } from '../components/ui/Table.js';
import type { TableColumn } from '../components/ui/Table.js';
import { InvoiceStatusBadge } from '../components/invoices/InvoiceStatusBadge.js';
import { Button } from '../components/ui/Button.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { Spinner } from '../components/ui/Spinner.js';
import { AlertCircle, Receipt } from 'lucide-react';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchInvoices = async (statusFilter?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await invoiceService.getInvoices(statusFilter === 'all' ? undefined : statusFilter);
      setInvoices(data);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.message || 'Failed to load invoices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unpaid', label: 'Unpaid (Pending)' },
    { id: 'paid', label: 'Paid (Settled)' },
    { id: 'void', label: 'Voided' }
  ];

  const columns: TableColumn<Invoice>[] = [
    {
      key: 'invoice_no',
      header: 'Invoice No',
      render: (row) => <span className="font-mono font-semibold text-primary hover:underline">{row.invoice_no}</span>
    },
    {
      key: 'registration_number',
      header: 'Vehicle Reg',
      render: (row) => row.ticket?.vehicle?.registration_number || 'N/A'
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => row.ticket?.vehicle?.customer?.name || 'N/A'
    },
    {
      key: 'total_amount',
      header: 'Invoice Total',
      render: (row) => <span>ZAR {Number(row.total_amount).toFixed(2)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <InvoiceStatusBadge status={row.status} />
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
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display font-medium text-4xl text-text">Invoices & Billing</h1>
          <p className="text-text-muted text-sm mt-1 font-light">Track customer payments, billing sheets, and accounting status</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
            <h3 className="font-display font-medium text-xl">Error Loading Invoices</h3>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => fetchInvoices(activeTab)}>
            Try Again
          </Button>
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description={
            activeTab === 'all'
              ? 'Complete a service ticket or manually log parts to trigger invoice generation.'
              : `There are currently no invoices matching the "${activeTab}" filter.`
          }
          icon={<Receipt size={40} />}
        />
      ) : (
        <Table
          columns={columns}
          data={invoices}
          onRowClick={(row) => navigate(`/invoices/${row.id}`)}
        />
      )}
    </div>
  );
};

export default Invoices;
