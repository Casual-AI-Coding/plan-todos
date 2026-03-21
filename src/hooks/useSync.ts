import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type {
  SyncConfig,
  SyncStatus,
  SyncProgress,
  SyncResult,
  SyncLog,
  SyncConflict,
  DeviceInfo,
  UpdateSyncConfigParams,
  SchedulerStatus,
} from "@/lib/api/sync";
import {
  getSyncConfig,
  updateSyncConfig,
  getSyncStatus,
  getSyncProgress,
  triggerSync,
  getSyncLogs,
  getPendingChangesCount,
  testSyncConnection,
  saveSyncCredentials,
  getSyncUsername,
  deleteSyncCredentials,
  hasSyncCredentials,
  getDevices,
  unregisterDevice,
  getConflicts,
  resolveConflict,
  getSchedulerStatus,
  startScheduler,
  stopScheduler,
  setSyncInterval,
  triggerBackgroundSync,
  resetCircuitBreaker,
} from "@/lib/api/sync";

// Query Keys
export const syncQueryKeys = {
  config: ["sync", "config"] as const,
  status: ["sync", "status"] as const,
  progress: ["sync", "progress"] as const,
  logs: ["sync", "logs"] as const,
  username: ["sync", "username"] as const,
  hasCredentials: ["sync", "hasCredentials"] as const,
  devices: ["sync", "devices"] as const,
  conflicts: ["sync", "conflicts"] as const,
  schedulerStatus: ["sync", "schedulerStatus"] as const,
};

// =============================================================================
// Configuration Hooks
// =============================================================================

/**
 * Get sync configuration
 */
export function useSyncConfig(
  options?: Omit<UseQueryOptions<SyncConfig, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<SyncConfig, Error>({
    queryKey: syncQueryKeys.config,
    queryFn: getSyncConfig,
    ...options,
  });
}

/**
 * Update sync configuration
 */
export function useUpdateSyncConfig(
  options?: Omit<
    UseMutationOptions<void, Error, UpdateSyncConfigParams>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateSyncConfigParams>({
    mutationFn: updateSyncConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.config });
    },
    ...options,
  });
}

// =============================================================================
// Status Hooks
// =============================================================================

/**
 * Get sync status
 */
export function useSyncStatus(
  options?: Omit<UseQueryOptions<SyncStatus, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<SyncStatus, Error>({
    queryKey: syncQueryKeys.status,
    queryFn: getSyncStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options,
  });
}

/**
 * Get real-time sync progress (atomic state)
 * Updates every second during sync operations
 */
export function useSyncProgress(
  options?: Omit<UseQueryOptions<SyncProgress, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<SyncProgress, Error>({
    queryKey: syncQueryKeys.progress,
    queryFn: getSyncProgress,
    refetchInterval: 1000, // Refetch every second for real-time updates
    staleTime: 500, // Consider stale after 500ms
    ...options,
  });
}

/**
 * Get pending changes count
 */
export function usePendingChangesCount(
  options?: Omit<UseQueryOptions<number, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<number, Error>({
    queryKey: ["sync", "pendingChanges"],
    queryFn: getPendingChangesCount,
    ...options,
  });
}

/**
 * Trigger manual sync
 */
export function useTriggerSync(
  options?: Omit<UseMutationOptions<SyncResult, Error, void>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<SyncResult, Error, void>({
    mutationFn: triggerSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.status });
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.logs });
    },
    ...options,
  });
}

// =============================================================================
// Logs Hooks
// =============================================================================

export interface UseSyncLogsParams {
  limit?: number;
  offset?: number;
}

/**
 * Get sync logs
 */
export function useSyncLogs(
  params?: UseSyncLogsParams,
  options?: Omit<UseQueryOptions<SyncLog[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<SyncLog[], Error>({
    queryKey: [...syncQueryKeys.logs, params],
    queryFn: () => getSyncLogs(params),
    ...options,
  });
}

// =============================================================================
// Credential Hooks
// =============================================================================

/**
 * Test sync connection
 */
export function useTestSyncConnection(
  options?: Omit<
    UseMutationOptions<boolean, Error, TestConnectionInput>,
    "mutationFn"
  >,
) {
  return useMutation<boolean, Error, TestConnectionInput>({
    mutationFn: ({ serverUrl, username, password }) =>
      testSyncConnection(serverUrl, username, password),
    ...options,
  });
}

export interface TestConnectionInput {
  serverUrl: string;
  username: string;
  password: string;
}

/**
 * Save sync credentials
 */
export function useSaveSyncCredentials(
  options?: Omit<
    UseMutationOptions<void, Error, SaveCredentialsInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SaveCredentialsInput>({
    mutationFn: ({ username, password }) =>
      saveSyncCredentials(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.hasCredentials });
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.username });
    },
    ...options,
  });
}

