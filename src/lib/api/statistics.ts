/**
 * Statistics API
 *
 * API functions for statistics data.
 */

import type { Statistics } from "@/lib/types";
import { withTauriError } from "./utils";

export async function getStatistics(): Promise<Statistics> {
  return withTauriError("get statistics", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Statistics>("get_statistics");
  });
}
