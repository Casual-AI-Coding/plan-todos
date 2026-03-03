/**
 * Data Management APIs
 *
 * API functions for data seeding and reset operations.
 */

import type { SeedResult, ResetOptions } from "@/lib/types";
import { withTauriError } from "./utils";

export async function seedTestData(): Promise<SeedResult> {
  return withTauriError("seed test data", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<SeedResult>("seed_test_data");
  });
}

export async function resetData(options?: ResetOptions): Promise<void> {
  return withTauriError("reset data", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("reset_data", { options: options || null });
  });
}
