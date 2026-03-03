/**
 * Search API
 *
 * API functions for search functionality.
 */

import type { SearchResult } from "@/lib/types";
import { withTauriFallback } from "./utils";

export async function searchAll(query: string): Promise<SearchResult[]> {
  return withTauriFallback(
    "search",
    async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<SearchResult[]>("search_all", { query });
    },
    [],
    "Running outside Tauri - search not available",
  );
}
