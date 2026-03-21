 
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useSyncConfig,
  useUpdateSyncConfig,
  useSyncStatus,
  usePendingChangesCount,
  useTriggerSync,
  useSyncLogs,
  useTestSyncConnection,
  useSaveSyncCredentials,
  useSyncUsername,
  useDeleteSyncCredentials,
  useHasSyncCredentials,
  useDevices,
  useUnregisterDevice,
  useConflicts,
  useResolveConflict,
  useSchedulerStatus,
  useStartScheduler,
  useStopScheduler,
  useSetSyncInterval,
  useTriggerBackgroundSync,
  useResetCircuitBreaker,
  syncQueryKeys,
} from "@/hooks/useSync";
import type {
  SyncConfig,
  SyncStatus,
  SyncLog,
  SyncConflict,
  DeviceInfo,
  SchedulerStatus,
} from "@/lib/api/sync";

// Mock the API functions
vi.mock("@/lib/api/sync", () => ({
  getSyncConfig: vi.fn(),
  updateSyncConfig: vi.fn(),
  getSyncStatus: vi.fn(),
  triggerSync: vi.fn(),
  getPendingChangesCount: vi.fn(),
  getSyncLogs: vi.fn(),
  testSyncConnection: vi.fn(),
  saveSyncCredentials: vi.fn(),
  getSyncUsername: vi.fn(),
  deleteSyncCredentials: vi.fn(),
  hasSyncCredentials: vi.fn(),
  getDevices: vi.fn(),
  unregisterDevice: vi.fn(),
  getConflicts: vi.fn(),
  resolveConflict: vi.fn(),
  getSchedulerStatus: vi.fn(),
  startScheduler: vi.fn(),
  stopScheduler: vi.fn(),
  setSyncInterval: vi.fn(),
  triggerBackgroundSync: vi.fn(),
  resetCircuitBreaker: vi.fn(),
}));

