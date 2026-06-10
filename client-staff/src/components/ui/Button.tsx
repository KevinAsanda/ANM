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
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm';

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-hover text-text-inverse hover:shadow-md',
    secondary: 'bg-primary-light text-primary hover:bg-blue-100/80 active:bg-blue-100',
    danger: 'bg-error text-text-inverse hover:bg-red-600 hover:shadow-md',
    ghost: 'bg-transparent text-text hover:bg-slate-100 active:bg-slate-200 shadow-none border border-transparent hover:border-slate-200',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5',
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
