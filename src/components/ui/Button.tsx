'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
          };
        case 'secondary':
          return {
            backgroundColor: 'var(--color-bg-card)',
            border: '2px solid var(--color-border)',
            color: 'var(--color-text)',
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
          };
        case 'danger':
          return {
            backgroundColor: 'var(--color-error)',
            color: 'var(--color-text-inverse)',
          };
        default:
          return {};
      }
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${className}`}
        style={{
          ...getVariantStyles(),
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
