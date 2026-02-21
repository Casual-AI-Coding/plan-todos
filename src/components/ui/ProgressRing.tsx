'use client';

interface ProgressRingProps {
  /** Progress value (0-100) */
  value: number;
  /** Diameter of the ring in pixels (default: 100) */
  size?: number;
  /** Stroke width in pixels (default: 6) */
  strokeWidth?: number;
  /** Progress color (default: primary color) */
  color?: string;
  /** Background track color (default: border color) */
  trackColor?: string;
  /** Whether to show the percentage value (default: true) */
  showValue?: boolean;
  /** Center label text */
  label?: string;
  /** Tooltip title shown on hover */
  title?: string;
  /** Additional className */
  className?: string;
}

/**
 * ProgressRing Component
 * 
 * A circular progress indicator using SVG with smooth animation.
 */
export function ProgressRing({
  value,
  size = 100,
  strokeWidth = 6,
  color,
  trackColor,
  showValue = true,
  label,
  title,
  className = '',
}: ProgressRingProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));
  
  // Calculate dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
  
  // Colors - use CSS variables
  const progressColor = color || 'var(--color-primary, #0D9488)';
  const progressColorSecondary = color 
    ? color 
    : 'var(--color-secondary, #14B8A6)';
  const bgTrackColor = trackColor || 'var(--color-border, #E2E8F0)';
  
  // Center position
  const center = size / 2;
  
  // Calculate gradient ID for unique gradient per instance
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div 
      className={`inline-flex items-center justify-center relative ${className}`}
      style={{ width: size, height: size }}
      title={title}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={progressColor} />
            <stop offset="100%" stopColor={progressColorSecondary} />
          </linearGradient>
        </defs>
        
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={bgTrackColor}
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            strokeDashoffset,
          }}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="flex flex-col items-center justify-center">
        {showValue && (
          <span 
            className="font-bold"
            style={{ 
              color: 'var(--color-text)',
              fontSize: size * 0.28,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {Math.round(clampedValue)}
          </span>
        )}
        {label && (
          <span 
            style={{ 
              color: 'var(--color-text-muted)',
              fontSize: size * 0.12,
              marginTop: 2,
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * CircularProgress - Alias for ProgressRing
 */
export function CircularProgress(props: ProgressRingProps) {
  return <ProgressRing {...props} />;
}

export default ProgressRing;
