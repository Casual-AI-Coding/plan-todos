/**
 * Notification APIs
 *
 * API functions for notification system.
 */

import type {
  NotificationSettings,
  NotificationHistory,
  NotificationHistoryFilters,
  DailySummarySettings,
  DueReminder,
  DailySummary,
  NotificationPlugin,
  SendNotificationResult,
  GlobalNotificationSettings,
  GlobalNotificationSettingsUpdate,
  CirculationNotificationSettings,
  CirculationNotificationSettingsInput,
  GlobalCirculationNotificationSettings,
  GlobalCirculationNotificationSettingsInput,
  CirculationWithNotificationSettings,
} from "@/lib/types";
import { withTauriError } from "./utils";

export async function getNotificationSettings(
  entityType: string,
  entityId: string,
): Promise<NotificationSettings | null> {
  return withTauriError("get notification settings", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<NotificationSettings | null>("get_notification_settings", {
      entityType,
      entityId,
    });
  });
}

export async function setNotificationSettings(
  entityType: string,
  entityId: string,
  reminderTimes: number[],
): Promise<NotificationSettings> {
  return withTauriError("set notification settings", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<NotificationSettings>("set_notification_settings", {
      entityType,
      entityId,
      reminderTimes,
    });
  });
}

export async function deleteNotificationSettings(
  entityType: string,
  entityId: string,
): Promise<boolean> {
  return withTauriError("delete notification settings", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<boolean>("delete_notification_settings", {
      entityType,
      entityId,
    });
  });
}

export async function getDailySummarySettings(): Promise<DailySummarySettings> {
  return withTauriError("get daily summary settings", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<DailySummarySettings>("get_daily_summary_settings");
  });
}

export async function updateDailySummarySettings(
  enabled: boolean,
  time: string,
  includePending: boolean,
  includeOverdue: boolean,
  includeCompleted: boolean,
): Promise<DailySummarySettings> {
  return withTauriError("update daily summary settings", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<DailySummarySettings>("update_daily_summary_settings", {
      enabled,
      time,
      includePending,
      includeOverdue,
      includeCompleted,
    });
  });
}

export async function getDueReminders(): Promise<DueReminder[]> {
  return withTauriError("get due reminders", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<DueReminder[]>("get_due_reminders");
  });
}

export async function markReminderSent(
  entityType: string,
  entityId: string,
): Promise<boolean> {
  return withTauriError("mark reminder sent", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<boolean>("mark_reminder_sent", {
      entityType,
      entityId,
    });
  });
}

export async function getDailySummary(date?: string): Promise<DailySummary> {
  return withTauriError("get daily summary", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<DailySummary>("get_daily_summary", { date });
  });
}

export async function getNotificationHistory(
  filters?: NotificationHistoryFilters,
): Promise<NotificationHistory[]> {
  return withTauriError("get notification history", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<NotificationHistory[]>("get_notification_history", {
      filters,
    });
  });
}

export async function getPendingNotifications(): Promise<
  NotificationHistory[]
> {
  return withTauriError("get pending notifications", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<NotificationHistory[]>("get_pending_notifications", {});
  });
}

// Global Notification Settings APIs

export async function getGlobalNotificationSettings(): Promise<GlobalNotificationSettings> {
  return withTauriError("get global notification settings", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<GlobalNotificationSettings>(
      "get_global_notification_settings",
    );
  });
}

export async function updateGlobalNotificationSettings(
  settings: GlobalNotificationSettingsUpdate,
): Promise<GlobalNotificationSettings> {
  return withTauriError("update global notification settings", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<GlobalNotificationSettings>(
      "update_global_notification_settings",
      { settings },
    );
  });
}

export async function resetGlobalNotificationSettings(): Promise<GlobalNotificationSettings> {
  return withTauriError("reset global notification settings", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<GlobalNotificationSettings>(
      "reset_global_notification_settings",
    );
  });
}

// Notification Plugin APIs

export async function getNotificationPlugins(): Promise<NotificationPlugin[]> {
  return withTauriError("get notification plugins", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<NotificationPlugin[]>("get_notification_plugins");
  });
}

export async function createNotificationPlugin(
  name: string,
  pluginType: string,
  config: string,
): Promise<NotificationPlugin> {
  return withTauriError("create notification plugin", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<NotificationPlugin>("create_notification_plugin", {
      name,
      pluginType,
      config,
    });
  });
}

export async function updateNotificationPlugin(
  id: string,
  name: string,
  enabled: boolean,
  config: string,
): Promise<NotificationPlugin> {
  return withTauriError("update notification plugin", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<NotificationPlugin>("update_notification_plugin", {
      id,
      name,
      enabled,
      config,
    });
  });
}

export async function deleteNotificationPlugin(id: string): Promise<boolean> {
  return withTauriError("delete notification plugin", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<boolean>("delete_notification_plugin", { id });
  });
}

export async function sendNotification(
  pluginId: string,
  title: string,
  message: string,
): Promise<SendNotificationResult> {
  return withTauriError("send notification", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<SendNotificationResult>("send_notification", {
      pluginId,
      title,
      message,
    });
  });
}

// ========== Circulation Notification Settings APIs ==========

export async function getCirculationNotificationSettings(
  circulationId: string,
): Promise<CirculationNotificationSettings | null> {
  return withTauriError("get circulation notification settings", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<CirculationNotificationSettings | null>(
      "get_circulation_notification_settings",
      { circulationId },
    );
  });
}

export async function updateCirculationNotificationSettings(
  circulationId: string,
  input: CirculationNotificationSettingsInput,
): Promise<CirculationNotificationSettings> {
  return withTauriError(
    "update circulation notification settings",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<CirculationNotificationSettings>(
        "update_circulation_notification_settings",
        { circulationId, input },
      );
    },
  );
}

export async function deleteCirculationNotificationSettings(
  circulationId: string,
): Promise<boolean> {
  return withTauriError(
    "delete circulation notification settings",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<boolean>("delete_circulation_notification_settings", {
        circulationId,
      });
    },
  );
}

export async function getGlobalCirculationNotificationSettings(): Promise<GlobalCirculationNotificationSettings> {
  return withTauriError(
    "get global circulation notification settings",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<GlobalCirculationNotificationSettings>(
        "get_global_circulation_notification_settings",
      );
    },
  );
}

export async function updateGlobalCirculationNotificationSettings(
  input: GlobalCirculationNotificationSettingsInput,
): Promise<GlobalCirculationNotificationSettings> {
  return withTauriError(
    "update global circulation notification settings",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<GlobalCirculationNotificationSettings>(
        "update_global_circulation_notification_settings",
        { input },
      );
    },
  );
}

export async function getCirculationsWithNotificationSettings(): Promise<
  CirculationWithNotificationSettings[]
> {
  return withTauriError(
    "get circulations with notification settings",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<CirculationWithNotificationSettings[]>(
        "get_circulations_with_notification_settings",
      );
    },
  );
}

/**
 * Send a test notification
 * Uses the first available notification plugin to verify the system is working
 */
export async function sendTestNotification(): Promise<void> {
  return withTauriError("send test notification", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("send_test_notification");
  });
}
