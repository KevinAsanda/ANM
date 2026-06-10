import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService.js';
import type { Invoice } from '../services/invoiceService.js';
import { InvoiceDetailCard } from '../components/invoices/InvoiceDetailCard.js';
import { PaymentToggleForm } from '../components/invoices/PaymentToggleForm.js';
import { Modal } from '../components/ui/Modal.js';
import { Button } from '../components/ui/Button.js';
import { Spinner } from '../components/ui/Spinner.js';
import { ArrowLeft, Printer, CreditCard, AlertCircle } from 'lucide-react';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchInvoice = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await invoiceService.getInvoice(id);
      setInvoice(data);
    } catch (err: any) {
      console.error('Error fetching invoice details:', err);
      setError(err.message || 'Failed to load invoice details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col gap-4 font-sans text-text">
        <Link to="/invoices" className="flex items-center gap-2 text-primary hover:underline font-semibold text-sm self-start">
          <ArrowLeft size={16} />
          Back to Invoices
        </Link>
        <div className="p-6 bg-error-bg border border-error text-error rounded-xl flex items-center gap-4 animate-fade-in mt-4">
          <AlertCircle size={24} />
          <div className="flex-1">
            <h3 className="font-display font-medium text-xl">Error Loading Invoice</h3>
            <p className="text-sm mt-0.5">{error || 'Invoice not found.'}</p>
          </div>
          <Button variant="danger" size="sm" onClick={fetchInvoice}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-text">
      {/* Detail Headers & Controls - Hidden on Print */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print:hidden">
        <div>
          <Link to="/invoices" className="flex items-center gap-2 text-primary hover:underline font-semibold text-sm self-start mb-2">
            <ArrowLeft size={16} />
            Back to Invoices
          </Link>
          <h1 className="font-display font-medium text-4xl text-text">Invoice Details</h1>
          <p className="text-text-muted text-sm mt-1 font-light">
            Review detailed service sheets, calculations, and record customer settlements
          </p>
        </div>

        <div className="flex gap-3 self-start md:self-auto">
          <Button variant="secondary" onClick={handlePrint} className="gap-2">
            <Printer size={16} />
            Print / PDF
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} className="gap-2">
            <CreditCard size={16} />
            Update Payment
          </Button>
        </div>
      </div>

      {/* Invoice Card Sheet */}
      <div className="max-w-4xl w-full mx-auto">
        <InvoiceDetailCard invoice={invoice} />
      </div>

      {/* Payment Toggler Modal - Hidden on Print */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Invoice Status"
      >
        <PaymentToggleForm
          invoiceId={invoice.id}
          currentStatus={invoice.status}
          currentPaymentMethod={invoice.payment_method}
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchInvoice();
          }}
        />
      </Modal>
    </div>
  );
};

export default InvoiceDetail;