import {
  getSyncConfig,
  updateSyncConfig,
  getSyncStatus,
  triggerSync,
  getPendingChangesCount,
  getSyncLogs,
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

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

// Create a wrapper for the test
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

// Mock data
const mockSyncConfig: SyncConfig = {
  id: "1",
  enabled: true,
  provider_type: "webdav",
  server_url: "https://example.com/webdav",
  username: "user",
  password_encrypted: "encrypted",
  remote_path: "/sync",
  sync_interval_minutes: 30,
  conflict_strategy: "local_wins",
  last_sync_at: "2024-01-01T00:00:00Z",
  last_sync_status: "success",
  last_sync_error: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockSyncStatus: SyncStatus = {
  enabled: true,
  is_syncing: false,
  last_sync_at: "2024-01-01T00:00:00Z",
  last_sync_status: "success",
  pending_changes: 5,
  conflicts_count: 0,
};

const mockSyncLog: SyncLog = {
  id: 1,
  started_at: "2024-01-01T00:00:00Z",
  completed_at: "2024-01-01T00:01:00Z",
  status: "success",
  entities_uploaded: 10,
  entities_downloaded: 5,
  conflicts_count: 0,
  error_message: null,
  duration_ms: 60000,
};

const mockDevice: DeviceInfo = {
  device_id: "device-1",
  device_name: "Desktop",
  is_current_device: true,
  last_seen_at: "2024-01-01T00:00:00Z",
  created_at: "2024-01-01T00:00:00Z",
};

const mockConflict: SyncConflict = {
  id: 1,
  entity_type: "todo",
  entity_id: "todo-1",
  local_version: { title: "Local" },
  remote_version: { title: "Remote" },
  local_modified_at: "2024-01-01T00:00:00Z",
  remote_modified_at: "2024-01-01T00:00:00Z",
};

const mockSchedulerStatus: SchedulerStatus = {
  is_running: true,
  interval_minutes: 30,
  circuit_breaker_closed: true,
  failure_count: 0,
};

describe("useSync hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("syncQueryKeys", () => {
    it("should have correct query keys", () => {
      expect(syncQueryKeys.config).toEqual(["sync", "config"]);
      expect(syncQueryKeys.status).toEqual(["sync", "status"]);
      expect(syncQueryKeys.logs).toEqual(["sync", "logs"]);
      expect(syncQueryKeys.username).toEqual(["sync", "username"]);
      expect(syncQueryKeys.hasCredentials).toEqual(["sync", "hasCredentials"]);
      expect(syncQueryKeys.devices).toEqual(["sync", "devices"]);
      expect(syncQueryKeys.conflicts).toEqual(["sync", "conflicts"]);
      expect(syncQueryKeys.schedulerStatus).toEqual([
        "sync",
        "schedulerStatus",
      ]);
    });
  });

  describe("useSyncConfig", () => {
    it("should return sync config on success", async () => {
      vi.mocked(getSyncConfig).mockResolvedValue(mockSyncConfig);

      const { result } = renderHook(() => useSyncConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSyncConfig);
      expect(getSyncConfig).toHaveBeenCalled();
    });

    it("should handle error", async () => {
      vi.mocked(getSyncConfig).mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() => useSyncConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe("useUpdateSyncConfig", () => {
    it("should update config and invalidate queries", async () => {
      vi.mocked(updateSyncConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useUpdateSyncConfig(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ enabled: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(updateSyncConfig).toHaveBeenCalledTimes(1);
      expect(updateSyncConfig).toHaveBeenCalledWith(
        { enabled: true },
        expect.any(Object),
      );
    });
  });

  describe("useSyncStatus", () => {
    it("should return sync status", async () => {
      vi.mocked(getSyncStatus).mockResolvedValue(mockSyncStatus);

      const { result } = renderHook(() => useSyncStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSyncStatus);
    });
  });

  describe("usePendingChangesCount", () => {
    it("should return pending changes count", async () => {
      vi.mocked(getPendingChangesCount).mockResolvedValue(10);

      const { result } = renderHook(() => usePendingChangesCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBe(10);
    });
  });

  describe("useTriggerSync", () => {
    it("should trigger sync and invalidate queries", async () => {
      vi.mocked(triggerSync).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTriggerSync(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(triggerSync).toHaveBeenCalled();
    });
  });

  describe("useSyncLogs", () => {
    it("should return sync logs with params", async () => {
      vi.mocked(getSyncLogs).mockResolvedValue([mockSyncLog]);

      const { result } = renderHook(() => useSyncLogs({ limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockSyncLog]);
      expect(getSyncLogs).toHaveBeenCalledWith({ limit: 10 });
    });
  });

  describe("useTestSyncConnection", () => {
    it("should test connection", async () => {
      vi.mocked(testSyncConnection).mockResolvedValue(true);

      const { result } = renderHook(() => useTestSyncConnection(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        serverUrl: "https://example.com",
        username: "user",
        password: "pass",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBe(true);
    });
  });

  describe("useSaveSyncCredentials", () => {
    it("should save credentials and invalidate queries", async () => {
      vi.mocked(saveSyncCredentials).mockResolvedValue(undefined);

      const { result } = renderHook(() => useSaveSyncCredentials(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ username: "user", password: "pass" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(saveSyncCredentials).toHaveBeenCalledWith("user", "pass");
    });
  });

  describe("useSyncUsername", () => {
    it("should return username", async () => {
      vi.mocked(getSyncUsername).mockResolvedValue("testuser");

      const { result } = renderHook(() => useSyncUsername(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBe("testuser");
    });
  });

  describe("useDeleteSyncCredentials", () => {
    it("should delete credentials and invalidate queries", async () => {
      vi.mocked(deleteSyncCredentials).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteSyncCredentials(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(deleteSyncCredentials).toHaveBeenCalled();
    });
  });

  describe("useHasSyncCredentials", () => {
    it("should return true when credentials exist", async () => {
      vi.mocked(hasSyncCredentials).mockResolvedValue(true);

      const { result } = renderHook(() => useHasSyncCredentials(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBe(true);
    });
  });

  describe("useDevices", () => {
    it("should return device list", async () => {
      vi.mocked(getDevices).mockResolvedValue([mockDevice]);

      const { result } = renderHook(() => useDevices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockDevice]);
    });
  });

  describe("useUnregisterDevice", () => {
    it("should unregister device and invalidate queries", async () => {
      vi.mocked(unregisterDevice).mockResolvedValue(undefined);

      const { result } = renderHook(() => useUnregisterDevice(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("device-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(unregisterDevice).toHaveBeenCalledTimes(1);
      expect(unregisterDevice).toHaveBeenCalledWith(
        "device-1",
        expect.any(Object),
      );
    });
  });

  describe("useConflicts", () => {
    it("should return conflicts", async () => {
      vi.mocked(getConflicts).mockResolvedValue([mockConflict]);

      const { result } = renderHook(() => useConflicts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockConflict]);
    });
  });

  describe("useResolveConflict", () => {
    it("should resolve conflict and invalidate queries", async () => {
      vi.mocked(resolveConflict).mockResolvedValue(undefined);

      const { result } = renderHook(() => useResolveConflict(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ conflictId: 1, resolution: "local" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(resolveConflict).toHaveBeenCalledWith(1, "local", undefined);
    });

    it("should resolve conflict with merged data", async () => {
      vi.mocked(resolveConflict).mockResolvedValue(undefined);
      const mergedData = { title: "Merged" };

      const { result } = renderHook(() => useResolveConflict(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        conflictId: 1,
        resolution: "merge",
        mergedData,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(resolveConflict).toHaveBeenCalledWith(1, "merge", mergedData);
    });
  });

  describe("useSchedulerStatus", () => {
    it("should return scheduler status", async () => {
      vi.mocked(getSchedulerStatus).mockResolvedValue(mockSchedulerStatus);

      const { result } = renderHook(() => useSchedulerStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSchedulerStatus);
    });
  });

  describe("useStartScheduler", () => {
    it("should start scheduler and invalidate queries", async () => {
      vi.mocked(startScheduler).mockResolvedValue(undefined);

      const { result } = renderHook(() => useStartScheduler(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(startScheduler).toHaveBeenCalled();
    });
  });

  describe("useStopScheduler", () => {
    it("should stop scheduler and invalidate queries", async () => {
      vi.mocked(stopScheduler).mockResolvedValue(undefined);

      const { result } = renderHook(() => useStopScheduler(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(stopScheduler).toHaveBeenCalled();
    });
  });

  describe("useSetSyncInterval", () => {
    it("should set sync interval and invalidate queries", async () => {
      vi.mocked(setSyncInterval).mockResolvedValue(undefined);

      const { result } = renderHook(() => useSetSyncInterval(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(60);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(setSyncInterval).toHaveBeenCalledTimes(1);
      expect(setSyncInterval).toHaveBeenCalledWith(60, expect.any(Object));
    });
  });

  describe("useTriggerBackgroundSync", () => {
    it("should trigger background sync and invalidate queries", async () => {
      vi.mocked(triggerBackgroundSync).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTriggerBackgroundSync(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(triggerBackgroundSync).toHaveBeenCalled();
    });
  });

  describe("useResetCircuitBreaker", () => {
    it("should reset circuit breaker and invalidate queries", async () => {
      vi.mocked(resetCircuitBreaker).mockResolvedValue(undefined);

      const { result } = renderHook(() => useResetCircuitBreaker(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(resetCircuitBreaker).toHaveBeenCalled();
    });
  });
});
