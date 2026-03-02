import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getNotificationSettings,
  setNotificationSettings,
  deleteNotificationSettings,
  getDailySummarySettings,
  updateDailySummarySettings,
  getDueReminders,
  markReminderSent,
  getDailySummary,
  getNotificationPlugins,
  createNotificationPlugin,
  updateNotificationPlugin,
  deleteNotificationPlugin,
  sendNotification,
} from "@/lib/api/notifications";
import type {
  NotificationSettings,
  DailySummarySettings,
  DueReminder,
  DailySummary,
  NotificationPlugin,
  SendNotificationResult,
} from "@/lib/types";

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

vi.mock("@/lib/api/client", () => ({
  isTauri: vi.fn(),
}));

import { isTauri } from "@/lib/api/client";

describe("Notification API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    vi.clearAllMocks();
  });

  describe("getNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(getNotificationSettings("todo", "entity-1")).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with get_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockSettings: NotificationSettings = {
        id: "ns-1",
        entity_type: "todo",
        entity_id: "entity-1",
        reminder_minutes: 30,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      mockInvoke.mockResolvedValue(mockSettings);

      const result = await getNotificationSettings("todo", "entity-1");

      expect(mockInvoke).toHaveBeenCalledWith("get_notification_settings", {
        entityType: "todo",
        entityId: "entity-1",
      });
      expect(result).toEqual(mockSettings);
    });

    it("should return null when no settings found", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(null);
      const result = await getNotificationSettings("todo", "entity-1");
      expect(result).toBeNull();
    });
  });

  describe("setNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(
        setNotificationSettings("todo", "entity-1", 30),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with set_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue({});
      await setNotificationSettings("todo", "entity-1", 30);
      expect(mockInvoke).toHaveBeenCalledWith("set_notification_settings", {
        entityType: "todo",
        entityId: "entity-1",
        reminderMinutes: 30,
      });
    });
  });

  describe("deleteNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(
        deleteNotificationSettings("todo", "entity-1"),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with delete_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(true);
      await deleteNotificationSettings("todo", "entity-1");
      expect(mockInvoke).toHaveBeenCalledWith("delete_notification_settings", {
        entityType: "todo",
        entityId: "entity-1",
      });
    });
  });

  describe("getDailySummarySettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(getDailySummarySettings()).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with get_daily_summary_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockSettings: DailySummarySettings = {
        enabled: true,
        time: "09:00",
        include_pending: true,
        include_overdue: true,
        include_completed: true,
      };
      mockInvoke.mockResolvedValue(mockSettings);
      const result = await getDailySummarySettings();
      expect(mockInvoke).toHaveBeenCalledWith("get_daily_summary_settings");
      expect(result).toEqual(mockSettings);
    });
  });

  describe("updateDailySummarySettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(
        updateDailySummarySettings(true, "09:00", true, true, true),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with update_daily_summary_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue({});
      await updateDailySummarySettings(true, "09:00", true, true, true);
      expect(mockInvoke).toHaveBeenCalledWith("update_daily_summary_settings", {
        enabled: true,
        time: "09:00",
        includePending: true,
        includeOverdue: true,
        includeCompleted: true,
      });
    });
  });

  describe("getDueReminders", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(getDueReminders()).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with get_due_reminders command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockReminders: DueReminder[] = [];
      mockInvoke.mockResolvedValue(mockReminders);
      const result = await getDueReminders();
      expect(mockInvoke).toHaveBeenCalledWith("get_due_reminders");
      expect(result).toEqual(mockReminders);
    });
  });

  describe("markReminderSent", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(markReminderSent("todo", "entity-1")).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with mark_reminder_sent command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(true);
      await markReminderSent("todo", "entity-1");
      expect(mockInvoke).toHaveBeenCalledWith("mark_reminder_sent", {
        entityType: "todo",
        entityId: "entity-1",
      });
    });
  });

  describe("getDailySummary", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(getDailySummary()).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with get_daily_summary command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockSummary: DailySummary = {
        pending_count: 0,
        overdue_count: 0,
        completed_today_count: 0,
      };
      mockInvoke.mockResolvedValue(mockSummary);
      const result = await getDailySummary();
      expect(mockInvoke).toHaveBeenCalledWith("get_daily_summary");
      expect(result).toEqual(mockSummary);
    });
  });

  describe("getNotificationPlugins", () => {
    it("should return empty array when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const result = await getNotificationPlugins();
      expect(result).toEqual([]);
    });

    it("should call invoke with get_notification_plugins command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockPlugins: NotificationPlugin[] = [];
      mockInvoke.mockResolvedValue(mockPlugins);
      const result = await getNotificationPlugins();
      expect(mockInvoke).toHaveBeenCalledWith("get_notification_plugins");
      expect(result).toEqual(mockPlugins);
    });
  });

  describe("createNotificationPlugin", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(
        createNotificationPlugin("Test", "webhook", "{}"),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with create_notification_plugin command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue({});
      await createNotificationPlugin(
        "Test",
        "webhook",
        '{"url": "https://example.com"}',
      );
      expect(mockInvoke).toHaveBeenCalledWith("create_notification_plugin", {
        name: "Test",
        pluginType: "webhook",
        config: '{"url": "https://example.com"}',
      });
    });
  });

  describe("updateNotificationPlugin", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(
        updateNotificationPlugin("plugin-1", "Updated", true, "{}"),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with update_notification_plugin command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue({});
      await updateNotificationPlugin(
        "plugin-1",
        "Updated",
        true,
        '{"url": "https://example.com"}',
      );
      expect(mockInvoke).toHaveBeenCalledWith("update_notification_plugin", {
        id: "plugin-1",
        name: "Updated",
        enabled: true,
        config: '{"url": "https://example.com"}',
      });
    });
  });

  describe("deleteNotificationPlugin", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(deleteNotificationPlugin("plugin-1")).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with delete_notification_plugin command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(undefined);
      await deleteNotificationPlugin("plugin-1");
      expect(mockInvoke).toHaveBeenCalledWith("delete_notification_plugin", {
        id: "plugin-1",
      });
    });
  });

  describe("sendNotification", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(
        sendNotification("plugin-1", "Title", "Content"),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with send_notification command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockResult: SendNotificationResult = { success: true };
      mockInvoke.mockResolvedValue(mockResult);
      const result = await sendNotification("plugin-1", "Title", "Content");
      expect(mockInvoke).toHaveBeenCalledWith("send_notification", {
        pluginId: "plugin-1",
        title: "Title",
        content: "Content",
      });
      expect(result).toEqual(mockResult);
    });
  });
});
