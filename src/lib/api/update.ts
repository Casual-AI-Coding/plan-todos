import { invoke } from "@tauri-apps/api/core";

export interface UpdateInfo {
  has_update: boolean;
  current_version: string;
  latest_version: string;
  release_url: string;
  release_notes: string;
}

export async function checkForUpdates(): Promise<UpdateInfo | null> {
  return await invoke<UpdateInfo | null>("check_for_updates");
}

export async function skipVersion(version: string): Promise<void> {
  await invoke("skip_version", { version });
}
