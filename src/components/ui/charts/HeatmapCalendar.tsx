"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { subMonths, format, getDay, startOfWeek, endOfWeek, addDays } from "date-fns";
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

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function getIntensityColor(count: number, maxCount: number, baseColor: string): string {
  if (count === 0) return "var(--color-bg-hover)";
  const intensity = count / maxCount;
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

  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  // Generate weeks data
  const weeks = useMemo(() => {
    const result: { date: Date; dayOfWeek: number }[][] = [];
    let currentWeek: { date: Date; dayOfWeek: number }[] = [];
    
    // Start from the Sunday of the week containing startDate
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

  // Get month labels positions
  const monthLabels = useMemo(() => {
    const labels: { month: number; weekIndex: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0]?.date;
      if (firstDay) {
        const month = firstDay.getMonth();
        if (month !== lastMonth) {
          labels.push({ month, weekIndex });
          lastMonth = month;
        }
      }
    });
    
    return labels;
  }, [weeks]);

  return (
    <div className={`${className}`}>
      {/* Month labels */}
      <div className="flex mb-2 ml-8">
        {monthLabels.map(({ month, weekIndex }, i) => (
          <div
            key={`${month}-${i}`}
            className="text-xs"
            style={{ 
              color: "var(--color-text-muted)",
              marginLeft: i === 0 ? `${weekIndex * 12}px` : `${(weekIndex - monthLabels[i-1].weekIndex - 1) * 12}px`,
              width: "40px"
            }}
          >
            {MONTHS[month]}
          </div>
        ))}
      </div>
      
      <div className="flex">
        {/* Weekday labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {WEEKDAYS.map((day, i) => (
            <div 
              key={day} 
              className="h-2.5 text-[10px] flex items-center"
              style={{ color: "var(--color-text-muted)", visibility: i % 2 === 0 ? "hidden" : "visible" }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Grid */}
        <div className="flex gap-0.5">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((day, dayIndex) => {
                const dateStr = format(day.date, "yyyy-MM-dd");
                const count = dataMap.get(dateStr) || 0;
                const bgColor = getIntensityColor(count, maxCount, color);
                
                return (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: weekIndex * 0.01 }}
                    className="w-2.5 h-2.5 rounded-sm cursor-pointer hover:ring-1 hover:ring-offset-1"
                    style={{
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
      <div className="flex items-center gap-1 mt-3 ml-8">
        <span className="text-xs mr-2" style={{ color: "var(--color-text-muted)" }}>少</span>
        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "var(--color-bg-hover)" }}></div>
        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}></div>
        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `color-mix(in srgb, ${color} 40%, transparent)` }}></div>
        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `color-mix(in srgb, ${color} 70%, transparent)` }}></div>
        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }}></div>
        <span className="text-xs ml-2" style={{ color: "var(--color-text-muted)" }}>多</span>
      </div>
    </div>
  );
}
