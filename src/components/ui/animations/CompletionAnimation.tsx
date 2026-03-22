"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CompletionAnimationProps {
  isComplete: boolean;
  duration?: number;
}

/**
 * Simple completion animation with checkmark and fade
 */
export function CompletionAnimation({
  isComplete,
  duration = 500,
}: CompletionAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const prevIsComplete = useRef(isComplete);

  useEffect(() => {
    // Only trigger animation when transitioning from false to true
    if (isComplete && !prevIsComplete.current) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, duration);
      return () => clearTimeout(timer);
    }
    prevIsComplete.current = isComplete;
  }, [isComplete, duration]);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "var(--color-primary)",
            }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Confetti celebration animation for special completions
 */
export function ConfettiCelebration({
  trigger,
  particleCount = 50,
  duration = 2000,
}: {
  trigger: boolean;
  particleCount?: number;
  duration?: number;
}) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; color: string; delay: number }>
  >([]);
  const prevTrigger = useRef(trigger);

  useEffect(() => {
    // Only trigger when transitioning from false to true
    if (trigger && !prevTrigger.current) {
      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);
      return () => clearTimeout(timer);
    }
    prevTrigger.current = trigger;
  }, [trigger, particleCount, duration]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                left: "50%",
                top: "50%",
                scale: 0,
              }}
              animate={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                scale: 1,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: duration / 1000,
                delay: particle.delay,
                ease: "easeOut",
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
