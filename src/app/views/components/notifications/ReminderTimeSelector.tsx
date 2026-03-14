"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { REMINDER_TIME_OPTIONS } from "@/lib/types";

interface ReminderTimeSelectorProps {
  title: string;
  description?: string;
  selectedTimes: number[];
  onChange: (times: number[]) => void;
  disabled?: boolean;
}

export function ReminderTimeSelector({
  title,
  description,
  selectedTimes,
  onChange,
  disabled = false,
}: ReminderTimeSelectorProps) {
  const toggleTime = (value: number) => {
    if (disabled) return;

    const newTimes = selectedTimes.includes(value)
      ? selectedTimes.filter((t) => t !== value)
      : [...selectedTimes, value].sort((a, b) => b - a);
    onChange(newTimes);
  };

  const isSelected = (value: number) => selectedTimes.includes(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {REMINDER_TIME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={isSelected(option.value) ? "primary" : "secondary"}
              size="sm"
              onClick={() => toggleTime(option.value)}
              disabled={disabled}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${
                  isSelected(option.value)
                    ? "bg-teal-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {selectedTimes.length === 0 && (
          <p className="text-sm text-amber-600 mt-2">请至少选择一个提醒时间</p>
        )}
      </CardContent>
    </Card>
  );
}
