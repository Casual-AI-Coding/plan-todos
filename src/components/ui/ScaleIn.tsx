'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface ScaleInProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  /** Delay in seconds (default: 0) */
  delay?: number;
  /** Duration in seconds (default: 0.2) */
  duration?: number;
}

/**
 * ScaleIn Component
 * 
 * Creates a scale-in animation from center.
 * 
 * @example
 * <ScaleIn>
 *   <Modal>Content</Modal>
 * </ScaleIn>
 */
export function ScaleIn({
  children,
  delay = 0,
  duration = 0.2,
  ...props
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default ScaleIn;
