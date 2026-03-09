/**
 * Todo Types
 *
 * Type definitions for Todo entity.
 * Todos are short-term items for daily task management.
 */

import type { Priority } from "./common";
import type { Tag } from "./tag";

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
}

/**
 * Parameters for creating a new Todo.
 */
export interface CreateTodoParams {
  title: string;
  content?: string;
  due_date?: string;
  priority?: Priority;
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
}
