'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Custom className */
  className?: string;
  /** Whether to show shimmer animation (default: true) */
  animated?: boolean;
  /** Additional style */
  style?: React.CSSProperties;
}

/**
 * Skeleton Component
 * 
 * A placeholder component with shimmer animation for loading states.
 * 
 * @example
 * <Skeleton variant="rectangular" width={200} height={100} />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="text" width="100%" height={20} />
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  animated = true,
  style,
}: SkeletonProps) {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circular':
        return { borderRadius: '50%' };
      case 'text':
        return { 
          borderRadius: '4px',
          height: height || '1em',
        };
      case 'rectangular':
      default:
        return { borderRadius: '8px' };
    }
  };

  const baseStyles: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
    backgroundColor: 'var(--color-bg-hover)',
    ...getVariantStyles(),
    ...style,
  };

  if (!animated) {
    return (
      <div 
        className={className} 
        style={baseStyles} 
      />
    );
  }

  return (
    <motion.div
      className={className}
      style={baseStyles}
      initial={{ opacity: 0.5 }}
      animate={{ 
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default Skeleton;
