import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getGlobalNotificationSettings,
  updateGlobalNotificationSettings,
  resetGlobalNotificationSettings,
} from "./notifications";
import type { GlobalNotificationSettings } from "@/lib/types";

// Mock Tauri API and environment
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("./utils", () => ({
  withTauriError: vi.fn((operation, fn) => fn()),
  withTauriFallback: vi.fn((operation, fn, fallback) => fn()),
}));

import { invoke } from "@tauri-apps/api/core";

const mockSettings: GlobalNotificationSettings = {
  id: "default",
  master_enabled: true,
  desktop_enabled: true,
  sound_enabled: true,
  default_reminder_times: [5, 15, 30],
  todo_default_enabled: true,
  todo_default_times: [5, 15, 30],
  plan_default_enabled: true,
  plan_default_times: [5, 15, 30],
  target_default_enabled: true,
  target_default_times: [5, 15, 30],
  dnd_enabled: false,
  dnd_start_time: "22:00",
  dnd_end_time: "08:00",
  dnd_days: [0, 1, 2, 3, 4, 5, 6],
  channel_priority: ["desktop", "email", "webhook"],
  retention_days: 30,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("Global Notification Settings API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getGlobalNotificationSettings", () => {
    it("should call invoke with correct command", async () => {
      vi.mocked(invoke).mockResolvedValue(mockSettings);

      const result = await getGlobalNotificationSettings();

      expect(invoke).toHaveBeenCalledWith("get_global_notification_settings");
      expect(result).toEqual(mockSettings);
    });

    it("should handle errors", async () => {
      vi.mocked(invoke).mockRejectedValue(new Error("Database error"));

      await expect(getGlobalNotificationSettings()).rejects.toThrow();
    });
  });

  describe("updateGlobalNotificationSettings", () => {
    it("should call invoke with settings", async () => {
      const updatedSettings = { ...mockSettings, retention_days: 90 };
      vi.mocked(invoke).mockResolvedValue(updatedSettings);

      const result = await updateGlobalNotificationSettings(updatedSettings);

      expect(invoke).toHaveBeenCalledWith(
        "update_global_notification_settings",
        { settings: updatedSettings },
      );
      expect(result).toEqual(updatedSettings);
    });
  });

  describe("resetGlobalNotificationSettings", () => {
    it("should call invoke with correct command", async () => {
      vi.mocked(invoke).mockResolvedValue(mockSettings);

      const result = await resetGlobalNotificationSettings();

      expect(invoke).toHaveBeenCalledWith("reset_global_notification_settings");
      expect(result).toEqual(mockSettings);
    });
  });
});
