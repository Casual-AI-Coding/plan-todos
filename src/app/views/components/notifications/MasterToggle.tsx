"use client";

import { Card } from "@/components/ui";

interface MasterToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export function MasterToggle({
  enabled,
  onChange,
  disabled,
}: MasterToggleProps) {
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="font-medium" style={{ color: "var(--color-text)" }}>
            启用通知
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            开启后将接收待办、计划和目标的到期提醒
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked)}
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
    </Card>
  );
}
