'use client';

import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}

export function Card({ 
  children, 
  className = '', 
  onClick,
  hoverable = false,
  padding = 'md',
  style
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg border shadow-sm
        ${hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
        ...style
      }}
    >
      {children}
    </div>
  );
}
