/**
 * Notification APIs
 *
 * API functions for notification system.
 */

import type {
  NotificationSettings,
  DailySummarySettings,
  DueReminder,
  DailySummary,
  NotificationPlugin,
  SendNotificationResult,
} from "@/lib/types";
import { isTauri } from "./client";

export async function getNotificationSettings(
  entityType: string,
  entityId: string,
): Promise<NotificationSettings | null> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<NotificationSettings | null>("get_notification_settings", {
    entityType,
    entityId,
  });
}

export async function setNotificationSettings(
  entityType: string,
  entityId: string,
  reminderMinutes: number,
): Promise<NotificationSettings> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<NotificationSettings>("set_notification_settings", {
    entityType,
    entityId,
    reminderMinutes,
  });
}

export async function deleteNotificationSettings(
  entityType: string,
  entityId: string,
): Promise<boolean> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<boolean>("delete_notification_settings", {
    entityType,
    entityId,
  });
}

export async function getDailySummarySettings(): Promise<DailySummarySettings> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DailySummarySettings>("get_daily_summary_settings");
}

export async function updateDailySummarySettings(
  enabled: boolean,
  time: string,
  includePending: boolean,
  includeOverdue: boolean,
  includeCompleted: boolean,
): Promise<DailySummarySettings> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DailySummarySettings>("update_daily_summary_settings", {
    enabled,
    time,
    includePending,
    includeOverdue,
    includeCompleted,
  });
}

export async function getDueReminders(): Promise<DueReminder[]> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DueReminder[]>("get_due_reminders");
}

export async function markReminderSent(
  entityType: string,
  entityId: string,
): Promise<boolean> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<boolean>("mark_reminder_sent", {
    entityType,
    entityId,
  });
}

export async function getDailySummary(): Promise<DailySummary> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<DailySummary>("get_daily_summary");
}

// Notification Plugin APIs

export async function getNotificationPlugins(): Promise<NotificationPlugin[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<NotificationPlugin[]>("get_notification_plugins");
}

export async function createNotificationPlugin(
  name: string,
  pluginType: string,
  config: string,
): Promise<NotificationPlugin> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<NotificationPlugin>("create_notification_plugin", {
    name,
    pluginType,
    config,
  });
}

export async function updateNotificationPlugin(
  id: string,
  name: string,
  enabled: boolean,
  config: string,
): Promise<NotificationPlugin> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<NotificationPlugin>("update_notification_plugin", {
    id,
    name,
    enabled,
    config,
  });
}

export async function deleteNotificationPlugin(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("delete_notification_plugin", { id });
}

export async function sendNotification(
  pluginId: string,
  title: string,
  content: string,
): Promise<SendNotificationResult> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<SendNotificationResult>("send_notification", {
    pluginId,
    title,
    content,
  });
}
