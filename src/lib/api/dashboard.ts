/**
 * Dashboard API
 *
 * API functions for dashboard data.
 */

import type { Dashboard } from "@/lib/types";
import { withTauriError } from "./utils";

export async function getDashboard(): Promise<Dashboard> {
  return withTauriError("get dashboard", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Dashboard>("get_dashboard");
  });
}
