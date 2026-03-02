/**
 * Export/Import types - Data export and import operations
 */

import type { Todo } from "./todo";
import type { Task } from "./task";
import type { Plan } from "./plan";
import type { Target } from "./target";
import type { Step } from "./step";
import type { Milestone } from "./milestone";
import type { Tag } from "./tag";
import type { DailySummarySettings, NotificationPlugin } from "./notification";

/** Export data structure */
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

/** Result of importing data */
export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}
