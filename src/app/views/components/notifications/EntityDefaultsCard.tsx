"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ReminderTimeSelector } from "./ReminderTimeSelector";

interface EntityDefaultsCardProps {
  title: string;
  description?: string;
  enabled: boolean;
  times: number[];
  onEnabledChange: (enabled: boolean) => void;
  onTimesChange: (times: number[]) => void;
  disabled?: boolean;
}

export function EntityDefaultsCard({
  title,
  description,
  enabled,
  times,
  onEnabledChange,
  onTimesChange,
  disabled = false,
}: EntityDefaultsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Checkbox
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            disabled={disabled}
          />
        </div>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </CardHeader>
      <CardContent>
        <ReminderTimeSelector
          title="默认提醒时间"
          selectedTimes={times}
          onChange={onTimesChange}
          disabled={disabled || !enabled}
        />
      </CardContent>
    </Card>
  );
}
