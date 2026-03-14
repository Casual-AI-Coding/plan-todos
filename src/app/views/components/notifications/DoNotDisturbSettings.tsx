"use client";

import { Card } from "@/components/ui";
import { WEEK_DAYS } from "@/lib/types/notification";

interface DoNotDisturbSettingsProps {
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

export function DoNotDisturbSettings({
  enabled,
  startTime,
  endTime,
  days,
  onEnabledChange,
  onStartTimeChange,
  onEndTimeChange,
  onDaysChange,
  disabled,
}: DoNotDisturbSettingsProps) {
  const toggleDay = (day: number) => {
    if (days.includes(day)) {
      onDaysChange(days.filter((d) => d !== day));
    } else {
      onDaysChange([...days, day].sort());
    }
  };

  const selectAllDays = () => {
    onDaysChange([0, 1, 2, 3, 4, 5, 6]);
  };

  const clearAllDays = () => {
    onDaysChange([]);
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌙</span>
          <h3 className="font-medium" style={{ color: "var(--color-text)" }}>
            勿扰模式
          </h3>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div
            className="w-11 h-6 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
            style={{
              backgroundColor: enabled
                ? "var(--color-primary)"
                : "var(--color-border)",
            }}
          />
        </label>
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
        在指定时间段内不会发送任何通知
      </p>

      {enabled && (
        <div className="space-y-4">
          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                开始时间
              </label>
              <input
                type="time"
                value={startTime || "22:00"}
                onChange={(e) => onStartTimeChange(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                结束时间
              </label>
              <input
                type="time"
                value={endTime || "08:00"}
                onChange={(e) => onEndTimeChange(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                生效日期
              </label>
              <div className="flex gap-2">
                <button
                  onClick={selectAllDays}
                  disabled={disabled}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                  style={{ color: "var(--color-primary)" }}
                >
                  全选
                </button>
                <button
                  onClick={clearAllDays}
                  disabled={disabled}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  清除
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  disabled={disabled}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    days.includes(day.value) ? "text-white" : "hover:bg-gray-50"
                  }`}
                  style={{
                    backgroundColor: days.includes(day.value)
                      ? "var(--color-primary)"
                      : "var(--color-bg)",
                    borderColor: days.includes(day.value)
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                    color: days.includes(day.value)
                      ? "white"
                      : "var(--color-text)",
                  }}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
