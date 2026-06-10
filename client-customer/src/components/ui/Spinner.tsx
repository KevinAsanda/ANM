import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', light = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      role="status"
      className={`inline-block rounded-full border-t-transparent animate-spin ${
        sizeClasses[size]
      } ${light ? 'border-text-inverse' : 'border-primary'}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
