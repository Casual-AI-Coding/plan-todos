"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { WEEK_DAYS } from "@/lib/types";

interface DoNotDisturbSectionProps {
  enabled: boolean;
  startTime?: string;
  endTime?: string;
  days: number[];
  onEnabledChange: (enabled: boolean) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onDaysChange: (days: number[]) => void;
  disabled?: boolean;
}

export function DoNotDisturbSection({
  enabled,
  startTime = "22:00",
  endTime = "08:00",
  days,
  onEnabledChange,
  onStartTimeChange,
  onEndTimeChange,
  onDaysChange,
  disabled = false,
}: DoNotDisturbSectionProps) {
  const toggleDay = (day: number) => {
    if (disabled || !enabled) return;

    const newDays = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day].sort((a, b) => a - b);
    onDaysChange(newDays);
  };

  const isDaySelected = (day: number) => days.includes(day);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>勿扰模式</CardTitle>
          <Checkbox
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            disabled={disabled}
          />
        </div>
        <p className="text-sm text-gray-500">在指定时间段内不发送通知</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              开始时间
            </label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              disabled={disabled || !enabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束时间
            </label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              disabled={disabled || !enabled}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            生效日期
          </label>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                disabled={disabled || !enabled}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    isDaySelected(day.value)
                      ? "bg-teal-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                  ${disabled || !enabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {days.length === 0 && enabled && (
          <p className="text-sm text-amber-600">请至少选择一天</p>
        )}
      </CardContent>
    </Card>
  );
}
