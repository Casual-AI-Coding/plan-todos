import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDashboard } from "@/lib/api/dashboard";
import type { Dashboard } from "@/lib/types";

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

describe("Dashboard API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    vi.clearAllMocks();
  });

  describe("getDashboard", () => {
    it("should return mock data when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      const result = await getDashboard();

      expect(result).toEqual({
        overview: {
          today_todos_count: 0,
          upcoming_3days_count: 0,
          completed_today_count: 0,
          overdue_count: 0,
          streak_days: 0,
          productivity_score: 0,
        },
        week: { completed_count: 0 },
        counts: {
          todo: 0,
          plan: 0,
          task: 0,
          target: 0,
          step: 0,
          milestone: 0,
          circulation: 0,
        },
        circulation_stats: {
          today_pending: 0,
          today_completed: 0,
          current_streak: 0,
        },
        today_todos: [],
        overdue_todos: [],
        completed_today: [],
        active_plans: [],
        active_targets: [],
        active_milestones: [],
      });
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("should call invoke with get_dashboard command when in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockDashboard: Dashboard = {
        overview: {
          today_todos_count: 5,
          upcoming_3days_count: 10,
          completed_today_count: 3,
          overdue_count: 2,
          streak_days: 7,
          productivity_score: 85,
        },
        week: { completed_count: 15 },
        counts: {
          todo: 20,
          plan: 5,
          task: 10,
          target: 3,
          step: 8,
          milestone: 4,
          circulation: 12,
        },
        circulation_stats: {
          today_pending: 5,
          today_completed: 3,
          current_streak: 7,
        },
        today_todos: [],
        overdue_todos: [],
        completed_today: [],
        active_plans: [],
        active_targets: [],
        active_milestones: [],
      };
      mockInvoke.mockResolvedValue(mockDashboard);

      const result = await getDashboard();

      expect(mockInvoke).toHaveBeenCalledWith("get_dashboard");
      expect(result).toEqual(mockDashboard);
    });

    it("should handle invoke error", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockRejectedValue(new Error("Tauri error"));
      await expect(getDashboard()).rejects.toThrow("Tauri error");
    });
  });
});
