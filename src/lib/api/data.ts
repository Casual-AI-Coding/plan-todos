/**
 * Data Management APIs
 *
 * API functions for data seeding and reset operations.
 */

import type { SeedResult, ResetOptions } from "@/lib/types";
import { isTauri } from "./client";

export async function seedTestData(): Promise<SeedResult> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to seed test data");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<SeedResult>("seed_test_data");
}

export async function resetData(options?: ResetOptions): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to reset data");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("reset_data", { options: options || null });
}
