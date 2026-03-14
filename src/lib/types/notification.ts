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
  entity_type: "todo" | "plan" | "target";
  entity_id: string;
  reminder_times: number[];
  /** @deprecated Use reminder_times instead. This field is kept for backward compatibility. */
  reminder_minutes?: number;
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
  entity_type: "todo" | "plan" | "target";
  entity_id: string;
  title: string;
  due_date: string;
  reminder_times: number[];
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

/**
 * NotificationHistory - 通知历史记录
 * Represents notification history entries.
 */
export interface NotificationHistory {
  id: string;
  entity_type: "todo" | "plan" | "target";
  entity_id: string;
  title: string;
  message?: string;
  reminder_time?: number;
  scheduled_at: string;
  sent_at?: string;
  channel: string;
  status: "pending" | "sent" | "failed";
  error_message?: string;
  created_at: string;
}

/**
 * NotificationHistoryFilters - 通知历史过滤器
 * Filters for querying notification history.
 */
export interface NotificationHistoryFilters {
  status?: "pending" | "sent" | "failed";
  entity_type?: "todo" | "plan" | "target";
  start_date?: string;
  end_date?: string;
}

/**
 * GlobalNotificationSettings - 全局通知设置
 * Global notification configuration and defaults.
 */
export interface GlobalNotificationSettings {
  id: string;
  master_enabled: boolean;
  desktop_enabled: boolean;
  sound_enabled: boolean;
  default_reminder_times: number[];
  todo_default_enabled: boolean;
  todo_default_times: number[];
  plan_default_enabled: boolean;
  plan_default_times: number[];
  target_default_enabled: boolean;
  target_default_times: number[];
  dnd_enabled: boolean;
  dnd_start_time?: string;
  dnd_end_time?: string;
  dnd_days: number[];
  channel_priority: string[];
  retention_days: number;
  created_at: string;
  updated_at: string;
}

/**
 * GlobalNotificationSettingsUpdate - 全局通知设置更新
 * Partial type for updating global notification settings.
 */
export type GlobalNotificationSettingsUpdate = Omit<
  GlobalNotificationSettings,
  "id" | "created_at" | "updated_at"
>;

/**
 * ReminderTimeOption - 提醒时间选项
 * Standard reminder time options in minutes.
 */
export const REMINDER_TIME_OPTIONS = [
  { value: 5, label: "5分钟前" },
  { value: 15, label: "15分钟前" },
  { value: 30, label: "30分钟前" },
  { value: 60, label: "1小时前" },
  { value: 180, label: "3小时前" },
  { value: 360, label: "6小时前" },
  { value: 720, label: "12小时前" },
  { value: 1440, label: "1天前" },
  { value: 2880, label: "2天前" },
  { value: 10080, label: "1周前" },
] as const;

/**
 * WeekDay - 星期选项
 * Days of the week for Do Not Disturb scheduling.
 */
export const WEEK_DAYS = [
  { value: 0, label: "周日" },
  { value: 1, label: "周一" },
  { value: 2, label: "周二" },
  { value: 3, label: "周三" },
  { value: 4, label: "周四" },
  { value: 5, label: "周五" },
  { value: 6, label: "周六" },
] as const;

/**
 * ChannelType - 通知渠道类型
 * Available notification channel types.
 */
export const CHANNEL_TYPES = [
  { value: "desktop", label: "桌面通知", icon: "🖥️" },
  { value: "email", label: "邮件", icon: "📧" },
  { value: "webhook", label: "Webhook", icon: "🔗" },
  { value: "dingtalk", label: "钉钉", icon: "💬" },
  { value: "feishu", label: "飞书", icon: "🔔" },
] as const;
