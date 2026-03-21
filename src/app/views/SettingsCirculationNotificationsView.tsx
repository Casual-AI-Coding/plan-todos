"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input, Checkbox } from "@/components/ui";
import {
  useGlobalCirculationNotificationSettings,
  useUpdateGlobalCirculationNotificationSettings,
  useCirculationsWithNotificationSettings,
  useUpdateCirculationNotificationSettings,
} from "@/hooks/useCirculationNotifications";

const REMINDER_TYPE_OPTIONS = [
  { value: "fixed", label: "固定时间提醒" },
  { value: "before", label: "提前提醒" },
  { value: "achievement", label: "成就通知" },
];

const BEFORE_MINUTE_OPTIONS = [
  { value: 5, label: "5 分钟" },
  { value: 15, label: "15 分钟" },
  { value: 30, label: "30 分钟" },
  { value: 60, label: "1 小时" },
];

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function SettingsCirculationNotificationsView() {
  // Global settings
  const { data: globalSettings, isLoading: globalLoading } =
    useGlobalCirculationNotificationSettings();
  const updateGlobalSettings = useUpdateGlobalCirculationNotificationSettings();

  // Per-circulation settings
  const { data: circulations, isLoading: circulationsLoading } =
    useCirculationsWithNotificationSettings();
  const updateCirculationSettings = useUpdateCirculationNotificationSettings();

  // Local state for global settings
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [defaultReminderType, setDefaultReminderType] = useState("fixed");
  const [defaultFixedTime, setDefaultFixedTime] = useState("09:00");
  const [defaultBeforeMinutes, setDefaultBeforeMinutes] = useState(15);
  const [achievementEnabled, setAchievementEnabled] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndStartTime, setDndStartTime] = useState("22:00");
  const [dndEndTime, setDndEndTime] = useState("08:00");
  const [initialized, setInitialized] = useState(false);

  // Sync with server data
  /* eslint-disable */
  useEffect(() => {
    if (globalSettings && !initialized) {
      setMasterEnabled(globalSettings.master_enabled);
      setDefaultReminderType(globalSettings.default_reminder_type);
      setDefaultFixedTime(globalSettings.default_fixed_time);
      setDefaultBeforeMinutes(globalSettings.default_before_minutes);
      setAchievementEnabled(globalSettings.achievement_notifications);
      setDndEnabled(globalSettings.dnd_enabled);
      setDndStartTime(globalSettings.dnd_start_time);
      setDndEndTime(globalSettings.dnd_end_time);
      setInitialized(true);
    }
  }, [globalSettings, initialized]);
  /* eslint-enable */

  const handleSaveGlobal = async () => {
    try {
      await updateGlobalSettings.mutateAsync({
        master_enabled: masterEnabled,
        default_reminder_type: defaultReminderType,
        default_fixed_time: defaultFixedTime,
        default_before_minutes: defaultBeforeMinutes,
        achievement_notifications: achievementEnabled,
        dnd_enabled: dndEnabled,
        dnd_start_time: dndStartTime,
        dnd_end_time: dndEndTime,
      });
      alert("全局设置已保存");
    } catch (error) {
      alert("保存失败: " + (error as Error).message);
    }
  };

  const handleToggleCirculationNotification = async (
    circulationId: string,
    enabled: boolean,
  ) => {
    try {
      await updateCirculationSettings.mutateAsync({
        circulationId,
        input: { enabled },
      });
    } catch (error) {
      alert("更新失败: " + (error as Error).message);
    }
  };

  const handleReminderTypeChange = async (
    circulationId: string,
    reminderType: string,
  ) => {
    try {
      await updateCirculationSettings.mutateAsync({
        circulationId,
        input: {
          reminder_type: reminderType as "fixed" | "before" | "achievement",
        },
      });
    } catch (error) {
      alert("更新失败: " + (error as Error).message);
    }
  };

  if (globalLoading || circulationsLoading) {
    return (
      <div className="p-4">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h2
        className="text-xl font-semibold"
        style={{ color: "var(--color-text)" }}
      >
        通知 &gt; 打卡通知
      </h2>

      {/* Global Settings Card */}
      <Card className="p-4 space-y-4">
        <h3
          className="text-lg font-medium"
          style={{ color: "var(--color-text)" }}
        >
          全局设置
        </h3>

        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <span style={{ color: "var(--color-text)" }}>启用打卡通知</span>
          <ToggleSwitch checked={masterEnabled} onChange={setMasterEnabled} />
        </div>

        {/* Default Reminder Type */}
        <div className="space-y-2">
          <label style={{ color: "var(--color-text)" }}>默认提醒类型</label>
          <select
            className="w-full p-2 border rounded"
            value={defaultReminderType}
            onChange={(e) => setDefaultReminderType(e.target.value)}
            disabled={!masterEnabled}
          >
            {REMINDER_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fixed Time */}
        {defaultReminderType === "fixed" && (
          <div className="space-y-2">
            <label style={{ color: "var(--color-text)" }}>固定提醒时间</label>
            <Input
              type="time"
              value={defaultFixedTime}
              onChange={(e) => setDefaultFixedTime(e.target.value)}
              disabled={!masterEnabled}
            />
          </div>
        )}

        {/* Before Minutes */}
        {defaultReminderType === "before" && (
          <div className="space-y-2">
            <label style={{ color: "var(--color-text)" }}>提前提醒</label>
            <select
              className="w-full p-2 border rounded"
              value={defaultBeforeMinutes}
              onChange={(e) => setDefaultBeforeMinutes(Number(e.target.value))}
              disabled={!masterEnabled}
            >
              {BEFORE_MINUTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Achievement Notifications */}
        <div className="flex items-center justify-between">
          <span style={{ color: "var(--color-text)" }}>成就通知</span>
          <ToggleSwitch
            checked={achievementEnabled}
            onChange={setAchievementEnabled}
            disabled={!masterEnabled}
          />
        </div>

        {/* DND Settings */}
        <div className="flex items-center justify-between">
          <span style={{ color: "var(--color-text)" }}>免打扰模式</span>
          <ToggleSwitch
            checked={dndEnabled}
            onChange={setDndEnabled}
            disabled={!masterEnabled}
          />
        </div>

        {dndEnabled && (
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label style={{ color: "var(--color-text)" }}>开始时间</label>
              <Input
                type="time"
                value={dndStartTime}
                onChange={(e) => setDndStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label style={{ color: "var(--color-text)" }}>结束时间</label>
              <Input
                type="time"
                value={dndEndTime}
                onChange={(e) => setDndEndTime(e.target.value)}
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleSaveGlobal}
          disabled={updateGlobalSettings.isPending}
        >
          {updateGlobalSettings.isPending ? "保存中..." : "保存全局设置"}
        </Button>
      </Card>

      {/* Per-Circulation Settings */}
      <Card className="p-4 space-y-4">
        <h3
          className="text-lg font-medium"
          style={{ color: "var(--color-text)" }}
        >
          打卡项通知设置
        </h3>

        {circulations && circulations.length > 0 ? (
          <div className="space-y-3">
            {circulations.map((circ) => (
              <div
                key={circ.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <p
                    style={{ color: "var(--color-text)" }}
                    className="font-medium"
                  >
                    {circ.title}
                  </p>
                  <p
                    style={{ color: "var(--color-text-muted)" }}
                    className="text-sm"
                  >
                    {circ.circulation_type === "periodic"
                      ? `周期打卡 - ${circ.frequency || "daily"}`
                      : "计数打卡"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="p-2 border rounded text-sm"
                    value={circ.notification_settings?.reminder_type || "fixed"}
                    onChange={(e) =>
                      handleReminderTypeChange(circ.id, e.target.value)
                    }
                    disabled={!masterEnabled}
                  >
                    {REMINDER_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ToggleSwitch
                    checked={circ.notification_settings?.enabled ?? true}
                    onChange={(checked) =>
                      handleToggleCirculationNotification(circ.id, checked)
                    }
                    disabled={!masterEnabled}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--color-text-muted)" }}>
            暂无打卡项，请先创建打卡
          </p>
        )}
      </Card>
    </div>
  );
}
