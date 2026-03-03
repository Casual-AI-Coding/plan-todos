/**
 * Statistics API
 *
 * API functions for statistics data.
 */

import type { Statistics } from "@/lib/types";
import { MOCK_STATISTICS_DATA } from "./constants";
import { isTauri } from "./client";

export async function getStatistics(): Promise<Statistics> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - returning mock data");
    return MOCK_STATISTICS_DATA;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Statistics>("get_statistics");
}
