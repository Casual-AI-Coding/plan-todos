/**
 * Search API
 *
 * API functions for search functionality.
 */

import type { SearchResult } from "@/lib/types";
import { isTauri } from "./client";

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - search not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<SearchResult[]>("search_all", { query });
}
