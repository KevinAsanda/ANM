import React, { useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, className = '', rows = 3, ...props }, ref) => {
    const id = useId();
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const describedBy = [
      error ? errorId : null,
      helperText ? helperId : null
    ].filter(Boolean).join(' ');

    return (
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor={id} className="text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
          {label}
          {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
        </label>
        
        <textarea
          id={id}
          ref={ref}
          rows={rows}
          className={`px-3 py-2 border rounded-lg font-sans text-sm bg-surface text-text placeholder-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-background disabled:cursor-not-allowed transition-all duration-200 ${
            error ? 'border-error focus:border-error focus:ring-error/10' : 'border-border'
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          required={required}
          {...props}
        />

        {error && (
          <span id={errorId} className="text-xs text-error mt-0.5" role="alert">
            {error}
          </span>
        )}

        {!error && helperText && (
          <span id={helperId} className="text-xs text-text-muted mt-0.5">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
