"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Input } from "@/components/ui";
import type { Recurrence } from "@/lib/types/todo";

export interface RecurrenceFormData {
  recurrence: Recurrence;
}

export interface RecurrenceFormProps {
  value?: Recurrence | null;
  onChange: (data: RecurrenceFormData) => void;
  onClear?: () => void;
}

const DAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

export function RecurrenceForm({
  value,
  onChange,
  onClear,
}: RecurrenceFormProps) {
  // Initialize state from value prop to avoid cascading setState in effect
  const [enabled, setEnabled] = useState(() => !!value);
  const [type, setType] = useState<Recurrence["type"]>(
    () => value?.type ?? "daily",
  );
  const [interval, setInterval] = useState(() => value?.interval ?? 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    () => value?.daysOfWeek ?? [],
  );
  const [dayOfMonth, setDayOfMonth] = useState<number | undefined>(
    () => value?.dayOfMonth,
  );
  const [endDate, setEndDate] = useState(() => value?.endDate ?? "");
  const [maxOccurrences, setMaxOccurrences] = useState<number | undefined>(
    () => value?.maxOccurrences,
  );
  const prevValueRef = useRef(value);

  // Sync when value prop changes (e.g., editing a different todo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Only sync if value reference changed (not on every render)
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;

    if (value) {
      // Batch all state updates together
      setEnabled(true);
      setType(value.type);
      setInterval(value.interval);
      setDaysOfWeek(value.daysOfWeek || []);
      setDayOfMonth(value.dayOfMonth);
      setEndDate(value.endDate || "");
      setMaxOccurrences(value.maxOccurrences);
    }
  }, [value]);

  const updateRecurrence = (updates: Partial<Recurrence>) => {
    const newRecurrence: Recurrence = {
      type,
      interval,
      daysOfWeek,
      dayOfMonth,
      endDate,
      maxOccurrences,
      ...updates,
    };
    onChange({ recurrence: newRecurrence });
  };

  const handleTypeChange = (newType: Recurrence["type"]) => {
    setType(newType);
    // Reset type-specific fields when changing type
    if (newType === "weekly") {
      setDaysOfWeek([new Date().getDay()]); // Default to today
    } else if (newType === "monthly") {
      setDayOfMonth(new Date().getDate());
    }
    updateRecurrence({ type: newType });
  };

  const handleIntervalChange = (newInterval: number) => {
    setInterval(newInterval);
    updateRecurrence({ interval: newInterval });
  };

  const toggleDayOfWeek = (day: number) => {
    const newDays = daysOfWeek.includes(day)
      ? daysOfWeek.filter((d) => d !== day)
      : [...daysOfWeek, day];
    setDaysOfWeek(newDays);
    updateRecurrence({ daysOfWeek: newDays });
  };

  const handleDayOfMonthChange = (day: number) => {
    setDayOfMonth(day);
    updateRecurrence({ dayOfMonth: day });
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    updateRecurrence({ endDate: date || undefined });
  };

  const handleMaxOccurrencesChange = (count: number | undefined) => {
    setMaxOccurrences(count);
    updateRecurrence({ maxOccurrences: count });
  };

  const handleClear = () => {
    setEnabled(false);
    setType("daily");
    setInterval(1);
    setDaysOfWeek([]);
    setDayOfMonth(undefined);
    setEndDate("");
    setMaxOccurrences(undefined);
    onClear?.();
  };

  const getIntervalLabel = () => {
    switch (type) {
      case "daily":
        return interval === 1 ? "天" : "天";
      case "weekly":
        return interval === 1 ? "周" : "周";
      case "monthly":
        return interval === 1 ? "月" : "月";
      case "yearly":
        return interval === 1 ? "年" : "年";
      default:
        return "天";
    }
  };

  if (!enabled) {
    return (
      <div className="space-y-3">
        <Button variant="secondary" onClick={() => setEnabled(true)}>
          添加重复
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border border-teal-200 rounded-lg bg-teal-50/50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">重复设置</span>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          清除
        </Button>
      </div>

      {/* Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          重复类型
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "daily", label: "每天" },
            { value: "weekly", label: "每周" },
            { value: "monthly", label: "每月" },
            { value: "yearly", label: "每年" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                handleTypeChange(option.value as Recurrence["type"])
              }
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                type === option.value
                  ? "border-teal-500 bg-teal-100 text-teal-700"
                  : "border-gray-200 text-gray-600 hover:border-teal-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interval */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">每</span>
        <Input
          type="number"
          min={1}
          max={99}
          value={interval}
          onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
          className="w-16 text-center"
        />
        <span className="text-sm text-gray-600">{getIntervalLabel()}</span>
      </div>

      {/* Days of Week (for weekly) */}
      {type === "weekly" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择星期
          </label>
          <div className="flex gap-1">
            {DAY_NAMES.map((name, day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDayOfWeek(day)}
                className={`w-10 h-10 rounded-lg text-sm border transition-colors ${
                  daysOfWeek.includes(day)
                    ? "border-teal-500 bg-teal-500 text-white"
                    : "border-gray-200 text-gray-600 hover:border-teal-300"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Day of Month (for monthly) */}
      {type === "monthly" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">每月第</span>
          <Input
            type="number"
            min={1}
            max={31}
            value={dayOfMonth || ""}
            onChange={(e) =>
              handleDayOfMonthChange(parseInt(e.target.value) || 1)
            }
            className="w-16 text-center"
            placeholder="1"
          />
          <span className="text-sm text-gray-600">日</span>
        </div>
      )}

      {/* End Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          结束日期（可选）
        </label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          placeholder="不限制结束时间"
        />
      </div>

      {/* Max Occurrences */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">最多重复</span>
        <Input
          type="number"
          min={1}
          max={999}
          value={maxOccurrences || ""}
          onChange={(e) =>
            handleMaxOccurrencesChange(
              e.target.value ? parseInt(e.target.value) : undefined,
            )
          }
          className="w-20 text-center"
          placeholder="无限"
        />
        <span className="text-sm text-gray-600">次</span>
      </div>

      {/* Preview */}
      <div className="text-sm text-gray-500 italic">
        {interval === 1
          ? type === "daily"
            ? "每天"
            : type === "weekly"
              ? daysOfWeek.length > 0
                ? `每周${daysOfWeek.map((d) => DAY_NAMES[d]).join("、")}`
                : "每周"
              : type === "monthly"
                ? `每月第${dayOfMonth || 1}日`
                : type === "yearly"
                  ? "每年"
                  : "自定义"
          : `每${interval}${
              type === "daily"
                ? "天"
                : type === "weekly"
                  ? "周"
                  : type === "monthly"
                    ? "月"
                    : "年"
            }`}
        {endDate && `，截止到 ${endDate}`}
        {maxOccurrences && `，共${maxOccurrences}次`}
      </div>
    </div>
  );
}
