"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  color?: "teal" | "orange" | "gray";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  showLabel = false,
  color = "teal",
  size = "md",
  className = "",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorMap = {
    teal: "var(--color-primary)",
    orange: "var(--color-warning)",
    gray: "var(--color-text-muted)",
  };

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span style={{ color: "var(--color-text-muted)" }}>Progress</span>
          <span className="font-medium" style={{ color: "var(--color-text)" }}>
            {clampedValue}%
          </span>
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden relative ${sizeStyles[size]}`}
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-text-muted) 12%, transparent)",
        }}
      >
        {clampedValue > 80 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
        <motion.div
          className="h-full rounded-full"
          initial={false}
          animate={{ width: `${clampedValue}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{ backgroundColor: colorMap[color] }}
        />
      </div>
    </div>
  );
}
