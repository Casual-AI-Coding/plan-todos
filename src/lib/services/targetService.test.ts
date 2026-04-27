import { describe, it, expect } from "vitest";
import type { Target } from "@/lib/types";
import {
  sortTargetsByProgress,
  calculateTargetProgress,
  getCompletedTargets,
  getOverdueTargets,
  getProgressCategory,
} from "./targetService";

describe("targetService", () => {
  describe("sortTargetsByProgress", () => {
    it("should sort targets by progress descending (returns indices)", () => {
      const targets: Target[] = [
        {
          id: "1",
          title: "Target 1",
          description: null,
          due_date: null,
          status: "active",
          progress: 30,
          sort_order: 0,
          created_at: "",
          updated_at: "",
        },
        {
          id: "2",
          title: "Target 2",
          description: null,
          due_date: null,
          status: "active",
          progress: 80,
          sort_order: 1,
          created_at: "",
          updated_at: "",
        },
        {
          id: "3",
          title: "Target 3",
          description: null,
          due_date: null,
          status: "active",
          progress: 50,
          sort_order: 2,
          created_at: "",
          updated_at: "",
        },
      ];
      const result = sortTargetsByProgress(targets);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(0);
    });

    it("should handle zero progress", () => {
      const targets: Target[] = [
        {
          id: "1",
          title: "Target 1",
          description: null,
          due_date: null,
          status: "active",
          progress: 0,
          sort_order: 0,
          created_at: "",
          updated_at: "",
        },
        {
          id: "2",
          title: "Target 2",
          description: null,
          due_date: null,
          status: "active",
          progress: 50,
          sort_order: 1,
          created_at: "",
          updated_at: "",
        },
      ];
      const result = sortTargetsByProgress(targets);
      expect(result[0]).toBe(1);
    });
  });

  describe("calculateTargetProgress", () => {
    it("should calculate progress from target.progress field", () => {
      const target: Target = {
        id: "1",
        title: "Target",
        description: null,
        due_date: null,
        status: "active",
        progress: 75,
        sort_order: 0,
        created_at: "",
        updated_at: "",
      };
      const result = calculateTargetProgress(target);
      expect(result.progress).toBe(75);
      expect(result.isCompleted).toBe(false);
    });

    it("should return completed when progress >= 100", () => {
      const target: Target = {
        id: "1",
        title: "Target",
        description: null,
        due_date: null,
        status: "active",
        progress: 100,
        sort_order: 0,
        created_at: "",
        updated_at: "",
      };
      const result = calculateTargetProgress(target);
      expect(result.progress).toBe(100);
      expect(result.isCompleted).toBe(true);
    });

    it("should cap progress at 100", () => {
      const target: Target = {
        id: "1",
        title: "Target",
        description: null,
        due_date: null,
        status: "active",
        progress: 120,
        sort_order: 0,
        created_at: "",
        updated_at: "",
      };
      const result = calculateTargetProgress(target);
      expect(result.progress).toBe(100);
      expect(result.isCompleted).toBe(true);
    });

    it("should handle zero progress", () => {
      const target: Target = {
        id: "1",
        title: "Target",
        description: null,
        due_date: null,
        status: "active",
        progress: 0,
        sort_order: 0,
        created_at: "",
        updated_at: "",
      };
      const result = calculateTargetProgress(target);
      expect(result.progress).toBe(0);
    });
  });

  describe("getCompletedTargets", () => {
    it("should return completed targets (status or progress)", () => {
      const targets: Target[] = [
        {
          id: "1",
          title: "Target 1",
          description: null,
          due_date: null,
          status: "completed",
          progress: 100,
          sort_order: 0,
          created_at: "",
          updated_at: "",
        },
        {
          id: "2",
          title: "Target 2",
          description: null,
          due_date: null,
          status: "active",
          progress: 50,
          sort_order: 1,
          created_at: "",
          updated_at: "",
        },
        {
          id: "3",
          title: "Target 3",
          description: null,
          due_date: null,
          status: "active",
          progress: 100,
          sort_order: 2,
          created_at: "",
          updated_at: "",
        },
      ];
      const result = getCompletedTargets(targets);
      expect(result.length).toBe(2);
    });
  });

  describe("getOverdueTargets", () => {
    it("should return overdue targets (past due_date, not completed)", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const targets: Target[] = [
        {
          id: "1",
          title: "Target 1",
          description: null,
          due_date: yesterday.toISOString(),
          status: "active",
          progress: 50,
          sort_order: 0,
          created_at: "",
          updated_at: "",
        },
        {
          id: "2",
          title: "Target 2",
          description: null,
          due_date: "2099-12-31",
          status: "active",
          progress: 50,
          sort_order: 1,
          created_at: "",
          updated_at: "",
        },
        {
          id: "3",
          title: "Target 3",
          description: null,
          due_date: yesterday.toISOString(),
          status: "completed",
          progress: 100,
          sort_order: 2,
          created_at: "",
          updated_at: "",
        },
      ];
      const result = getOverdueTargets(targets);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("getProgressCategory", () => {
    it("should return not_started for 0%", () => {
      expect(getProgressCategory(0)).toBe("not_started");
    });

    it("should return in_progress for 1-79%", () => {
      expect(getProgressCategory(50)).toBe("in_progress");
    });

    it("should return near_completion for 80-99%", () => {
      expect(getProgressCategory(85)).toBe("near_completion");
    });

    it("should return completed for 100%+", () => {
      expect(getProgressCategory(100)).toBe("completed");
    });
  });
});
