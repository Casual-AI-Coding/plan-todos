"use client";

import { motion } from "framer-motion";
import { useId } from "react";

interface GaugeChartProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  color?: string;
  secondaryColor?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
  label?: string;
}

const sizeConfig = {
  sm: { width: 80, strokeWidth: 8, fontSize: 18 },
  md: { width: 120, strokeWidth: 12, fontSize: 24 },
  lg: { width: 160, strokeWidth: 16, fontSize: 32 },
};

export function GaugeChart({
  value,
  size = "md",
  color,
  secondaryColor,
  showValue = true,
  animated = true,
  className = "",
  label,
}: GaugeChartProps) {
  const { width, strokeWidth, fontSize } = sizeConfig[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  // Colors with defaults
  const primaryColor = color || "var(--color-primary)";
  const secondary = secondaryColor || "var(--color-secondary)";

  // Unique gradient ID
  const gradientId = `gauge-gradient-${useId()}`;

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
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="100%" stopColor={secondary} />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />

          {/* Progress circle with gradient */}
          {animated ? (
            <motion.circle
              cx={width / 2}
              cy={width / 2}
              r={radius}
              fill="none"
              stroke={`url(#${gradientId})`}
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
              stroke={`url(#${gradientId})`}
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
              className="font-bold"
              style={{
                color: "var(--color-text)",
                fontSize,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {Math.round(clampedValue)}
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
