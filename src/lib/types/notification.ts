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
  reminder_minutes?: number; // Legacy field
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
 * PaginationParams - 分页参数
 * Parameters for paginated queries.
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * PaginatedResult<T> - 分页结果
 * Generic paginated result wrapper.
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
