import React from 'react';
import { Badge } from '../ui/Badge.js';
import type { BadgeVariant } from '../ui/Badge.js';

interface InvoiceStatusBadgeProps {
  status: 'unpaid' | 'paid' | 'void';
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const map: Record<'unpaid' | 'paid' | 'void', { variant: BadgeVariant; label: string }> = {
    unpaid: { variant: 'pending', label: 'Unpaid' },
    paid: { variant: 'completed', label: 'Paid' },
    void: { variant: 'cancelled', label: 'Voided' }
  };

  const config = map[status] || { variant: 'cancelled', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default InvoiceStatusBadge;
