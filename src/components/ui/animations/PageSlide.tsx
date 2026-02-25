"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageSlideProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
}

const directionOffsets = {
  left: { initial: { x: -50 }, animate: { x: 0 }, exit: { x: 50 } },
  right: { initial: { x: 50 }, animate: { x: 0 }, exit: { x: -50 } },
  up: { initial: { y: 50 }, animate: { y: 0 }, exit: { y: -50 } },
  down: { initial: { y: -50 }, animate: { y: 0 }, exit: { y: 50 } },
};

export function PageSlide({
  children,
  className = "",
  direction = "up",
  duration = 0.4,
}: PageSlideProps) {
  const variants = {
    initial: {
      opacity: 0,
      ...directionOffsets[direction].initial,
    },
    animate: {
      opacity: 1,
      ...directionOffsets[direction].animate,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
    exit: {
      opacity: 0,
      ...directionOffsets[direction].exit,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
