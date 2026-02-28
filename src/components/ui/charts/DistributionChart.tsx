"use client";

import { motion } from "framer-motion";
import { useId, useMemo } from "react";

interface DistributionItem {
  label: string;
  value: number;
  color?: string;
}

interface DistributionChartProps {
  data: DistributionItem[];
  type?: "pie" | "donut" | "bar";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { width: 120, barHeight: 120, barWidth: 16 },
  md: { width: 160, barHeight: 160, barWidth: 24 },
  lg: { width: 200, barHeight: 200, barWidth: 32 },
};

const defaultColors = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-cta)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
];

export function DistributionChart({
  data,
  type = "donut",
  size = "md",
  animated = true,
  showLegend = true,
  showValues = true,
  className = "",
}: DistributionChartProps) {
  const { width, barHeight, barWidth } = sizeConfig[size];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const gradientId = `distribution-gradient-${useId()}`;

  // Calculate angles for pie/donut
  // Calculate segments with angles using useMemo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const segments = useMemo(() => {
    let currentAngle = 0;
    return data.map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      const color = item.color || defaultColors[index % defaultColors.length];
      return {
        ...item,
        percentage,
        angle,
        startAngle,
        color,
      };
    });
  }, [data, total]);

  // Polar to Cartesian coordinates
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Create SVG arc path
  const createArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      x,
      y,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  };

  // Create donut arc path (with hole)
  const createDonutArc = (
    x: number,
    y: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
    const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
    const startInner = polarToCartesian(x, y, innerRadius, endAngle);
    const endInner = polarToCartesian(x, y, innerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      startOuter.x,
      startOuter.y,
      "A",
      outerRadius,
      outerRadius,
      0,
      largeArcFlag,
      0,
      endOuter.x,
      endOuter.y,
      "L",
      endInner.x,
      endInner.y,
      "A",
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      1,
      startInner.x,
      startInner.y,
      "Z",
    ].join(" ");
  };

  const centerX = width / 2;
  const centerY = width / 2;
  const outerRadius = width / 2 - 8;
  const innerRadius = type === "donut" ? outerRadius * 0.6 : 0;

  // Bar chart layout
  const maxValue = Math.max(...data.map((d) => d.value));
  const barChartData = segments.map((item, index) => ({
    ...item,
    height: (item.value / maxValue) * barHeight,
    x: index * (barWidth + 8),
  }));

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {type === "bar" ? (
        // Bar Chart
        <svg
          width={barChartData.length * (barWidth + 8)}
          height={barHeight + 24}
          role="img"
          aria-label="Distribution bar chart"
        >
          {barChartData.map((item, index) =>
            animated ? (
              <motion.rect
                key={item.label}
                x={item.x}
                y={barHeight - item.height}
                width={barWidth}
                rx={4}
                fill={item.color}
                initial={{ height: 0, y: barHeight }}
                animate={{ height: item.height, y: barHeight - item.height }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ) : (
              <rect
                key={item.label}
                x={item.x}
                y={barHeight - item.height}
                width={barWidth}
                height={item.height}
                rx={4}
                fill={item.color}
              />
            ),
          )}
          {/* Labels */}
          {barChartData.map((item, index) => (
            <text
              key={`label-${item.label}`}
              x={item.x + barWidth / 2}
              y={barHeight + 16}
              textAnchor="middle"
              fontSize={10}
              fill="var(--color-text-muted)"
            >
              {item.label.slice(0, 4)}
            </text>
          ))}
        </svg>
      ) : (
        // Pie or Donut Chart
        <svg
          width={width}
          height={width}
          role="img"
          aria-label={`Distribution ${type} chart`}
        >
          <defs>
            {segments.map((item, index) => (
              <linearGradient
                key={`grad-${index}`}
                id={`${gradientId}-${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={item.color} />
                <stop offset="100%" stopColor={item.color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          {segments.map((item, index) =>
            animated ? (
              <motion.path
                key={item.label}
                d={
                  type === "donut"
                    ? createDonutArc(
                        centerX,
                        centerY,
                        outerRadius,
                        innerRadius,
                        item.startAngle,
                        item.startAngle + item.angle,
                      )
                    : createArc(
                        centerX,
                        centerY,
                        outerRadius,
                        item.startAngle,
                        item.startAngle + item.angle,
                      )
                }
                fill={`url(#${gradientId}-${index})`}
                stroke="var(--color-bg-card)"
                strokeWidth={2}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ) : (
              <path
                key={item.label}
                d={
                  type === "donut"
                    ? createDonutArc(
                        centerX,
                        centerY,
                        outerRadius,
                        innerRadius,
                        item.startAngle,
                        item.startAngle + item.angle,
                      )
                    : createArc(
                        centerX,
                        centerY,
                        outerRadius,
                        item.startAngle,
                        item.startAngle + item.angle,
                      )
                }
                fill={`url(#${gradientId}-${index})`}
                stroke="var(--color-bg-card)"
                strokeWidth={2}
              />
            ),
          )}
          {type === "donut" && (
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={width / 8}
              fontWeight="bold"
              fill="var(--color-text)"
            >
              {total}
            </text>
          )}
        </svg>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {segments.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[var(--color-text-muted)] truncate max-w-[80px]">
                {item.label}
              </span>
              {showValues && (
                <span className="text-[var(--color-text)] font-medium">
                  {Math.round(item.percentage * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
