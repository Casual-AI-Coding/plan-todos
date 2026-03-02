/**
 * Export/Import APIs
 *
 * API functions for data export and import.
 */

import type { ExportData, ImportResult, ImportMode } from "@/lib/types";
import { isTauri } from "./client";

export async function exportData(): Promise<ExportData> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to export data");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<ExportData>("export_data");
}

export async function importData(
  data: ExportData,
  mode: ImportMode,
): Promise<ImportResult> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to import data");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<ImportResult>("import_data", { data, mode });
}
