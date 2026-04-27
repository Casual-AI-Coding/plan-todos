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
  getGlobalNotificationSettings,
  updateGlobalNotificationSettings,
  resetGlobalNotificationSettings,
  getCirculationNotificationSettings,
  updateCirculationNotificationSettings,
  deleteCirculationNotificationSettings,
  getGlobalCirculationNotificationSettings,
  updateGlobalCirculationNotificationSettings,
  getCirculationsWithNotificationSettings,
  sendTestNotification,
} from "@/lib/api/notifications";
import type {
  NotificationSettings,
  DailySummarySettings,
  DueReminder,
  DailySummary,
  NotificationPlugin,
  SendNotificationResult,
  GlobalNotificationSettings,
  GlobalNotificationSettingsUpdate,
  CirculationNotificationSettings,
  CirculationNotificationSettingsInput,
  GlobalCirculationNotificationSettings,
  GlobalCirculationNotificationSettingsInput,
  CirculationWithNotificationSettings,
} from "@/lib/types";

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
        reminder_times: [30],
        reminder_sent: false,
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
        setNotificationSettings("todo", "entity-1", [30]),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with set_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue({});
      await setNotificationSettings("todo", "entity-1", [30]);
      expect(mockInvoke).toHaveBeenCalledWith("set_notification_settings", {
        entityType: "todo",
        entityId: "entity-1",
        reminderTimes: [30],
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
        id: "dss-1",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
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
        date: "2024-01-01",
        pending_count: 5,
        overdue_count: 2,
        completed_count: 0,
        upcoming_count: 0,
      };
      mockInvoke.mockResolvedValue(mockSummary);
      const result = await getDailySummary();
      expect(mockInvoke).toHaveBeenCalledWith("get_daily_summary", {
        date: undefined,
      });
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

  describe("getGlobalNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(getGlobalNotificationSettings()).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with get_global_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const settings: GlobalNotificationSettings = {
        id: "global-1",
        master_enabled: true,
        desktop_enabled: true,
        sound_enabled: false,
        default_reminder_times: [15, 60],
        todo_default_enabled: true,
        todo_default_times: [15],
        plan_default_enabled: true,
        plan_default_times: [60],
        target_default_enabled: false,
        target_default_times: [],
        dnd_enabled: true,
        dnd_start_time: "22:00",
        dnd_end_time: "07:00",
        dnd_days: [1, 2, 3, 4, 5],
        channel_priority: ["desktop", "email"],
        retention_days: 30,
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
      };
      mockInvoke.mockResolvedValue(settings);

      const result = await getGlobalNotificationSettings();

      expect(mockInvoke).toHaveBeenCalledWith(
        "get_global_notification_settings",
      );
      expect(result).toEqual(settings);
    });
  });

  describe("updateGlobalNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      const input: GlobalNotificationSettingsUpdate = {
        master_enabled: true,
        desktop_enabled: true,
        sound_enabled: true,
        default_reminder_times: [30],
        todo_default_enabled: true,
        todo_default_times: [30],
        plan_default_enabled: true,
        plan_default_times: [60],
        target_default_enabled: true,
        target_default_times: [120],
        dnd_enabled: false,
        dnd_days: [],
        channel_priority: ["desktop"],
        retention_days: 14,
      };

      await expect(updateGlobalNotificationSettings(input)).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with update_global_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const input: GlobalNotificationSettingsUpdate = {
        master_enabled: true,
        desktop_enabled: true,
        sound_enabled: true,
        default_reminder_times: [30],
        todo_default_enabled: true,
        todo_default_times: [30],
        plan_default_enabled: false,
        plan_default_times: [],
        target_default_enabled: true,
        target_default_times: [120],
        dnd_enabled: false,
        dnd_days: [],
        channel_priority: ["desktop"],
        retention_days: 14,
      };
      const settings: GlobalNotificationSettings = {
        id: "global-1",
        created_at: "2024-01-01",
        updated_at: "2024-01-03",
        ...input,
      };
      mockInvoke.mockResolvedValue(settings);

      const result = await updateGlobalNotificationSettings(input);

      expect(mockInvoke).toHaveBeenCalledWith(
        "update_global_notification_settings",
        { settings: input },
      );
      expect(result).toEqual(settings);
    });
  });

  describe("resetGlobalNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(resetGlobalNotificationSettings()).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with reset_global_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const settings: GlobalNotificationSettings = {
        id: "global-default",
        master_enabled: true,
        desktop_enabled: true,
        sound_enabled: true,
        default_reminder_times: [15, 60],
        todo_default_enabled: true,
        todo_default_times: [15],
        plan_default_enabled: true,
        plan_default_times: [60],
        target_default_enabled: true,
        target_default_times: [60],
        dnd_enabled: false,
        dnd_days: [],
        channel_priority: ["desktop"],
        retention_days: 30,
        created_at: "2024-01-01",
        updated_at: "2024-01-04",
      };
      mockInvoke.mockResolvedValue(settings);

      const result = await resetGlobalNotificationSettings();

      expect(mockInvoke).toHaveBeenCalledWith(
        "reset_global_notification_settings",
      );
      expect(result).toEqual(settings);
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
      const mockResult: SendNotificationResult = {
        success: true,
        message: "Sent",
      };
      mockInvoke.mockResolvedValue(mockResult);
      const result = await sendNotification("plugin-1", "Title", "Content");
      expect(mockInvoke).toHaveBeenCalledWith("send_notification", {
        pluginId: "plugin-1",
        title: "Title",
        message: "Content",
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("getCirculationNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(
        getCirculationNotificationSettings("circulation-1"),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with get_circulation_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const settings: CirculationNotificationSettings = {
        id: "cns-1",
        circulation_id: "circulation-1",
        enabled: true,
        reminder_type: "fixed",
        fixed_time: "08:30",
        channels: '["desktop"]',
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
      };
      mockInvoke.mockResolvedValue(settings);

      const result = await getCirculationNotificationSettings("circulation-1");

      expect(mockInvoke).toHaveBeenCalledWith(
        "get_circulation_notification_settings",
        { circulationId: "circulation-1" },
      );
      expect(result).toEqual(settings);
    });
  });

  describe("updateCirculationNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const input: CirculationNotificationSettingsInput = {
        enabled: true,
        reminder_type: "before",
        before_minutes: 20,
        channels: '["desktop","email"]',
      };

      await expect(
        updateCirculationNotificationSettings("circulation-1", input),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with update_circulation_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const input: CirculationNotificationSettingsInput = {
        enabled: true,
        reminder_type: "before",
        before_minutes: 20,
        channels: '["desktop","email"]',
        message_template: "Keep your streak going",
      };
      const settings: CirculationNotificationSettings = {
        id: "cns-1",
        circulation_id: "circulation-1",
        enabled: true,
        reminder_type: "before",
        before_minutes: 20,
        channels: '["desktop","email"]',
        message_template: "Keep your streak going",
        created_at: "2024-01-01",
        updated_at: "2024-01-03",
      };
      mockInvoke.mockResolvedValue(settings);

      const result = await updateCirculationNotificationSettings(
        "circulation-1",
        input,
      );

      expect(mockInvoke).toHaveBeenCalledWith(
        "update_circulation_notification_settings",
        { circulationId: "circulation-1", input },
      );
      expect(result).toEqual(settings);
    });
  });

  describe("deleteCirculationNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(
        deleteCirculationNotificationSettings("circulation-1"),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with delete_circulation_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(true);

      const result = await deleteCirculationNotificationSettings(
        "circulation-1",
      );

      expect(mockInvoke).toHaveBeenCalledWith(
        "delete_circulation_notification_settings",
        { circulationId: "circulation-1" },
      );
      expect(result).toBe(true);
    });
  });

  describe("getGlobalCirculationNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(getGlobalCirculationNotificationSettings()).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with get_global_circulation_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const settings: GlobalCirculationNotificationSettings = {
        id: "global-circ-1",
        master_enabled: true,
        default_reminder_type: "fixed",
        default_fixed_time: "09:00",
        default_before_minutes: 30,
        achievement_notifications: true,
        streak_milestones: "7,30",
        count_milestones: "10,50",
        default_channels: '["desktop"]',
        dnd_enabled: false,
        dnd_start_time: "22:00",
        dnd_end_time: "07:00",
        updated_at: "2024-01-05",
      };
      mockInvoke.mockResolvedValue(settings);

      const result = await getGlobalCirculationNotificationSettings();

      expect(mockInvoke).toHaveBeenCalledWith(
        "get_global_circulation_notification_settings",
      );
      expect(result).toEqual(settings);
    });
  });

  describe("updateGlobalCirculationNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const input: GlobalCirculationNotificationSettingsInput = {
        master_enabled: true,
        default_reminder_type: "before",
        default_before_minutes: 15,
      };

      await expect(
        updateGlobalCirculationNotificationSettings(input),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with update_global_circulation_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const input: GlobalCirculationNotificationSettingsInput = {
        master_enabled: true,
        default_reminder_type: "before",
        default_before_minutes: 15,
        achievement_notifications: true,
        default_channels: '["desktop","email"]',
      };
      const settings: GlobalCirculationNotificationSettings = {
        id: "global-circ-1",
        master_enabled: true,
        default_reminder_type: "before",
        default_fixed_time: "09:00",
        default_before_minutes: 15,
        achievement_notifications: true,
        streak_milestones: "7,30",
        count_milestones: "10,50",
        default_channels: '["desktop","email"]',
        dnd_enabled: false,
        dnd_start_time: "22:00",
        dnd_end_time: "07:00",
        updated_at: "2024-01-06",
      };
      mockInvoke.mockResolvedValue(settings);

      const result = await updateGlobalCirculationNotificationSettings(input);

      expect(mockInvoke).toHaveBeenCalledWith(
        "update_global_circulation_notification_settings",
        { input },
      );
      expect(result).toEqual(settings);
    });
  });

  describe("getCirculationsWithNotificationSettings", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(
        getCirculationsWithNotificationSettings(),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with get_circulations_with_notification_settings command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const items: CirculationWithNotificationSettings[] = [
        {
          id: "circulation-1",
          title: "Morning run",
          circulation_type: "habit",
          frequency: "daily",
          status: "active",
          notification_settings: {
            id: "cns-1",
            circulation_id: "circulation-1",
            enabled: true,
            reminder_type: "fixed",
            fixed_time: "08:30",
            channels: '["desktop"]',
            created_at: "2024-01-01",
            updated_at: "2024-01-02",
          },
        },
      ];
      mockInvoke.mockResolvedValue(items);

      const result = await getCirculationsWithNotificationSettings();

      expect(mockInvoke).toHaveBeenCalledWith(
        "get_circulations_with_notification_settings",
      );
      expect(result).toEqual(items);
    });
  });

  describe("sendTestNotification", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(sendTestNotification()).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with send_test_notification command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(undefined);

      await sendTestNotification();

      expect(mockInvoke).toHaveBeenCalledWith("send_test_notification");
    });
  });
});
