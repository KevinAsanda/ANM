import React, { useState } from 'react';
import { invoiceService } from '../../services/invoiceService.js';
import { Button } from '../ui/Button.js';
import { Select } from '../ui/Select.js';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentToggleFormProps {
  invoiceId: string;
  currentStatus: 'unpaid' | 'paid' | 'void';
  currentPaymentMethod: 'cash' | 'card' | 'eft' | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentToggleForm: React.FC<PaymentToggleFormProps> = ({
  invoiceId,
  currentStatus,
  currentPaymentMethod,
  onSuccess,
  onCancel
}) => {
  const [status, setStatus] = useState<'unpaid' | 'paid' | 'void'>(currentStatus);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'eft' | ''>(
    currentPaymentMethod || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'paid' && !paymentMethod) {
      setError('Please select a payment method for settled invoices.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await invoiceService.updateInvoiceStatus(
        invoiceId,
        status,
        status === 'paid' ? paymentMethod : null
      );

      setSuccessMsg('Invoice payment updated successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating invoice status:', err);
      setError(err.message || 'Failed to update invoice payment status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans text-text">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={16} className="text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <Select
        label="Payment Status"
        value={status}
        onChange={(e) => {
          const val = e.target.value as 'unpaid' | 'paid' | 'void';
          setStatus(val);
          if (val !== 'paid') setPaymentMethod('');
        }}
        disabled={isSubmitting}
        required
        options={[
          { value: 'unpaid', label: 'Unpaid (Pending)' },
          { value: 'paid', label: 'Paid (Settled)' },
          { value: 'void', label: 'Voided (Cancelled)' }
        ]}
      />

      {status === 'paid' && (
        <Select
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'eft')}
          disabled={isSubmitting}
          required
          options={[
            { value: '', label: '-- Select Method --' },
            { value: 'cash', label: 'Cash Payment' },
            { value: 'card', label: 'Card Payment' },
            { value: 'eft', label: 'Electronic Funds Transfer (EFT)' }
          ]}
        />
      )}

      <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default PaymentToggleForm;
