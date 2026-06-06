import React from 'react';

export type BadgeVariant =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'low_stock'
  | 'admin'
  | 'mechanic';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const styles = {
    pending: 'bg-status-pending-bg text-status-pending-text border border-amber-200',
    in_progress: 'bg-status-inprogress-bg text-status-inprogress-text border border-blue-200',
    completed: 'bg-status-completed-bg text-status-completed-text border border-green-200',
    cancelled: 'bg-status-cancelled-bg text-status-cancelled-text border border-slate-200',
    low_stock: 'bg-warning-bg text-warning border border-amber-200',
    admin: 'bg-blue-100 text-blue-800 border border-blue-200',
    mechanic: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};
