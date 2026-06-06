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
    pending: 'bg-status-pending-bg text-status-pending-text border border-status-pending-text/10',
    in_progress: 'bg-status-inprogress-bg text-status-inprogress-text border border-status-inprogress-text/10',
    completed: 'bg-status-completed-bg text-status-completed-text border border-status-completed-text/10',
    cancelled: 'bg-status-cancelled-bg text-status-cancelled-text border border-status-cancelled-text/10',
    low_stock: 'bg-warning/15 text-warning border border-warning/20',
    admin: 'bg-primary/10 text-primary border border-primary/20',
    mechanic: 'bg-text-muted/10 text-text-muted border border-text-muted/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};
