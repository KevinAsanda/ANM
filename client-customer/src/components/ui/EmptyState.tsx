import React from 'react';
import { Button } from './Button.js';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: EmptyStateAction;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-border border-dashed rounded-lg">
      {icon && (
        <div className="text-text-muted mb-4 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-text mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
