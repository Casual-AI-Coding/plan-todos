"use client";

import { motion } from "framer-motion";

interface GaugeChartProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  color?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
  label?: string;
}

const sizeConfig = {
  sm: { width: 80, strokeWidth: 8 },
  md: { width: 120, strokeWidth: 12 },
  lg: { width: 160, strokeWidth: 16 },
};

export function GaugeChart({
  value,
  size = "md",
  color = "var(--color-primary)",
  showValue = true,
  animated = true,
  className = "",
  label,
}: GaugeChartProps) {
  const { width, strokeWidth } = sizeConfig[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <svg
          width={width}
          height={width}
          className="transform -rotate-90"
          role="img"
          aria-label={`Gauge: ${clampedValue}%`}
        >
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          {animated ? (
            <motion.circle
              cx={width / 2}
              cy={width / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          ) : (
            <circle
              cx={width / 2}
              cy={width / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
              }}
            />
          )}
        </svg>

        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {Math.round(clampedValue)}%
            </span>
          </div>
        )}
      </div>

      {label && (
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
