import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSyncConfig,
  updateSyncConfig,
  testSyncConnection,
  saveSyncCredentials,
  getSyncUsername,
  deleteSyncCredentials,
  hasSyncCredentials,
  getSyncStatus,
  triggerSync,
  getPendingChangesCount,
  getSyncLogs,
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
  type SyncConfig,
  type SyncStatus,
  type SyncLog,
  type SyncConflict,
  type DeviceInfo,
  type SchedulerStatus,
} from "@/lib/api/sync";

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

vi.mock("@/lib/api/client", () => ({
  isTauri: vi.fn(() => true),
  invoke: mockInvoke,
}));

import { isTauri } from "@/lib/api/client";

describe("Sync API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    vi.clearAllMocks();
  });

  describe("Configuration APIs", () => {
    describe("getSyncConfig", () => {
      it("should return sync config on success", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        const mockConfig: SyncConfig = {
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
        mockInvoke.mockResolvedValue(mockConfig);

        const result = await getSyncConfig();

        expect(mockInvoke).toHaveBeenCalledWith("get_sync_config");
        expect(result).toEqual(mockConfig);
      });

      it("should handle error", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockRejectedValue(new Error("Config error"));

        await expect(getSyncConfig()).rejects.toThrow();
      });
    });

    describe("updateSyncConfig", () => {
      it("should update sync config", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await updateSyncConfig({
          enabled: true,
          server_url: "https://new.example.com",
          sync_interval_minutes: 60,
        });

        expect(mockInvoke).toHaveBeenCalledWith("update_sync_config", {
          enabled: true,
          server_url: "https://new.example.com",
          sync_interval_minutes: 60,
        });
      });
    });
  });

  describe("Credential APIs", () => {
    describe("testSyncConnection", () => {
      it("should test connection successfully", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(true);

        const result = await testSyncConnection(
          "https://example.com",
          "user",
          "pass",
        );

        expect(mockInvoke).toHaveBeenCalledWith("test_sync_connection", {
          server_url: "https://example.com",
          username: "user",
          password: "pass",
        });
        expect(result).toBe(true);
      });

      it("should return false on connection failure", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(false);

        const result = await testSyncConnection(
          "https://example.com",
          "user",
          "wrong",
        );

        expect(result).toBe(false);
      });
    });

    describe("saveSyncCredentials", () => {
      it("should save credentials", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await saveSyncCredentials("user", "pass");

        expect(mockInvoke).toHaveBeenCalledWith("save_sync_credentials", {
          username: "user",
          password: "pass",
        });
      });
    });

    describe("getSyncUsername", () => {
      it("should return username", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue("testuser");

        const result = await getSyncUsername();

        expect(result).toBe("testuser");
      });

      it("should return null when no username", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(null);

        const result = await getSyncUsername();

        expect(result).toBeNull();
      });
    });

    describe("deleteSyncCredentials", () => {
      it("should delete credentials", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await deleteSyncCredentials();

        expect(mockInvoke).toHaveBeenCalledWith("delete_sync_credentials");
      });
    });

    describe("hasSyncCredentials", () => {
      it("should return true when credentials exist", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(true);

        const result = await hasSyncCredentials();

        expect(result).toBe(true);
      });

      it("should return false when no credentials", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(false);

        const result = await hasSyncCredentials();

        expect(result).toBe(false);
      });
    });
  });

  describe("Sync Operations APIs", () => {
    describe("getSyncStatus", () => {
      it("should return sync status", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        const mockStatus: SyncStatus = {
          enabled: true,
          is_syncing: false,
          last_sync_at: "2024-01-01T00:00:00Z",
          last_sync_status: "success",
          pending_changes: 5,
          conflicts_count: 0,
        };
        mockInvoke.mockResolvedValue(mockStatus);

        const result = await getSyncStatus();

        expect(result).toEqual(mockStatus);
      });
    });

    describe("triggerSync", () => {
      it("should trigger sync", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await triggerSync();

        expect(mockInvoke).toHaveBeenCalledWith("trigger_sync");
      });
    });

    describe("getPendingChangesCount", () => {
      it("should return pending changes count", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(10);

        const result = await getPendingChangesCount();

        expect(result).toBe(10);
      });
    });

    describe("getSyncLogs", () => {
      it("should return sync logs", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        const mockLogs: SyncLog[] = [
          {
            id: 1,
            started_at: "2024-01-01T00:00:00Z",
            completed_at: "2024-01-01T00:01:00Z",
            status: "success",
            entities_uploaded: 10,
            entities_downloaded: 5,
            conflicts_count: 0,
            error_message: null,
            duration_ms: 60000,
          },
        ];
        mockInvoke.mockResolvedValue(mockLogs);

        const result = await getSyncLogs({ limit: 10, offset: 0 });

        expect(mockInvoke).toHaveBeenCalledWith("get_sync_logs", {
          limit: 10,
          offset: 0,
        });
        expect(result).toEqual(mockLogs);
      });

      it("should call without params", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue([]);

        await getSyncLogs();

        expect(mockInvoke).toHaveBeenCalledWith("get_sync_logs", {
          limit: undefined,
          offset: undefined,
        });
      });
    });
  });

  describe("Device APIs", () => {
    describe("getDevices", () => {
      it("should return device list", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        const mockDevices: DeviceInfo[] = [
          {
            device_id: "device-1",
            device_name: "Desktop",
            is_current_device: true,
            last_seen_at: "2024-01-01T00:00:00Z",
            created_at: "2024-01-01T00:00:00Z",
          },
        ];
        mockInvoke.mockResolvedValue(mockDevices);

        const result = await getDevices();

        expect(result).toEqual(mockDevices);
      });
    });

    describe("unregisterDevice", () => {
      it("should unregister device", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await unregisterDevice("device-1");

        expect(mockInvoke).toHaveBeenCalledWith("unregister_device", {
          device_id: "device-1",
        });
      });
    });
  });

  describe("Conflict APIs", () => {
    describe("getConflicts", () => {
      it("should return conflicts", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        const mockConflicts: SyncConflict[] = [
          {
            id: 1,
            entity_type: "todo",
            entity_id: "todo-1",
            local_version: { title: "Local" },
            remote_version: { title: "Remote" },
            local_modified_at: "2024-01-01T00:00:00Z",
            remote_modified_at: "2024-01-01T00:00:00Z",
          },
        ];
        mockInvoke.mockResolvedValue(mockConflicts);

        const result = await getConflicts();

        expect(result).toEqual(mockConflicts);
      });
    });

    describe("resolveConflict", () => {
      it("should resolve conflict with local", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await resolveConflict(1, "local");

        expect(mockInvoke).toHaveBeenCalledWith("resolve_conflict", {
          conflict_id: 1,
          resolution: "local",
          merged_data: undefined,
        });
      });

      it("should resolve conflict with merge", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);
        const mergedData = { title: "Merged" };

        await resolveConflict(1, "merge", mergedData);

        expect(mockInvoke).toHaveBeenCalledWith("resolve_conflict", {
          conflict_id: 1,
          resolution: "merge",
          merged_data: mergedData,
        });
      });
    });
  });

  describe("Scheduler APIs", () => {
    describe("getSchedulerStatus", () => {
      it("should return scheduler status", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        const mockStatus: SchedulerStatus = {
          is_running: true,
          interval_minutes: 30,
          circuit_breaker_closed: true,
          failure_count: 0,
        };
        mockInvoke.mockResolvedValue(mockStatus);

        const result = await getSchedulerStatus();

        expect(result).toEqual(mockStatus);
      });
    });

    describe("startScheduler", () => {
      it("should start scheduler", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await startScheduler();

        expect(mockInvoke).toHaveBeenCalledWith("start_scheduler");
      });
    });

    describe("stopScheduler", () => {
      it("should stop scheduler", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await stopScheduler();

        expect(mockInvoke).toHaveBeenCalledWith("stop_scheduler");
      });
    });

    describe("setSyncInterval", () => {
      it("should set sync interval", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await setSyncInterval(60);

        expect(mockInvoke).toHaveBeenCalledWith("set_sync_interval", {
          minutes: 60,
        });
      });
    });

    describe("triggerBackgroundSync", () => {
      it("should trigger background sync", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await triggerBackgroundSync();

        expect(mockInvoke).toHaveBeenCalledWith("trigger_background_sync");
      });
    });

    describe("resetCircuitBreaker", () => {
      it("should reset circuit breaker", async () => {
        vi.mocked(isTauri).mockReturnValue(true);
        mockInvoke.mockResolvedValue(undefined);

        await resetCircuitBreaker();

        expect(mockInvoke).toHaveBeenCalledWith("reset_circuit_breaker");
      });
    });
  });
});
