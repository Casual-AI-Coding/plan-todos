import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DriveFile, GoogleDriveStatus } from "@/lib/api/googleDrive";
import {
  exchangeGoogleDriveCode,
  getGoogleDriveAuthUrl,
  getGoogleDriveStatus,
  googleDriveDisconnect,
  googleDriveDownload,
  googleDriveListBackups,
  googleDriveRestore,
  googleDriveSync,
  googleDriveUpload,
} from "@/lib/api/googleDrive";

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

describe("Google Drive API", () => {
  beforeEach(() => {
    Object.defineProperty(global, "window", {
      value: { __TAURI__: {} },
      writable: true,
    });
    mockInvoke.mockReset();
  });

  afterEach(() => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });
  });

  describe("getGoogleDriveAuthUrl", () => {
    it("returns the authorization URL", async () => {
      mockInvoke.mockResolvedValue("https://accounts.google.com/oauth");

      const result = await getGoogleDriveAuthUrl();

      expect(mockInvoke).toHaveBeenCalledWith(
        "get_google_drive_auth_url",
        undefined,
      );
      expect(result).toBe("https://accounts.google.com/oauth");
    });

    it("wraps invoke failures with a localized error", async () => {
      mockInvoke.mockRejectedValue(new Error("network down"));

      await expect(getGoogleDriveAuthUrl()).rejects.toThrow(
        '操作失败: API command "get_google_drive_auth_url" failed: Error: network down',
      );
    });
  });

  describe("exchangeGoogleDriveCode", () => {
    it("sends the authorization code to the backend", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await exchangeGoogleDriveCode("oauth-code-123");

      expect(mockInvoke).toHaveBeenCalledWith("exchange_google_drive_code", {
        code: "oauth-code-123",
      });
    });
  });

  describe("getGoogleDriveStatus", () => {
    it("returns the current connection status", async () => {
      const status: GoogleDriveStatus = {
        connected: true,
        email: "user@example.com",
        expires_at: 1712345678,
      };
      mockInvoke.mockResolvedValue(status);

      const result = await getGoogleDriveStatus();

      expect(mockInvoke).toHaveBeenCalledWith(
        "get_google_drive_status",
        undefined,
      );
      expect(result).toEqual(status);
    });
  });

  describe("googleDriveDisconnect", () => {
    it("disconnects the current account", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await googleDriveDisconnect();

      expect(mockInvoke).toHaveBeenCalledWith(
        "google_drive_disconnect",
        undefined,
      );
    });
  });

  describe("googleDriveSync", () => {
    it("starts a sync upload", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await googleDriveSync();

      expect(mockInvoke).toHaveBeenCalledWith("google_drive_sync", undefined);
    });
  });
  describe("googleDriveRestore", () => {
    it("restores a backup by file id", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await googleDriveRestore("backup-file-1");

      expect(mockInvoke).toHaveBeenCalledWith("google_drive_restore", {
        fileId: "backup-file-1",
      });
    });
  });

  describe("googleDriveListBackups", () => {
    it("returns the list of backup files", async () => {
      const files: DriveFile[] = [
        {
          id: "file-1",
          name: "backup-2026-04-28.db",
          mime_type: "application/octet-stream",
          modified_at: "2026-04-28T10:00:00.000Z",
          size: 2048,
        },
      ];
      mockInvoke.mockResolvedValue(files);

      const result = await googleDriveListBackups();

      expect(mockInvoke).toHaveBeenCalledWith(
        "google_drive_list_files",
        undefined,
      );
      expect(result).toEqual(files);
    });
  });

  describe("googleDriveDownload", () => {
    it("downloads a backup file by id", async () => {
      mockInvoke.mockResolvedValue("database-content");

      const result = await googleDriveDownload("file-2");

      expect(mockInvoke).toHaveBeenCalledWith("google_drive_download", {
        fileId: "file-2",
      });
      expect(result).toBe("database-content");
    });
  });

  describe("googleDriveUpload", () => {
    it("uploads a named backup file", async () => {
      mockInvoke.mockResolvedValue("uploaded-file-id");

      const result = await googleDriveUpload(
        "backup.db",
        "serialized-database",
      );

      expect(mockInvoke).toHaveBeenCalledWith("google_drive_upload", {
        filename: "backup.db",
        content: "serialized-database",
      });
      expect(result).toBe("uploaded-file-id");
    });
  });

  describe("Tauri environment guard", () => {
    it("throws when Google Drive APIs run outside Tauri", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(googleDriveSync()).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 同步到 Google Drive",
      );
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });
});
