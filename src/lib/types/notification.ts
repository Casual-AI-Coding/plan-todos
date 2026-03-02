/**
 * Notification Types
 *
 * Type definitions for Notification system.
 * Includes settings, reminders, and notification plugins.
 */

/**
 * NotificationSettings - 通知设置
 * Represents notification settings for a specific entity.
 */
export interface NotificationSettings {
  id: string;
  entity_type: string;
  entity_id: string;
  reminder_minutes: number;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * DailySummarySettings - 每日摘要设置
 * Represents settings for daily summary notifications.
 */
export interface DailySummarySettings {
  id: string;
  enabled: boolean;
  time: string;
  include_pending: boolean;
  include_overdue: boolean;
  include_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * DueReminder - 到期提醒
 * Represents a due reminder for an entity.
 */
export interface DueReminder {
  entity_type: string;
  entity_id: string;
  title: string;
  due_date: string;
  minutes_until_due: number;
}

/**
 * DailySummary - 每日摘要
 * Represents the daily summary data.
 */
export interface DailySummary {
  date: string;
  pending_count: number;
  overdue_count: number;
  completed_count: number;
  upcoming_count: number;
}

/**
 * NotificationPlugin - 通知插件
 * Represents an external notification channel plugin.
 */
export interface NotificationPlugin {
  id: string;
  name: string;
  plugin_type: string;
  enabled: boolean;
  config: string;
  created_at: string;
  updated_at: string;
}

/**
 * SendNotificationResult - 发送通知结果
 * Represents the result of sending a notification.
 */
export interface SendNotificationResult {
  success: boolean;
  message: string;
  external_id?: string;
}
