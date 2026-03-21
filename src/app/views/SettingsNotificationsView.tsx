"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui";
import {
  useGlobalNotificationSettings,
  useUpdateGlobalNotificationSettings,
  useResetGlobalNotificationSettings,
} from "@/hooks/useGlobalNotificationSettings";

import { MasterToggle } from "./components/notifications/MasterToggle";
import { NotificationChannelsSection } from "./components/notifications/NotificationChannelsSection";
import { DefaultReminderSettings } from "./components/notifications/DefaultReminderSettings";
import { DoNotDisturbSettings } from "./components/notifications/DoNotDisturbSettings";
import { ChannelPrioritySettings } from "./components/notifications/ChannelPrioritySettings";
import { RetentionSettings } from "./components/notifications/RetentionSettings";

interface EntityReminderConfig {
  enabled: boolean;
  times: number[];
}

export function SettingsNotificationsView() {
  // React Query hooks
  const { data: settings, isLoading } = useGlobalNotificationSettings();
  const updateSettings = useUpdateGlobalNotificationSettings();
  const resetSettings = useResetGlobalNotificationSettings();

  // Initialize state with defaults
  const [masterEnabled, setMasterEnabled] = useState(false);
  const [desktopEnabled, setDesktopEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [todoConfig, setTodoConfig] = useState<EntityReminderConfig>({
    enabled: false,
    times: [15, 60],
  });
  const [planConfig, setPlanConfig] = useState<EntityReminderConfig>({
    enabled: false,
    times: [15, 60],
  });
  const [targetConfig, setTargetConfig] = useState<EntityReminderConfig>({
    enabled: false,
    times: [15, 60],
  });
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndStartTime, setDndStartTime] = useState("22:00");
  const [dndEndTime, setDndEndTime] = useState("08:00");
  const [dndDays, setDndDays] = useState<number[]>([0, 6]);
  const [channelPriority, setChannelPriority] = useState<string[]>([
    "desktop",
    "email",
    "webhook",
  ]);
  const [retentionDays, setRetentionDays] = useState(30);

  // Track if initial sync is done
  const [initialized, setInitialized] = useState(false);

  // Sync local state with server data (only once when settings load)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (settings && !initialized) {
      setMasterEnabled(settings.master_enabled);
      setDesktopEnabled(settings.desktop_enabled);
      setSoundEnabled(settings.sound_enabled);
      setTodoConfig({
        enabled: settings.todo_default_enabled,
        times: settings.todo_default_times,
      });
      setPlanConfig({
        enabled: settings.plan_default_enabled,
        times: settings.plan_default_times,
      });
      setTargetConfig({
        enabled: settings.target_default_enabled,
        times: settings.target_default_times,
      });
      setDndEnabled(settings.dnd_enabled);
      setDndStartTime(settings.dnd_start_time || "22:00");
      setDndEndTime(settings.dnd_end_time || "08:00");
      setDndDays(settings.dnd_days);
      setChannelPriority(settings.channel_priority);
      setRetentionDays(settings.retention_days);
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        master_enabled: masterEnabled,
        desktop_enabled: desktopEnabled,
        sound_enabled: soundEnabled,
        default_reminder_times: [],
        todo_default_enabled: todoConfig.enabled,
        todo_default_times: todoConfig.times,
        plan_default_enabled: planConfig.enabled,
        plan_default_times: planConfig.times,
        target_default_enabled: targetConfig.enabled,
        target_default_times: targetConfig.times,
        dnd_enabled: dndEnabled,
        dnd_start_time: dndStartTime,
        dnd_end_time: dndEndTime,
        dnd_days: dndDays,
        channel_priority: channelPriority,
        retention_days: retentionDays,
      });
      alert("设置已保存");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("保存失败: " + (error as Error).message);
    }
  };

  const handleReset = async () => {
    if (!confirm("确定要重置为默认设置吗？此操作不可撤销。")) {
      return;
    }
    try {
      await resetSettings.mutateAsync();
      alert("设置已重置为默认值");
    } catch (error) {
      console.error("Failed to reset settings:", error);
      alert("重置失败: " + (error as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ color: "var(--color-text)" }}
        >
          通知 &gt; 设置
        </h2>
        <div
          className="text-center py-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "var(--color-text)" }}
      >
        通知 &gt; 设置
      </h2>

      {/* Master Toggle */}
      <MasterToggle
        enabled={masterEnabled}
        onChange={setMasterEnabled}
        disabled={updateSettings.isPending}
      />

      {masterEnabled && (
        <>
          {/* Notification Channels */}
          <NotificationChannelsSection
            desktopEnabled={desktopEnabled}
            soundEnabled={soundEnabled}
            onDesktopChange={setDesktopEnabled}
            onSoundChange={setSoundEnabled}
            disabled={updateSettings.isPending}
          />

          {/* Default Reminder Settings */}
          <DefaultReminderSettings
            todoConfig={todoConfig}
            planConfig={planConfig}
            targetConfig={targetConfig}
            onTodoChange={setTodoConfig}
            onPlanChange={setPlanConfig}
            onTargetChange={setTargetConfig}
            disabled={updateSettings.isPending}
          />

          {/* Do Not Disturb */}
          <DoNotDisturbSettings
            enabled={dndEnabled}
            startTime={dndStartTime}
            endTime={dndEndTime}
            days={dndDays}
            onEnabledChange={setDndEnabled}
            onStartTimeChange={setDndStartTime}
            onEndTimeChange={setDndEndTime}
            onDaysChange={setDndDays}
            disabled={updateSettings.isPending}
          />

          {/* Channel Priority */}
          <ChannelPrioritySettings
            priority={channelPriority}
            onChange={setChannelPriority}
            disabled={updateSettings.isPending}
          />

          {/* Retention */}
          <RetentionSettings
            days={retentionDays}
            onChange={setRetentionDays}
            disabled={updateSettings.isPending}
          />
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          variant="primary"
        >
          {updateSettings.isPending ? "保存中..." : "保存设置"}
        </Button>
        <Button
          onClick={handleReset}
          disabled={resetSettings.isPending}
          variant="secondary"
        >
          {resetSettings.isPending ? "重置中..." : "恢复默认"}
        </Button>
      </div>

      {!masterEnabled && (
        <div
          className="mt-6 p-4 rounded-lg border"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            borderColor: "rgba(245, 158, 11, 0.3)",
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div style={{ color: "#B45309" }}>
              <div className="font-medium mb-1">通知已禁用</div>
              <div className="text-sm">
                开启通知后将启用待办、计划和目标的到期提醒功能
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
