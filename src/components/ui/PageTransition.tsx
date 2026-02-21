'use client';

import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  /** Page key for AnimatePresence */
  pageKey?: string;
}

/**
 * PageTransition Component
 * 
 * Creates a page transition animation with enter/exit animations.
 * 
 * @example
 * <PageTransition pageKey={pathname}>
 *   <YourPage />
 * </PageTransition>
 */
export function PageTransition({
  children,
  pageKey,
  ...props
}: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;
