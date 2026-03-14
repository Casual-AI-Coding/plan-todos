"use client";

import { Card } from "@/components/ui";
import { REMINDER_TIME_OPTIONS } from "@/lib/types/notification";

interface EntityReminderConfig {
  enabled: boolean;
  times: number[];
}

interface DefaultReminderSettingsProps {
  todoConfig: EntityReminderConfig;
  planConfig: EntityReminderConfig;
  targetConfig: EntityReminderConfig;
  onTodoChange: (config: EntityReminderConfig) => void;
  onPlanChange: (config: EntityReminderConfig) => void;
  onTargetChange: (config: EntityReminderConfig) => void;
  disabled?: boolean;
}

const ENTITY_ICONS: Record<string, string> = {
  todo: "📝",
  plan: "📋",
  target: "🎯",
};

const ENTITY_LABELS: Record<string, string> = {
  todo: "待办事项",
  plan: "计划",
  target: "目标",
};

function ReminderTimeSelector({
  selectedTimes,
  onChange,
  disabled,
}: {
  selectedTimes: number[];
  onChange: (times: number[]) => void;
  disabled?: boolean;
}) {
  const toggleTime = (value: number) => {
    if (selectedTimes.includes(value)) {
      onChange(selectedTimes.filter((t) => t !== value));
    } else {
      onChange([...selectedTimes, value].sort((a, b) => b - a));
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {REMINDER_TIME_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => toggleTime(option.value)}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            selectedTimes.includes(option.value)
              ? "bg-teal-500 text-white border-teal-500"
              : "bg-transparent border-gray-300 hover:border-teal-300"
          }`}
          style={{
            color: selectedTimes.includes(option.value)
              ? "white"
              : "var(--color-text)",
            borderColor: selectedTimes.includes(option.value)
              ? "var(--color-primary)"
              : "var(--color-border)",
            backgroundColor: selectedTimes.includes(option.value)
              ? "var(--color-primary)"
              : "transparent",
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function EntityReminderRow({
  type,
  icon,
  label,
  config,
  onChange,
  disabled,
}: {
  type: string;
  icon: string;
  label: string;
  config: EntityReminderConfig;
  onChange: (config: EntityReminderConfig) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-hover)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-medium" style={{ color: "var(--color-text)" }}>
            {label}
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
            disabled={disabled}
            className="sr-only peer"
          />
          <div
            className="w-9 h-5 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"
            style={{
              backgroundColor: config.enabled
                ? "var(--color-primary)"
                : "var(--color-border)",
            }}
          />
        </label>
      </div>

      {config.enabled && (
        <div
          className="mt-3 pt-3 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="text-sm mb-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            默认提醒时间
          </div>
          <ReminderTimeSelector
            selectedTimes={config.times}
            onChange={(times) => onChange({ ...config, times })}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

export function DefaultReminderSettings({
  todoConfig,
  planConfig,
  targetConfig,
  onTodoChange,
  onPlanChange,
  onTargetChange,
  disabled,
}: DefaultReminderSettingsProps) {
  return (
    <Card className="mb-6">
      <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
        默认提醒设置
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
        为新创建的待办、计划和目标设置默认提醒时间
      </p>

      <div className="space-y-4">
        <EntityReminderRow
          type="todo"
          icon={ENTITY_ICONS.todo}
          label={ENTITY_LABELS.todo}
          config={todoConfig}
          onChange={onTodoChange}
          disabled={disabled}
        />
        <EntityReminderRow
          type="plan"
          icon={ENTITY_ICONS.plan}
          label={ENTITY_LABELS.plan}
          config={planConfig}
          onChange={onPlanChange}
          disabled={disabled}
        />
        <EntityReminderRow
          type="target"
          icon={ENTITY_ICONS.target}
          label={ENTITY_LABELS.target}
          config={targetConfig}
          onChange={onTargetChange}
          disabled={disabled}
        />
      </div>
    </Card>
  );
}
