/**
 * Notification API Integration Tests
 *
 * These tests verify the complete notification flow including:
 * - Setting notification settings
 * - Getting notification settings
 * - Retrieving notification history with filters
 * - Getting pending notifications
 *
 * Note: These tests require Tauri backend to be running or mock appropriately.
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import {
  setNotificationSettings,
  getNotificationSettings,
  deleteNotificationSettings,
  getNotificationHistory,
  getPendingNotifications,
  getDueReminders,
  markReminderSent,
} from "../notifications";
import type { NotificationSettings, NotificationHistory } from "@/lib/types";

// Mock the Tauri invoke for integration tests
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

describe("Notification API Integration", () => {
  // Unique test identifiers to avoid conflicts
  const testEntityId = `test-notif-${Date.now()}`;
  const testEntityId2 = `test-notif2-${Date.now()}`;

  beforeEach(() => {
    mockInvoke.mockReset();
  });

  describe("Full Notification Flow: Settings → History", () => {
    it("should set notification settings and retrieve them", async () => {
      const reminderTimes = [5, 15, 30];

      // Set notification settings
      mockInvoke.mockResolvedValueOnce({
        id: `notif-todo-${testEntityId}`,
        entity_type: "todo",
        entity_id: testEntityId,
        reminder_times: reminderTimes,
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const settings = await setNotificationSettings(
        "todo",
        testEntityId,
        reminderTimes,
      );

      expect(settings.entity_type).toBe("todo");
      expect(settings.entity_id).toBe(testEntityId);
      expect(settings.reminder_times).toEqual(reminderTimes);
      expect(mockInvoke).toHaveBeenCalledWith("set_notification_settings", {
        entityType: "todo",
        entityId: testEntityId,
        reminderTimes: reminderTimes,
      });
    });

    it("should retrieve notification settings after setting", async () => {
      const reminderTimes = [10, 60];

      // Mock get notification settings response
      mockInvoke.mockResolvedValueOnce({
        id: `notif-plan-${testEntityId}`,
        entity_type: "plan",
        entity_id: testEntityId,
        reminder_times: reminderTimes,
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const settings = await getNotificationSettings("plan", testEntityId);

      expect(settings).not.toBeNull();
      expect(settings?.entity_type).toBe("plan");
      expect(settings?.entity_id).toBe(testEntityId);
      expect(settings?.reminder_times).toEqual(reminderTimes);
    });

    it("should return null when no settings exist", async () => {
      mockInvoke.mockResolvedValueOnce(null);

      const settings = await getNotificationSettings("todo", "non-existent-id");

      expect(settings).toBeNull();
    });
  });

  describe("Reminder Times Roundtrip", () => {
    it("should preserve multiple reminder times correctly", async () => {
      const reminderTimes = [5, 15, 30, 60, 1440]; // 5min, 15min, 30min, 1hour, 1day

      mockInvoke.mockResolvedValueOnce({
        id: `notif-target-${testEntityId}`,
        entity_type: "target",
        entity_id: testEntityId,
        reminder_times: reminderTimes,
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const settings = await setNotificationSettings(
        "target",
        testEntityId,
        reminderTimes,
      );

      expect(settings.reminder_times).toEqual(reminderTimes);
    });

    it("should handle single reminder time", async () => {
      const reminderTimes = [30];

      mockInvoke.mockResolvedValueOnce({
        id: `notif-todo-${testEntityId}`,
        entity_type: "todo",
        entity_id: testEntityId,
        reminder_times: reminderTimes,
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const settings = await setNotificationSettings(
        "todo",
        testEntityId,
        reminderTimes,
      );

      expect(settings.reminder_times).toEqual([30]);
    });

    it("should handle empty reminder times array", async () => {
      const reminderTimes: number[] = [];

      mockInvoke.mockResolvedValueOnce({
        id: `notif-todo-${testEntityId}`,
        entity_type: "todo",
        entity_id: testEntityId,
        reminder_times: [],
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const settings = await setNotificationSettings(
        "todo",
        testEntityId,
        reminderTimes,
      );

      expect(settings.reminder_times).toEqual([]);
    });

    it("should handle large reminder times (up to 365 days)", async () => {
      const reminderTimes = [525600]; // 365 days in minutes

      mockInvoke.mockResolvedValueOnce({
        id: `notif-todo-${testEntityId}`,
        entity_type: "todo",
        entity_id: testEntityId,
        reminder_times: reminderTimes,
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const settings = await setNotificationSettings(
        "todo",
        testEntityId,
        reminderTimes,
      );

      expect(settings.reminder_times).toEqual(reminderTimes);
    });
  });

  describe("Notification History Filters", () => {
    it("should filter history by status (pending)", async () => {
      const mockHistory: NotificationHistory[] = [
        {
          id: "hist-1",
          entity_type: "todo",
          entity_id: "todo-1",
          title: "Test Todo",
          scheduled_at: new Date().toISOString(),
          channel: "system",
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockHistory);

      const history = await getNotificationHistory({ status: "pending" });

      expect(Array.isArray(history)).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("get_notification_history", {
        filters: { status: "pending" },
      });
    });

    it("should filter history by status (sent)", async () => {
      const mockHistory: NotificationHistory[] = [
        {
          id: "hist-2",
          entity_type: "todo",
          entity_id: "todo-1",
          title: "Test Todo",
          scheduled_at: new Date().toISOString(),
          sent_at: new Date().toISOString(),
          channel: "system",
          status: "sent",
          created_at: new Date().toISOString(),
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockHistory);

      const history = await getNotificationHistory({ status: "sent" });

      expect(Array.isArray(history)).toBe(true);
      expect(history[0]?.status).toBe("sent");
    });

    it("should filter history by entity_type (todo)", async () => {
      const mockHistory: NotificationHistory[] = [];

      mockInvoke.mockResolvedValueOnce(mockHistory);

      const history = await getNotificationHistory({ entity_type: "todo" });

      expect(Array.isArray(history)).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("get_notification_history", {
        filters: { entity_type: "todo" },
      });
    });

    it("should filter history by entity_type (plan)", async () => {
      const mockHistory: NotificationHistory[] = [];

      mockInvoke.mockResolvedValueOnce(mockHistory);

      const history = await getNotificationHistory({ entity_type: "plan" });

      expect(Array.isArray(history)).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("get_notification_history", {
        filters: { entity_type: "plan" },
      });
    });

    it("should filter history by entity_type (target)", async () => {
      const mockHistory: NotificationHistory[] = [];

      mockInvoke.mockResolvedValueOnce(mockHistory);

      const history = await getNotificationHistory({ entity_type: "target" });

      expect(Array.isArray(history)).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("get_notification_history", {
        filters: { entity_type: "target" },
      });
    });

    it("should combine multiple filters", async () => {
      const mockHistory: NotificationHistory[] = [];

      mockInvoke.mockResolvedValueOnce(mockHistory);

      const history = await getNotificationHistory({
        status: "pending",
        entity_type: "todo",
      });

      expect(Array.isArray(history)).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("get_notification_history", {
        filters: { status: "pending", entity_type: "todo" },
      });
    });

    it("should return empty array when no history matches filters", async () => {
      mockInvoke.mockResolvedValueOnce([]);

      const history = await getNotificationHistory({ status: "sent" });

      expect(Array.isArray(history)).toBe(true);
      expect(history).toHaveLength(0);
    });
  });

  describe("Pending Notifications", () => {
    it("should retrieve pending notifications", async () => {
      const mockPending: NotificationHistory[] = [
        {
          id: "pending-1",
          entity_type: "todo",
          entity_id: "todo-1",
          title: "Upcoming Todo",
          scheduled_at: new Date().toISOString(),
          channel: "system",
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockPending);

      const pending = await getPendingNotifications();

      expect(Array.isArray(pending)).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("get_pending_notifications", {});
    });

    it("should return empty array when no pending notifications", async () => {
      mockInvoke.mockResolvedValueOnce([]);

      const pending = await getPendingNotifications();

      expect(Array.isArray(pending)).toBe(true);
      expect(pending).toHaveLength(0);
    });
  });

  describe("Due Reminders", () => {
    it("should retrieve due reminders", async () => {
      const mockReminders = [
        {
          entity_type: "todo",
          entity_id: "todo-1",
          title: "Test Todo",
          due_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
          minutes_until_due: 30,
          reminder_times: [30],
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockReminders);

      const reminders = await getDueReminders();

      expect(Array.isArray(reminders)).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("get_due_reminders");
    });

    it("should return empty array when no due reminders", async () => {
      mockInvoke.mockResolvedValueOnce([]);

      const reminders = await getDueReminders();

      expect(Array.isArray(reminders)).toBe(true);
      expect(reminders).toHaveLength(0);
    });
  });

  describe("Mark Reminder Sent", () => {
    it("should mark reminder as sent", async () => {
      mockInvoke.mockResolvedValueOnce(true);

      const result = await markReminderSent("todo", testEntityId);

      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("mark_reminder_sent", {
        entityType: "todo",
        entityId: testEntityId,
      });
    });
  });

  describe("Delete Notification Settings", () => {
    it("should delete notification settings", async () => {
      mockInvoke.mockResolvedValueOnce(true);

      const result = await deleteNotificationSettings("todo", testEntityId);

      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("delete_notification_settings", {
        entityType: "todo",
        entityId: testEntityId,
      });
    });

    it("should return false when settings don't exist", async () => {
      mockInvoke.mockResolvedValueOnce(false);

      const result = await deleteNotificationSettings("todo", "non-existent");

      expect(result).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle all entity types (todo, plan, target)", async () => {
      const entityTypes = ["todo", "plan", "target"] as const;

      for (const entityType of entityTypes) {
        mockInvoke.mockResolvedValueOnce({
          id: `notif-${entityType}-${testEntityId}`,
          entity_type: entityType,
          entity_id: testEntityId,
          reminder_times: [30],
          reminder_sent: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        const settings = await setNotificationSettings(
          entityType,
          testEntityId,
          [30],
        );

        expect(settings.entity_type).toBe(entityType);
      }
    });

    it("should handle special characters in entity_id", async () => {
      const specialId = "test-entity-with-dashes_underscores.and.dots";

      mockInvoke.mockResolvedValueOnce({
        id: `notif-todo-${specialId}`,
        entity_type: "todo",
        entity_id: specialId,
        reminder_times: [30],
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const settings = await setNotificationSettings("todo", specialId, [30]);

      expect(settings.entity_id).toBe(specialId);
    });
  });
});
