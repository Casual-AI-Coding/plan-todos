/**
 * Sync APIs
 *
 * API functions for cloud sync (WebDAV) functionality.
 */

import { invoke, withTauriError } from "./utils";

// ============================================================================
// Types
// ============================================================================

export interface SyncConfig {
  id: string;
  enabled: boolean;
  provider_type: string;
  server_url: string | null;
  username: string | null;
  password_encrypted: string | null;
  remote_path: string;
  sync_interval_minutes: number;
  conflict_strategy: string;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  enabled: boolean;
  is_syncing: boolean;
  last_sync_at: string | null;
  last_sync_status: string | null;
  pending_changes: number;
  conflicts_count: number;
}

/**
 * Real-time atomic sync progress status
 * Updated during sync operations
 */
export type SyncProgress =
  | { type: "idle" }
  | { type: "syncing"; progress: number }
  | { type: "error"; message: string };

/**
 * Sync result returned after trigger_sync
 */
export interface SyncResult {
  uploaded: number;
  downloaded: number;
  conflicts: number;
  duration_ms: number;
}

export interface SyncLog {
  id: number;
  started_at: string;
  completed_at: string | null;
  status: string;
  entities_uploaded: number;
  entities_downloaded: number;
  conflicts_count: number;
  error_message: string | null;
  duration_ms: number | null;
}

export interface SyncConflict {
  id: number;
  entity_type: string;
  entity_id: string;
  local_version: unknown;
  remote_version: unknown;
  local_modified_at: string;
  remote_modified_at: string | null;
}

export interface DeviceInfo {
  device_id: string;
  device_name: string;
  is_current_device: boolean;
  last_seen_at: string;
  created_at: string;
}

// ============================================================================
// Configuration APIs
// ============================================================================

export async function getSyncConfig(): Promise<SyncConfig> {
  return withTauriError("获取同步配置", async () => {
    return invoke<SyncConfig>("get_sync_config");
  });
}

export interface UpdateSyncConfigParams {
  enabled?: boolean;
  server_url?: string;
  username?: string;
  remote_path?: string;
  sync_interval_minutes?: number;
  conflict_strategy?: string;
}

export async function updateSyncConfig(
  params: UpdateSyncConfigParams,
): Promise<void> {
  return withTauriError("更新同步配置", async () => {
    return invoke<void>("update_sync_config", {
      enabled: params.enabled,
      serverUrl: params.server_url,
      username: params.username,
      remotePath: params.remote_path,
      syncIntervalMinutes: params.sync_interval_minutes,
      conflictStrategy: params.conflict_strategy,
    });
  });
}

// ============================================================================
// Credential APIs
// ============================================================================

export async function testSyncConnection(
  serverUrl: string,
  username: string,
  password: string,
): Promise<boolean> {
  return withTauriError("测试同步连接", async () => {
    return invoke<boolean>("test_sync_connection", {
      serverUrl,
      username,
      password,
    });
  });
}

export async function saveSyncCredentials(
  username: string,
  password: string,
): Promise<void> {
  return withTauriError("保存同步凭据", async () => {
    return invoke<void>("save_sync_credentials", {
      username,
      password,
    });
  });
}

export async function getSyncUsername(): Promise<string | null> {
  return withTauriError("获取同步用户名", async () => {
    return invoke<string | null>("get_sync_username");
  });
}

export async function deleteSyncCredentials(): Promise<void> {
  return withTauriError("删除同步凭据", async () => {
    return invoke<void>("delete_sync_credentials");
  });
}

export async function hasSyncCredentials(): Promise<boolean> {
  return withTauriError("检查同步凭据", async () => {
    return invoke<boolean>("has_sync_credentials");
  });
}

// ============================================================================
// Sync Operations APIs
// ============================================================================

export async function getSyncStatus(): Promise<SyncStatus> {
  return withTauriError("获取同步状态", async () => {
    return invoke<SyncStatus>("get_sync_status");
  });
}

/**
 * Get real-time sync progress (atomic state)
 * Returns current sync state: idle, syncing with progress, or error
 */
export async function getSyncProgress(): Promise<SyncProgress> {
  return withTauriError("获取同步进度", async () => {
    return invoke<SyncProgress>("get_sync_progress");
  });
}

export async function triggerSync(): Promise<SyncResult> {
  return withTauriError("触发同步", async () => {
    return invoke<SyncResult>("trigger_sync");
  });
}

export async function getPendingChangesCount(): Promise<number> {
  return withTauriError("获取待同步数量", async () => {
    return invoke<number>("get_pending_changes_count");
  });
}

export interface GetSyncLogsParams {
  limit?: number;
  offset?: number;
}

export async function getSyncLogs(
  params?: GetSyncLogsParams,
): Promise<SyncLog[]> {
  return withTauriError("获取同步日志", async () => {
    return invoke<SyncLog[]>("get_sync_logs", {
      limit: params?.limit,
      offset: params?.offset,
    });
  });
}

// ============================================================================
// Device APIs
// ============================================================================

export async function getDevices(): Promise<DeviceInfo[]> {
  return withTauriError("获取设备列表", async () => {
    return invoke<DeviceInfo[]>("get_devices");
  });
}

export async function unregisterDevice(deviceId: string): Promise<void> {
  return withTauriError("注销设备", async () => {
    return invoke<void>("unregister_device", { deviceId });
  });
}

// ============================================================================
// Conflict APIs
// ============================================================================

export async function getConflicts(): Promise<SyncConflict[]> {
  return withTauriError("获取冲突列表", async () => {
    return invoke<SyncConflict[]>("get_conflicts");
  });
}

export async function resolveConflict(
  conflictId: number,
  resolution: "local" | "remote" | "merge",
  mergedData?: unknown,
): Promise<void> {
  return withTauriError("解决冲突", async () => {
    return invoke<void>("resolve_conflict", {
      conflictId,
      resolution,
      mergedData,
    });
  });
}

// ============================================================================
// Scheduler APIs (Phase 6 - Wave 7)
// ============================================================================

export interface SchedulerStatus {
  is_running: boolean;
  interval_minutes: number;
  circuit_breaker_closed: boolean;
  failure_count: number;
}

export async function getSchedulerStatus(): Promise<SchedulerStatus> {
  return withTauriError("获取调度器状态", async () => {
    return invoke<SchedulerStatus>("get_scheduler_status");
  });
}

export async function startScheduler(): Promise<void> {
  return withTauriError("启动调度器", async () => {
    return invoke<void>("start_scheduler");
  });
}

export async function stopScheduler(): Promise<void> {
  return withTauriError("停止调度器", async () => {
    return invoke<void>("stop_scheduler");
  });
}

export async function setSyncInterval(minutes: number): Promise<void> {
  return withTauriError("设置同步间隔", async () => {
    return invoke<void>("set_sync_interval", { minutes });
  });
}

export async function triggerBackgroundSync(): Promise<void> {
  return withTauriError("触发后台同步", async () => {
    return invoke<void>("trigger_background_sync");
  });
}

export async function resetCircuitBreaker(): Promise<void> {
  return withTauriError("重置熔断器", async () => {
    return invoke<void>("reset_circuit_breaker");
  });
}
