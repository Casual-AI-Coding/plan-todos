/**
 * Data management types - Seed and reset operations
 */

/** Result of seeding test data */
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

/** Options for resetting data */
export interface ResetOptions {
  keep_tags?: boolean;
  keep_settings?: boolean;
}
