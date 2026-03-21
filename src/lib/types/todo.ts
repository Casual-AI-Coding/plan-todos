/**
 * Todo Types
 *
 * Type definitions for Todo entity.
 * Todos are short-term items for daily task management.
 */

import type { Priority } from "./common";
import type { Tag } from "./tag";

/**
 * Recurrence configuration for recurring todos.
 */
export interface Recurrence {
  type: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday to Saturday (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly)
  endDate?: string; // ISO date string - recurrence ends after this date
  maxOccurrences?: number; // Maximum number of occurrences
}

/**
 * Todo - 短期事项
 * Represents a short-term todo item for daily management.
 */
export interface Todo {
  id: string;
  title: string;
  content: string | null;
  due_date: string | null;
  status: "pending" | "in-progress" | "done";
  priority: Priority;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  reminder_times?: number[]; // 提醒时间（分钟数数组）
  recurrence?: Recurrence; // JSON string of Recurrence config
  recurrence_from?: string; // Original todo ID for tracking chain
  recurrence_index?: number; // Current occurrence number
}

/**
 * Parameters for creating a new Todo.
 */
export interface CreateTodoParams {
  title: string;
  content?: string;
  due_date?: string;
  priority?: Priority;
  recurrence?: Recurrence;
  recurrence_from?: string;
  recurrence_index?: number;
}

/**
 * Parameters for updating an existing Todo.
 */
export interface UpdateTodoParams {
  title?: string;
  content?: string;
  due_date?: string;
  status?: "pending" | "in-progress" | "done";
  priority?: Priority;
  recurrence?: Recurrence;
  recurrence_from?: string;
  recurrence_index?: number;
}
