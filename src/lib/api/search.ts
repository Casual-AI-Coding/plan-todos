/**
 * Search API
 *
 * API functions for search functionality.
 */

import type { SearchResult } from "@/lib/types";
import { withTauriError } from "./utils";

export async function searchAll(query: string): Promise<SearchResult[]> {
  return withTauriError("search", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<SearchResult[]>("search_all", { query });
  });
}
