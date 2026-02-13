'use client';

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  color?: 'teal' | 'orange' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({ 
  value, 
  showLabel = false, 
  color = 'teal',
  size = 'md',
  className = '' 
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorStyles = {
    teal: 'bg-teal-600',
    orange: 'bg-orange-500',
    gray: 'bg-gray-400',
  };

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium" style={{ color: '#134E4A' }}>{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div 
          className={`h-full ${colorStyles[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
