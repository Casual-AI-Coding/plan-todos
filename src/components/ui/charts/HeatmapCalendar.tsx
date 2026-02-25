"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { subMonths, differenceInDays, format, parseISO } from "date-fns";

interface HeatmapData {
  date: string; // ISO date string
  count: number;
}

interface HeatmapCalendarProps {
  data: HeatmapData[];
  months?: number;
  color?: string;
  onCellClick?: (date: string) => void;
  className?: string;
}

function getIntensityColor(count: number, maxCount: number, baseColor: string): string {
  if (count === 0) return "var(--color-bg-card)";
  
  const intensity = Math.min(count / maxCount, 1);
  
  // Generate lighter versions of the base color
  // This is a simplified approach - in production, use proper color interpolation
  if (intensity > 0.75) return baseColor;
  if (intensity > 0.5) return `color-mix(in srgb, ${baseColor} 70%, transparent)`;
  if (intensity > 0.25) return `color-mix(in srgb, ${baseColor} 40%, transparent)`;
  return `color-mix(in srgb, ${baseColor} 20%, transparent)`;
}

export function HeatmapCalendar({
  data = [],
  months = 6,
  color = "var(--color-primary)",
  onCellClick,
  className = "",
}: HeatmapCalendarProps) {
  const endDate = new Date();
  const startDate = subMonths(endDate, months);

  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.date, d.count));
    return map;
  }, [data]);

  const maxCount = useMemo(() => {
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  const days = useMemo(() => {
    const result = [];
    const totalDays = differenceInDays(endDate, startDate);

    for (let i = totalDays; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const count = dataMap.get(dateStr) || 0;

      result.push({
        date: dateStr,
        displayDate: format(date, "MMM d"),
        count,
      });
    }

    return result;
  }, [endDate, startDate, dataMap]);

  return (
    <div className={`p-4 ${className}`}>
      <div className="grid grid-cols-[repeat(7,1fr)] gap-1">
        {days.map((day, index) => {
          const bgColor = getIntensityColor(day.count, maxCount, color);
          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.002, duration: 0.15 }}
              className="aspect-square rounded-sm cursor-pointer"
              style={{
                backgroundColor: bgColor,
                border: "1px solid var(--color-border)",
              }}
              onClick={() => onCellClick?.(day.date)}
              title={`${day.displayDate}: ${day.count} activities`}
            />
          );
        })}
      </div>
      <div
        className="flex justify-between mt-2 text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span>{format(startDate, "MMM yyyy")}</span>
        <span>{format(endDate, "MMM yyyy")}</span>
      </div>
    </div>
  );
}
