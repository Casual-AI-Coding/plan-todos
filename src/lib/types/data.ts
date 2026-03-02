/**
 * Data Management Types
 *
 * Type definitions for data seeding and reset operations.
 */

/**
 * SeedResult - 种子数据结果
 * Represents the result of seeding test data.
 */
export interface SeedResult {
  todos: number;
  plans: number;
  tasks: number;
  targets: number;
  steps: number;
  milestones: number;
  circulations: number;
  circulation_logs: number;
  tags: number;
}

/**
 * ResetOptions - 重置选项
 * Options for resetting the database.
 */
export interface ResetOptions {
  keep_tags?: boolean;
  keep_settings?: boolean;
}
