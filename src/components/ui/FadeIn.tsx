'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  /** Delay in seconds (default: 0) */
  delay?: number;
  /** Duration in seconds (default: 0.3) */
  duration?: number;
  /** Direction to fade in from (default: up) */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

/**
 * FadeIn Component
 * 
 * Creates a fade-in animation with optional direction.
 * 
 * @example
 * <FadeIn>
 *   <Card>Content</Card>
 * </FadeIn>
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.3,
  direction = 'up',
  ...props
}: FadeInProps) {
  const directionVariants = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
    none: { y: 0, x: 0 },
  };

  const initial = direction === 'none'
    ? { opacity: 0 }
    : { opacity: 0, ...directionVariants[direction] };

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default FadeIn;
