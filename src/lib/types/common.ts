/**
 * Common Types
 *
 * Shared type definitions used across multiple entities.
 * Includes Priority, EntityType, CirculationType, PeriodicFrequency, and ImportMode.
 */

/**
 * Priority levels for tasks and todos.
 * P0 is highest priority, P3 is lowest.
 */
export type Priority = "P0" | "P1" | "P2" | "P3";

/**
 * Entity types that can be tagged.
 */
export type EntityType = "todo" | "plan" | "target";

/**
 * Type of circulation (打卡).
 * - "periodic": Recurring on a schedule (daily/weekly/monthly)
 * - "count": Complete a specific number of times
 */
export type CirculationType = "periodic" | "count";

/**
 * Frequency for periodic circulations.
 */
export type PeriodicFrequency = "daily" | "weekly" | "monthly";

/**
 * Import mode for data import operations.
 * - "merge": Add new data, skip existing
 * - "replace": Replace all existing data
 * - "update": Update existing data, add new
 */
export type ImportMode = "merge" | "replace" | "update";
