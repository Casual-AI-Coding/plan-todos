"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  subMonths,
  format,
  getDay,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";
import { zhCN } from "date-fns/locale";

interface HeatmapData {
  date: string;
  count: number;
}

interface HeatmapCalendarProps {
  data: HeatmapData[];
  months?: number;
  color?: string;
  onCellClick?: (date: string) => void;
  className?: string;
}

// Only show odd weekdays to save space (matching GitHub style)
const WEEKDAYS = ["", "一", "", "三", "", "五", ""];
const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

function getIntensityColor(
  count: number,
  maxCount: number,
  baseColor: string,
): string {
  if (count === 0) return "var(--color-border)";
  const intensity = count / Math.max(maxCount, 1);
  if (intensity > 0.75) return baseColor;
  if (intensity > 0.5)
    return `color-mix(in srgb, ${baseColor} 60%, transparent)`;
  if (intensity > 0.25)
    return `color-mix(in srgb, ${baseColor} 35%, transparent)`;
  return `color-mix(in srgb, ${baseColor} 15%, transparent)`;
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

  const maxCount = useMemo(
    () => Math.max(...data.map((d) => d.count), 1),
    [data],
  );

  // Generate weeks data - each week is a column
  const weeks = useMemo(() => {
    const result: { date: Date; dayOfWeek: number }[][] = [];
    let currentWeek: { date: Date; dayOfWeek: number }[] = [];

    let current = startOfWeek(startDate, { weekStartsOn: 0 });
    const end = endOfWeek(endDate, { weekStartsOn: 0 });

    while (current <= end) {
      const dayOfWeek = getDay(current);
      currentWeek.push({ date: new Date(current), dayOfWeek });

      if (dayOfWeek === 6) {
        result.push(currentWeek);
        currentWeek = [];
      }

      current = addDays(current, 1);
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [startDate, endDate]);

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0]?.date;
      if (firstDay) {
        const month = firstDay.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: MONTHS[month], weekIndex });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);

  return (
    <div className={`w-full ${className}`}>
      {/* Month labels */}
      <div
        className="flex mb-1 text-xs relative"
        style={{ color: "var(--color-text-muted)", paddingLeft: "28px" }}
      >
        {monthLabels.map((label, i) => {
          const nextLabel = monthLabels[i + 1];
          const width = nextLabel
            ? `${(nextLabel.weekIndex - label.weekIndex) * 12}px`
            : "auto";

          return (
            <span
              key={`${label.month}-${i}`}
              className="flex-shrink-0"
              style={{ width, minWidth: "30px" }}
            >
              {label.month}
            </span>
          );
        })}
      </div>

      <div className="flex w-full">
        {/* Weekday labels */}
        <div
          className="flex flex-col justify-between flex-shrink-0 pr-1"
          style={{ width: "26px" }}
        >
          {WEEKDAYS.map((day, i) => (
            <div
              key={i}
              className="text-[10px] text-right leading-none"
              style={{
                color: "var(--color-text-muted)",
                height: "12px",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid - fill remaining width */}
        <div className="flex-1 flex gap-[4px] overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="flex flex-col gap-[4px] flex-shrink-0"
            >
              {week.map((day, dayIndex) => {
                const dateStr = format(day.date, "yyyy-MM-dd");
                const count = dataMap.get(dateStr) || 0;
                const bgColor = getIntensityColor(count, maxCount, color);

                return (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: weekIndex * 0.003, duration: 0.1 }}
                    className="rounded-[2px] cursor-pointer hover:ring-1 hover:ring-offset-1 flex-shrink-0"
                    style={{
                      width: "15px",
                      height: "15px",
                      backgroundColor: bgColor,
                    }}
                    onClick={() => onCellClick?.(dateStr)}
                    title={`${format(day.date, "M月d日", { locale: zhCN })}: ${count} 次`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-[3px] mt-2 text-xs"
        style={{ marginLeft: "28px" }}
      >
        <span style={{ color: "var(--color-text-muted)" }}>少</span>
        {[0, 0.15, 0.35, 0.6, 1].map((opacity, i) => (
          <div
            key={i}
            className="rounded-[2px] flex-shrink-0"
            style={{
              width: "10px",
              height: "10px",
              backgroundColor:
                opacity === 0
                  ? "var(--color-border)"
                  : `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`,
            }}
          />
        ))}
        <span style={{ color: "var(--color-text-muted)" }}>多</span>
      </div>
    </div>
  );
}
