/**
 * Circulation Types
 *
 * Type definitions for Circulation (打卡) entity.
 * Circulations are habit tracking or count-based tracking items.
 */

import type { CirculationType, PeriodicFrequency } from "./common";

/**
 * Circulation - 打卡
 * Represents a circulation (habit tracking) item.
 */
export interface Circulation {
  id: string;
  title: string;
  content: string | null;
  circulation_type: CirculationType;
  frequency: PeriodicFrequency | null; // periodic only
  frequency_config: string | null; // JSON config
  target_count: number | null; // count only
  current_count: number;
  streak_count: number; // periodic only
  best_streak: number; // periodic only
  last_completed_at: string | null;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

/**
 * CirculationLog - 打卡记录
 * Represents a single check-in log for a circulation.
 */
export interface CirculationLog {
  id: string;
  circulation_id: string;
  completed_at: string;
  note: string | null;
  period: string | null; // "2024-W05" / "2024-02"
  count: number | null; // count for count-type circulation
}

/**
 * Parameters for creating a new Circulation.
 */
export interface CreateCirculationParams {
  title: string;
  circulation_type: CirculationType;
  frequency?: PeriodicFrequency;
  frequency_config?: string;
  target_count?: number;
}

/**
 * Parameters for updating an existing Circulation.
 */
export interface UpdateCirculationParams {
  title?: string;
  circulation_type?: CirculationType;
  frequency?: PeriodicFrequency;
  frequency_config?: string;
  target_count?: number;
  status?: "active" | "archived";
}
