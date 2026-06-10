import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService.js';
import type { Invoice } from '../services/invoiceService.js';
import { InvoiceDetailCard } from '../components/invoices/InvoiceDetailCard.js';
import { Button } from '../components/ui/Button.js';
import { Spinner } from '../components/ui/Spinner.js';
import { Printer, AlertCircle } from 'lucide-react';

export const PublicInvoice: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await invoiceService.getPublicInvoice(token);
      setInvoice(data);
    } catch (err: any) {
      console.error('Error fetching public invoice:', err);
      setError(err.message || 'Invoice not found. Please double-check your link.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 font-sans text-text select-text print:bg-white print:p-0">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
        {/* Floating Print Action Block - Hidden on Print */}
        <div className="flex justify-between items-center bg-surface border border-border rounded-xl px-6 py-4 shadow-sm print:hidden">
          <div>
            <h1 className="font-display font-medium text-xl text-text leading-tight">ANM Workshop Invoice</h1>
            <p className="text-xs text-text-muted mt-0.5">Thank you for your business. View and settle your invoice details below.</p>
          </div>
          <Button variant="secondary" onClick={handlePrint} className="gap-2">
            <Printer size={16} />
            Print / Save PDF
          </Button>
        </div>

        {/* Content Sheet */}
        {isLoading ? (
          <div className="flex items-center justify-center p-24 bg-surface border border-border rounded-xl shadow-sm">
            <Spinner size="lg" />
          </div>
        ) : error || !invoice ? (
          <div className="p-8 bg-surface border border-border rounded-xl shadow-sm text-center flex flex-col items-center gap-4">
            <AlertCircle size={48} className="text-error" />
            <div>
              <h2 className="font-display font-medium text-2xl text-text">Invoice Not Found</h2>
              <p className="text-sm text-text-muted mt-1 max-w-md mx-auto">
                {error || 'The requested invoice link is invalid, expired, or has been revoked.'}
              </p>
            </div>
            <Button variant="primary" onClick={fetchInvoice} size="sm" className="mt-2">
              Reload Page
            </Button>
          </div>
        ) : (
          <InvoiceDetailCard invoice={invoice} showBankingDetails={true} />
        )}

        {/* Footer info - Hidden on Print */}
        <div className="text-center text-xs text-text-muted py-4 print:hidden">
          <p>© {new Date().getFullYear()} ANM Workshop Pinetown. All rights reserved.</p>
          <p className="mt-1 font-light">Need help? Contact service support at +27 31 701 2345.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicInvoice;
