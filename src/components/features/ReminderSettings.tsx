"use client";

import { useState, useMemo } from "react";
import { Bell, Clock } from "lucide-react";
import { Checkbox, Modal, Button, Input } from "@/components/ui";

const PRESET_TIMES = [
  { label: "5分钟", value: 5 },
  { label: "15分钟", value: 15 },
  { label: "30分钟", value: 30 },
  { label: "1小时", value: 60 },
  { label: "1天", value: 1440 },
] as const;

export interface ReminderSettingsProps {
  value: number[];
  onChange: (times: number[]) => void;
  compact?: boolean;
}

function formatTimeLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  if (minutes < 1440) {
    const hours = minutes / 60;
    return `${hours}小时`;
  }
  const days = minutes / 1440;
  return `${days}天`;
}

function isPresetTime(value: number): boolean {
  return PRESET_TIMES.some((preset) => preset.value === value);
}

export function ReminderSettings({
  value,
  onChange,
  compact = false,
}: ReminderSettingsProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTime, setCustomTime] = useState("");

  const customTimes = useMemo(
    () => value.filter((v) => !isPresetTime(v)),
    [value],
  );

  const presetValues = useMemo(
    () => value.filter((v) => isPresetTime(v)),
    [value],
  );

  const handleTogglePreset = (presetValue: number) => {
    if (presetValues.includes(presetValue)) {
      onChange(value.filter((v) => v !== presetValue));
    } else {
      onChange([...value, presetValue].sort((a, b) => a - b));
    }
  };

  const handleAddCustomTime = () => {
    const minutes = parseInt(customTime, 10);
    if (isNaN(minutes) || minutes <= 0) return;

    if (!value.includes(minutes)) {
      onChange([...value, minutes].sort((a, b) => a - b));
    }
    setCustomTime("");
    setShowCustomModal(false);
  };

  const handleRemoveCustomTime = (minutes: number) => {
    onChange(value.filter((v) => v !== minutes));
  };

  const selectedCount = value.length;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
        <span className="font-medium" style={{ color: "var(--color-text)" }}>
          提醒设置
        </span>
        {selectedCount > 0 && (
          <span
            className="ml-2 px-2 py-0.5 text-xs rounded-full"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text-inverse)",
            }}
          >
            {selectedCount}
          </span>
        )}
      </div>

      {/* Preset times */}
      <div>
        <span
          className="block text-sm mb-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          提前提醒时间
        </span>
        <div
          className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-2"}`}
        >
          {PRESET_TIMES.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handleTogglePreset(preset.value)}
              className={`
                flex items-center gap-2 px-3 py-2 
                rounded-lg border-2 transition-all
                text-sm text-left
                ${
                  presetValues.includes(preset.value)
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                }
              `}
              style={{
                color: presetValues.includes(preset.value)
                  ? "var(--color-primary)"
                  : "var(--color-text)",
              }}
            >
              <Checkbox
                checked={presetValues.includes(preset.value)}
                onChange={() => handleTogglePreset(preset.value)}
                className="pointer-events-none"
              />
              <span>{preset.label}</span>
            </button>
          ))}

          {/* Custom time button */}
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className={`
              flex items-center gap-2 px-3 py-2 
              rounded-lg border-2 border-dashed transition-all
              text-sm
              border-[var(--color-border)] hover:border-[var(--color-primary)]/50
            `}
            style={{ color: "var(--color-text-muted)" }}
          >
            <Clock className="w-4 h-4" />
            <span>自定义</span>
          </button>
        </div>
      </div>

      {/* Custom times display */}
      {customTimes.length > 0 && (
        <div>
          <span
            className="block text-sm mb-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            自定义时间
          </span>
          <div className="flex flex-wrap gap-2">
            {customTimes.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => handleRemoveCustomTime(minutes)}
                className="
                  flex items-center gap-1 px-3 py-1.5 
                  rounded-full text-sm
                  border transition-colors
                  hover:border-[var(--color-error)] hover:text-[var(--color-error)]
                "
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                <span>提前{formatTimeLabel(minutes)}</span>
                <span className="text-xs opacity-60">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom time modal */}
      <Modal
        open={showCustomModal}
        title="自定义提醒时间"
        onClose={() => {
          setShowCustomModal(false);
          setCustomTime("");
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCustomModal(false);
                setCustomTime("");
              }}
            >
              取消
            </Button>
            <Button onClick={handleAddCustomTime}>确定</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="提前时间"
            placeholder="输入分钟数"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            min={1}
          />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            例如：输入 10 表示提前 10 分钟提醒，输入 120 表示提前 2 小时提醒
          </p>
        </div>
      </Modal>
    </div>
  );
}
