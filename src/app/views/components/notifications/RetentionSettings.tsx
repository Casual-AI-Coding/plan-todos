"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface RetentionSettingsProps {
  retentionDays: number;
  onChange: (days: number) => void;
  disabled?: boolean;
}

const RETENTION_OPTIONS = [
  { value: 7, label: "7天" },
  { value: 30, label: "30天" },
  { value: 90, label: "90天" },
  { value: 180, label: "180天" },
  { value: 365, label: "1年" },
];

export function RetentionSettings({
  retentionDays,
  onChange,
  disabled = false,
}: RetentionSettingsProps) {
  const handleCustomChange = (value: string) => {
    const days = parseInt(value, 10);
    if (!isNaN(days) && days > 0) {
      onChange(days);
    }
  };

  const isCustomValue = !RETENTION_OPTIONS.some(
    (opt) => opt.value === retentionDays,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>通知历史保留</CardTitle>
        <p className="text-sm text-gray-500">
          自动清理超过保留期限的通知历史记录
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {RETENTION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  retentionDays === option.value
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">自定义：</span>
          <Input
            type="number"
            min={1}
            max={3650}
            value={isCustomValue ? retentionDays : ""}
            onChange={(e) => handleCustomChange(e.target.value)}
            disabled={disabled}
            placeholder="天数"
            className="w-24"
          />
          <span className="text-sm text-gray-500">天</span>
        </div>

        <p className="text-sm text-gray-500">
          当前设置：保留最近 <strong>{retentionDays} 天</strong> 的通知历史
        </p>
      </CardContent>
    </Card>
  );
}
