"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  GlobalTogglesSection,
  ReminderTimeSelector,
  EntityDefaultsCard,
  DoNotDisturbSection,
  ChannelPrioritySorter,
  RetentionSettings,
} from "./components/notifications";
import {
  useGlobalNotificationSettings,
  useUpdateGlobalNotificationSettings,
  useResetGlobalNotificationSettings,
} from "@/hooks/useGlobalNotificationSettings";
import type { GlobalNotificationSettings } from "@/lib/types";

export function SettingsNotificationsView() {
  // React Query hooks
  const { data: settings, isLoading } = useGlobalNotificationSettings();
  const updateSettings = useUpdateGlobalNotificationSettings();
  const resetSettings = useResetGlobalNotificationSettings();

  // Local state for editing - initialize lazily
  const [localSettings, setLocalSettings] =
    useState<GlobalNotificationSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with query data
  useEffect(() => {
    if (settings && localSettings === null) {
      // Use setTimeout to avoid synchronous setState during render
      const timer = setTimeout(() => {
        setLocalSettings(settings);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [settings, localSettings]);

  // Update helper
  const updateLocalSettings = (
    updates: Partial<GlobalNotificationSettings>,
  ) => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, ...updates });
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!localSettings) return;
    try {
      await updateSettings.mutateAsync(localSettings);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("保存失败，请重试");
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!confirm("确定要恢复默认设置吗？此操作不可撤销。")) return;
    try {
      const defaultSettings = await resetSettings.mutateAsync();
      setLocalSettings(defaultSettings);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to reset settings:", error);
      alert("重置失败，请重试");
    }
  };

  // Loading state
  if (isLoading || !localSettings) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold">通知设置</h2>
            <p className="text-sm text-gray-500 mt-1">
              管理通知偏好、提醒时间和勿扰模式
            </p>
          </div>
          <div className="flex gap-3">
            {hasChanges && (
              <Button
                variant="secondary"
                onClick={() => settings && setLocalSettings(settings)}
              >
                取消
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={resetSettings.isPending}
            >
              恢复默认
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateSettings.isPending}
            >
              {updateSettings.isPending ? "保存中..." : "保存更改"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl space-y-6">
            {/* Global Toggles */}
            <GlobalTogglesSection
              masterEnabled={localSettings.master_enabled}
              desktopEnabled={localSettings.desktop_enabled}
              soundEnabled={localSettings.sound_enabled}
              onMasterChange={(enabled) =>
                updateLocalSettings({ master_enabled: enabled })
              }
              onDesktopChange={(enabled) =>
                updateLocalSettings({ desktop_enabled: enabled })
              }
              onSoundChange={(enabled) =>
                updateLocalSettings({ sound_enabled: enabled })
              }
              disabled={updateSettings.isPending}
            />

            {/* Default Reminder Times */}
            <ReminderTimeSelector
              title="默认提醒时间"
              description="新任务创建时的默认提醒时间设置"
              selectedTimes={localSettings.default_reminder_times}
              onChange={(times) =>
                updateLocalSettings({ default_reminder_times: times })
              }
              disabled={
                !localSettings.master_enabled || updateSettings.isPending
              }
            />

            {/* Entity Type Defaults */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">各类型默认设置</h3>

              <EntityDefaultsCard
                title="待办事项 (Todo)"
                description="待办事项的默认通知设置"
                enabled={localSettings.todo_default_enabled}
                times={localSettings.todo_default_times}
                onEnabledChange={(enabled) =>
                  updateLocalSettings({ todo_default_enabled: enabled })
                }
                onTimesChange={(times) =>
                  updateLocalSettings({ todo_default_times: times })
                }
                disabled={
                  !localSettings.master_enabled || updateSettings.isPending
                }
              />

              <EntityDefaultsCard
                title="计划 (Plan)"
                description="计划的默认通知设置"
                enabled={localSettings.plan_default_enabled}
                times={localSettings.plan_default_times}
                onEnabledChange={(enabled) =>
                  updateLocalSettings({ plan_default_enabled: enabled })
                }
                onTimesChange={(times) =>
                  updateLocalSettings({ plan_default_times: times })
                }
                disabled={
                  !localSettings.master_enabled || updateSettings.isPending
                }
              />

              <EntityDefaultsCard
                title="目标 (Target)"
                description="目标的默认通知设置"
                enabled={localSettings.target_default_enabled}
                times={localSettings.target_default_times}
                onEnabledChange={(enabled) =>
                  updateLocalSettings({ target_default_enabled: enabled })
                }
                onTimesChange={(times) =>
                  updateLocalSettings({ target_default_times: times })
                }
                disabled={
                  !localSettings.master_enabled || updateSettings.isPending
                }
              />
            </div>

            {/* Do Not Disturb */}
            <DoNotDisturbSection
              enabled={localSettings.dnd_enabled}
              startTime={localSettings.dnd_start_time}
              endTime={localSettings.dnd_end_time}
              days={localSettings.dnd_days}
              onEnabledChange={(enabled) =>
                updateLocalSettings({ dnd_enabled: enabled })
              }
              onStartTimeChange={(time) =>
                updateLocalSettings({ dnd_start_time: time })
              }
              onEndTimeChange={(time) =>
                updateLocalSettings({ dnd_end_time: time })
              }
              onDaysChange={(days) => updateLocalSettings({ dnd_days: days })}
              disabled={
                !localSettings.master_enabled || updateSettings.isPending
              }
            />

            {/* Channel Priority */}
            <ChannelPrioritySorter
              priority={localSettings.channel_priority}
              onChange={(priority) =>
                updateLocalSettings({ channel_priority: priority })
              }
              disabled={
                !localSettings.master_enabled || updateSettings.isPending
              }
            />

            {/* Retention Settings */}
            <RetentionSettings
              retentionDays={localSettings.retention_days}
              onChange={(days) => updateLocalSettings({ retention_days: days })}
              disabled={updateSettings.isPending}
            />

            {/* Save Button at Bottom */}
            {hasChanges && (
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSave}
                  disabled={updateSettings.isPending}
                  size="lg"
                >
                  {updateSettings.isPending ? "保存中..." : "保存更改"}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </FadeIn>
  );
}
