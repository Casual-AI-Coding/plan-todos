'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  className = '', 
  onClick,
  hoverable = false,
  padding = 'md'
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
        bg-white rounded-lg border border-teal-100 shadow-sm
        ${hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
      style={{ borderColor: '#CCFBF1' }}
    >
      {children}
    </div>
  );
}
