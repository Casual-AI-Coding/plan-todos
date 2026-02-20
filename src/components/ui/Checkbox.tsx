'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={`
            w-5 h-5 rounded 
            border-2
            bg-transparent
            cursor-pointer
            ${className}
          `}
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-primary)',
            '--tw-ring-color': 'var(--color-primary)',
          } as React.CSSProperties}
          {...props}
        />
        {label && (
          <span style={{ color: 'var(--color-text)' }}>{label}</span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
