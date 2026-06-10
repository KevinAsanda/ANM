import React, { useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, required, className = '', ...props }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;

    return (
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor={id} className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
          {label}
          {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
        </label>
        
        <select
          id={id}
          ref={ref}
          className={`px-3 py-2 border rounded-lg font-sans text-sm bg-surface text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-background disabled:cursor-not-allowed transition-all duration-200 ${
            error ? 'border-error focus:border-error focus:ring-error/10' : 'border-border'
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          required={required}
          {...props}
        >
          <option value="">Select an option...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && (
          <span id={errorId} className="text-xs text-error mt-0.5" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
