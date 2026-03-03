/**
 * Statistics API
 *
 * API functions for statistics data.
 */

import type { Statistics } from "@/lib/types";
import { MOCK_STATISTICS_DATA } from "./constants";
import { withTauriFallback } from "./utils";

export async function getStatistics(): Promise<Statistics> {
  return withTauriFallback(
    "statistics",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<Statistics>("get_statistics");
    },
    MOCK_STATISTICS_DATA,
    "Running outside Tauri - returning mock data",
  );
}
