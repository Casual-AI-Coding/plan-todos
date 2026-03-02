/**
 * Export/Import Types
 *
 * Type definitions for data export and import functionality.
 */

import type { ImportMode } from "./common";
import type { Todo } from "./todo";
import type { Task } from "./task";
import type { Plan } from "./plan";
import type { Target } from "./target";
import type { Step } from "./step";
import type { Milestone } from "./milestone";
import type { Tag } from "./tag";
import type { DailySummarySettings, NotificationPlugin } from "./notification";

/**
 * ExportData - 导出数据
 * Represents the complete exported data structure.
 */
export interface ExportData {
  version: string;
  exported_at: string;
  data: {
    todos: Todo[];
    tasks: Task[];
    plans: Plan[];
    targets: Target[];
    steps: Step[];
    milestones: Milestone[];
    tags: Tag[];
    entity_tags: Array<{
      entity_type: string;
      entity_id: string;
      tag_id: string;
    }>;
    settings: {
      daily_summary_settings: DailySummarySettings | null;
      notification_plugins: NotificationPlugin[];
    };
  };
}

/**
 * ImportResult - 导入结果
 * Represents the result of an import operation.
 */
export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

// Re-export ImportMode for convenience
export type { ImportMode };