export interface SaveCredentialsInput {
  username: string;
  password: string;
}

/**
 * Get sync username
 */
export function useSyncUsername(
  options?: Omit<UseQueryOptions<string | null, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<string | null, Error>({
    queryKey: syncQueryKeys.username,
    queryFn: getSyncUsername,
    ...options,
  });
}

/**
 * Delete sync credentials
 */
export function useDeleteSyncCredentials(
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: deleteSyncCredentials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.hasCredentials });
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.username });
    },
    ...options,
  });
}

/**
 * Check if sync credentials are stored
 */
export function useHasSyncCredentials(
  options?: Omit<UseQueryOptions<boolean, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<boolean, Error>({
    queryKey: syncQueryKeys.hasCredentials,
    queryFn: hasSyncCredentials,
    ...options,
  });
}

// =============================================================================
// Device Hooks
// =============================================================================

/**
 * Get list of devices
 */
export function useDevices(
  options?: Omit<UseQueryOptions<DeviceInfo[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<DeviceInfo[], Error>({
    queryKey: syncQueryKeys.devices,
    queryFn: getDevices,
    ...options,
  });
}

/**
 * Unregister a device
 */
export function useUnregisterDevice(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: unregisterDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.devices });
    },
    ...options,
  });
}

// =============================================================================
// Conflict Hooks
// =============================================================================

/**
 * Get list of conflicts
 */
export function useConflicts(
  options?: Omit<
    UseQueryOptions<SyncConflict[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<SyncConflict[], Error>({
    queryKey: syncQueryKeys.conflicts,
    queryFn: getConflicts,
    ...options,
  });
}

export interface ResolveConflictInput {
  conflictId: number;
  resolution: "local" | "remote" | "merge";
  mergedData?: unknown;
}

/**
 * Resolve a conflict
 */
export function useResolveConflict(
  options?: Omit<
    UseMutationOptions<void, Error, ResolveConflictInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ResolveConflictInput>({
    mutationFn: ({ conflictId, resolution, mergedData }) =>
      resolveConflict(conflictId, resolution, mergedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.conflicts });
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.status });
    },
    ...options,
  });
}

// =============================================================================
// Scheduler Hooks (Phase 6 - Wave 7)
// =============================================================================

/**
 * Get scheduler status
 */
export function useSchedulerStatus(
  options?: Omit<
    UseQueryOptions<SchedulerStatus, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<SchedulerStatus, Error>({
    queryKey: syncQueryKeys.schedulerStatus,
    queryFn: getSchedulerStatus,
    refetchInterval: 10000, // Refetch every 10 seconds
    ...options,
  });
}

/**
 * Start the scheduler
 */
export function useStartScheduler(
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: startScheduler,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: syncQueryKeys.schedulerStatus,
      });
    },
    ...options,
  });
}

/**
 * Stop the scheduler
 */
export function useStopScheduler(
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: stopScheduler,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: syncQueryKeys.schedulerStatus,
      });
    },
    ...options,
  });
}

/**
 * Set sync interval
 */
export function useSetSyncInterval(
  options?: Omit<UseMutationOptions<void, Error, number>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: setSyncInterval,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: syncQueryKeys.schedulerStatus,
      });
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.config });
    },
    ...options,
  });
}

/**
 * Trigger background sync
 */
export function useTriggerBackgroundSync(
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: triggerBackgroundSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.status });
      queryClient.invalidateQueries({ queryKey: syncQueryKeys.logs });
    },
    ...options,
  });
}

/**
 * Reset circuit breaker
 */
export function useResetCircuitBreaker(
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: resetCircuitBreaker,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: syncQueryKeys.schedulerStatus,
      });
    },
    ...options,
  });
}
