"use client";

import { useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RippleEffectProps {
  children: ReactNode;
  className?: string;
  color?: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function RippleEffect({
  children,
  className = "",
  color = "rgba(255, 255, 255, 0.4)",
  onClick,
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      createRipple(e);
      onClick?.(e);
    },
    [createRipple, onClick]
  );

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      style={{ borderRadius: "inherit" }}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ opacity: 0.5, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: color,
              borderRadius: "50%",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
