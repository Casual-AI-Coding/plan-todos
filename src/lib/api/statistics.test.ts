import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Statistics } from "@/lib/types";
import { getStatistics } from "./statistics";

// Mock @tauri-apps/api/core
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

// Get the mocked invoke function
const { invoke } = await import("@tauri-apps/api/core");

// ============================================================================
// getStatistics Function Tests
// ============================================================================
describe("getStatistics", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Set up non-Tauri environment by default
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  // ==========================================================================
  // Non-Tauri Environment Tests
  // ==========================================================================
  describe("Non-Tauri environment", () => {
    it("throws error when not in Tauri environment", async () => {
      await expect(getStatistics()).rejects.toThrow(
        "This app must run in Tauri to get statistics",
      );
    });
  });

  // ==========================================================================
  // Tauri Environment Tests - Success
  // ==========================================================================
  describe("Tauri environment - Success", () => {
    it("calls Tauri invoke and returns statistics data", async () => {
      // Set up Tauri environment
      Object.defineProperty(global, "window", {
        value: { __TAURI__: {} },
        writable: true,
      });

      // Mock statistics data
      const mockStatistics: Statistics = {
        counts: {
          todo: 10,
          plan: 5,
          task: 20,
          target: 8,
          step: 15,
          milestone: 3,
        },
        completion: {
          todo_done: 7,
          todo_total: 10,
          task_done: 15,
          task_total: 20,
          step_completed: 10,
          step_total: 15,
          milestone_done: 2,
          milestone_total: 3,
          todo_completion_rate: 70,
          task_completion_rate: 75,
          step_completion_rate: 66.67,
          milestone_completion_rate: 66.67,
        },
        trends: {
          daily: [
            { date: "2026-03-01", completed: 5 },
            { date: "2026-03-02", completed: 8 },
          ],
        },
        efficiency: {
          streak_days: 5,
          today_completed: 3,
          week_completed: 15,
          month_completed: 50,
          productivity_score: 85,
        },
      };

      vi.mocked(invoke).mockResolvedValue(mockStatistics);

      const result = await getStatistics();

      // Verify invoke was called
      expect(invoke).toHaveBeenCalledWith("get_statistics");

      // Verify the result matches mock data
      expect(result).toEqual(mockStatistics);
      expect(result.counts.todo).toBe(10);
      expect(result.counts.plan).toBe(5);
      expect(result.efficiency.streak_days).toBe(5);
      expect(result.trends.daily).toHaveLength(2);
    });

    it("handles statistics with zero values", async () => {
      // Set up Tauri environment
      Object.defineProperty(global, "window", {
        value: { __TAURI__: {} },
        writable: true,
      });

      const mockStatistics: Statistics = {
        counts: {
          todo: 0,
          plan: 0,
          task: 0,
          target: 0,
          step: 0,
          milestone: 0,
        },
        completion: {
          todo_done: 0,
          todo_total: 0,
          task_done: 0,
          task_total: 0,
          step_completed: 0,
          step_total: 0,
          milestone_done: 0,
          milestone_total: 0,
          todo_completion_rate: 0,
          task_completion_rate: 0,
          step_completion_rate: 0,
          milestone_completion_rate: 0,
        },
        trends: {
          daily: [],
        },
        efficiency: {
          streak_days: 0,
          today_completed: 0,
          week_completed: 0,
          month_completed: 0,
          productivity_score: 0,
        },
      };

      vi.mocked(invoke).mockResolvedValue(mockStatistics);

      const result = await getStatistics();

      expect(result.counts.todo).toBe(0);
      expect(result.efficiency.productivity_score).toBe(0);
      expect(result.trends.daily).toEqual([]);
    });

    it("handles empty trends data", async () => {
      // Set up Tauri environment
      Object.defineProperty(global, "window", {
        value: { __TAURI__: {} },
        writable: true,
      });

      const mockStatistics: Statistics = {
        counts: {
          todo: 5,
          plan: 2,
          task: 10,
          target: 3,
          step: 8,
          milestone: 1,
        },
        completion: {
          todo_done: 3,
          todo_total: 5,
          task_done: 7,
          task_total: 10,
          step_completed: 5,
          step_total: 8,
          milestone_done: 1,
          milestone_total: 1,
          todo_completion_rate: 60,
          task_completion_rate: 70,
          step_completion_rate: 62.5,
          milestone_completion_rate: 100,
        },
        trends: {
          daily: [],
        },
        efficiency: {
          streak_days: 10,
          today_completed: 2,
          week_completed: 12,
          month_completed: 45,
          productivity_score: 92,
        },
      };

      vi.mocked(invoke).mockResolvedValue(mockStatistics);

      const result = await getStatistics();

      expect(result.trends.daily).toEqual([]);
      expect(result.efficiency.streak_days).toBe(10);
    });
  });

  // ==========================================================================
  // Tauri Environment Tests - Error Handling
  // ==========================================================================
  describe("Tauri environment - Error handling", () => {
    it("throws error when invoke fails", async () => {
      // Set up Tauri environment
      Object.defineProperty(global, "window", {
        value: { __TAURI__: {} },
        writable: true,
      });

      const errorMessage = "Failed to get statistics";
      vi.mocked(invoke).mockRejectedValue(new Error(errorMessage));

      await expect(getStatistics()).rejects.toThrow(errorMessage);
    });

    it("throws error when invoke rejects with string", async () => {
      // Set up Tauri environment
      Object.defineProperty(global, "window", {
        value: { __TAURI__: {} },
        writable: true,
      });

      vi.mocked(invoke).mockRejectedValue("Unknown error");

      await expect(getStatistics()).rejects.toThrow("Unknown error");
    });

    it("throws error when invoke rejects with null", async () => {
      // Set up Tauri environment
      Object.defineProperty(global, "window", {
        value: { __TAURI__: {} },
        writable: true,
      });

      vi.mocked(invoke).mockRejectedValue(null);

      // When invoke rejects with null, it should be converted to Error
      await expect(getStatistics()).rejects.toThrow("Null error");
    });

    it("throws error when invoke rejects with undefined", async () => {
      // Set up Tauri environment
      Object.defineProperty(global, "window", {
        value: { __TAURI__: {} },
        writable: true,
      });

      vi.mocked(invoke).mockRejectedValue(undefined);

      await expect(getStatistics()).rejects.toThrow("Undefined error");
    });
  });

  // ==========================================================================
  // Type Validation Tests
  // ==========================================================================
  describe("Type validation", () => {
    it("returns correct Statistics type structure", async () => {
      // Set up Tauri environment
      Object.defineProperty(global, "window", {
        value: { __TAURI__: {} },
        writable: true,
      });

      const mockStatistics: Statistics = {
        counts: {
          todo: 1,
          plan: 1,
          task: 1,
          target: 1,
          step: 1,
          milestone: 1,
        },
        completion: {
          todo_done: 1,
          todo_total: 1,
          task_done: 1,
          task_total: 1,
          step_completed: 1,
          step_total: 1,
          milestone_done: 1,
          milestone_total: 1,
          todo_completion_rate: 100,
          task_completion_rate: 100,
          step_completion_rate: 100,
          milestone_completion_rate: 100,
        },
        trends: {
          daily: [{ date: "2026-03-03", completed: 1 }],
        },
        efficiency: {
          streak_days: 1,
          today_completed: 1,
          week_completed: 1,
          month_completed: 1,
          productivity_score: 100,
        },
      };

      vi.mocked(invoke).mockResolvedValue(mockStatistics);

      const result = await getStatistics();

      // Type checking - these should compile if types are correct
      expect(typeof result.counts.todo).toBe("number");
      expect(typeof result.completion.todo_completion_rate).toBe("number");
      expect(Array.isArray(result.trends.daily)).toBe(true);
      expect(typeof result.efficiency.productivity_score).toBe("number");
    });
  });
});
