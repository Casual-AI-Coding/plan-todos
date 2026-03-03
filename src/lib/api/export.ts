/**
 * Export/Import APIs
 *
 * API functions for data export and import.
 */

import type { ExportData, ImportResult, ImportMode } from "@/lib/types";
import { withTauriError } from "./utils";

export async function exportData(): Promise<ExportData> {
  return withTauriError("export data", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<ExportData>("export_data");
  });
}

export async function importData(
  data: ExportData,
  mode: ImportMode,
): Promise<ImportResult> {
  return withTauriError("import data", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<ImportResult>("import_data", { data, mode });
  });
}
