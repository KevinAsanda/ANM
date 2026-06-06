import React from 'react';
import { Spinner } from './Spinner.js';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-border-focus disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary text-text-inverse hover:bg-primary-hover active:bg-primary-hover',
    secondary: 'bg-primary-light text-primary hover:bg-blue-200 active:bg-blue-200',
    danger: 'bg-error text-text-inverse hover:bg-red-700 active:bg-red-700',
    ghost: 'bg-transparent text-text hover:bg-background active:bg-background',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" light={variant !== 'ghost' && variant !== 'secondary'} />}
      {children}
    </button>
  );
};
