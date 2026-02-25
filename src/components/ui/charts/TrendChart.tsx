"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface TrendData {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: TrendData[];
  type?: "line" | "area" | "bar";
  color?: string;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
  height?: number;
}

export function TrendChart({
  data = [],
  type = "line",
  color = "var(--color-primary)",
  showGrid = true,
  animated = true,
  className = "",
  height = 200,
}: TrendChartProps) {
  const { maxValue, points, barWidth } = useMemo(() => {
    if (data.length === 0)
      return { maxValue: 0, points: "", barWidth: 0 };

    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const chartWidth = 100;
    const chartHeight = 100;

    const pts = data
      .map((d, i) => {
        const x = (i / (data.length - 1)) * chartWidth;
        const y = chartHeight - (d.value / maxValue) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    return {
      maxValue,
      points: pts,
      barWidth: chartWidth / data.length,
    };
  }, [data]);

  const areaPoints = useMemo(() => {
    if (points === "") return "";
    const chartWidth = 100;
    return `${points} ${chartWidth},100 0,100`;
  }, [points]);

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height, color: "var(--color-text-muted)" }}
      >
        No data
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        role="img"
        aria-label="Trend chart"
      >
        {showGrid && (
          <>
            <line
              x1="0"
              y1="25"
              x2="100"
              y2="25"
              stroke="var(--color-border)"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1="50"
              x2="100"
              y2="50"
              stroke="var(--color-border)"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1="75"
              x2="100"
              y2="75"
              stroke="var(--color-border)"
              strokeWidth="0.5"
            />
          </>
        )}

        {type === "area" && (
          <motion.polygon
            points={areaPoints}
            fill={color}
            fillOpacity="0.2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {type === "line" || type === "area" ? (
          <motion.polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ) : (
          data.map((d, i) => {
            const barHeight = (d.value / maxValue) * 100;
            return animated ? (
              <motion.rect
                key={d.date}
                x={i * barWidth + 1}
                y={100 - barHeight}
                width={barWidth - 2}
                height={barHeight}
                fill={color}
                initial={{ scaleY: 0, originY: 100 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              />
            ) : (
              <rect
                key={d.date}
                x={i * barWidth + 1}
                y={100 - barHeight}
                width={barWidth - 2}
                height={barHeight}
                fill={color}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
