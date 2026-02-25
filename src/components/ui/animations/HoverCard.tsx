"use client";

import { motion } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  hoverElevation?: number;
  glowOnHover?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

export function HoverCard({
  children,
  className = "",
  hoverElevation = -4,
  glowOnHover = true,
  style,
  onClick,
}: HoverCardProps) {
  return (
    <motion.div
      className={`rounded-lg border ${className}`}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        backdropFilter: "blur(var(--glass-blur, 0px)) saturate(180%)",
        WebkitBackdropFilter: "blur(var(--glass-blur, 0px)) saturate(180%)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onClick={onClick}
      whileHover={{
        y: hoverElevation,
        boxShadow: glowOnHover
          ? "var(--shadow-md), var(--shadow-glow)"
          : "var(--shadow-md)",
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
      }}
      whileTap={{
        y: hoverElevation * 0.5,
        scale: 0.98,
        transition: { duration: 0.1 },
      }}
    >
      {children}
    </motion.div>
  );
}
