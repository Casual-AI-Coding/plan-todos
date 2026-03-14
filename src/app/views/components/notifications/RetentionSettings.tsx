"use client";

import { Card } from "@/components/ui";

interface RetentionSettingsProps {
  days: number;
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
  days,
  onChange,
  disabled,
}: RetentionSettingsProps) {
  return (
    <Card className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">🗑️</span>
        <h3 className="font-medium" style={{ color: "var(--color-text)" }}>
          历史记录保留
        </h3>
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
        自动清理超过保留时间的通知历史记录
      </p>

      <div className="grid grid-cols-5 gap-2">
        {RETENTION_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              days === option.value ? "text-white" : "hover:bg-gray-50"
            }`}
            style={{
              backgroundColor:
                days === option.value
                  ? "var(--color-primary)"
                  : "var(--color-bg)",
              borderColor:
                days === option.value
                  ? "var(--color-primary)"
                  : "var(--color-border)",
              color: days === option.value ? "white" : "var(--color-text)",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        className="mt-4 p-3 rounded-lg text-sm"
        style={{
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          color: "#B45309",
        }}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <div className="font-medium mb-1">注意</div>
            <div>
              超过保留时间的历史记录将被永久删除，无法恢复。建议保留至少30天以便查阅。
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
