// src/lib/services/targetService.test.ts
import { describe, it, expect } from "vitest";
import {
  sortTargetsByProgress,
  calculateTargetProgress,
  getCompletedTargets,
  getOverdueTargets,
  getProgressCategory,
} from "./targetService";

describe("targetService", () => {
  describe("sortTargetsByProgress", () => {
    it("should sort targets by progress descending", () => {
      const targets = [
        { id: "1", title: "Target 1", current: 30, target: 100 },
        { id: "2", title: "Target 2", current: 80, target: 100 },
        { id: "3", title: "Target 3", current: 50, target: 100 },
      ];
      const result = sortTargetsByProgress(targets);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("3");
      expect(result[2].id).toBe("1");
    });

    it("should handle zero target", () => {
      const targets = [
        { id: "1", title: "Target 1", current: 50, target: 0 },
        { id: "2", title: "Target 2", current: 30, target: 100 },
      ];
      const result = sortTargetsByProgress(targets);
      expect(result[0].id).toBe("2");
    });
  });

  describe("calculateTargetProgress", () => {
    it("should calculate correct progress", () => {
      const target = { id: "1", title: "Target", current: 75, target: 100 };
      const result = calculateTargetProgress(target);
      expect(result.progress).toBe(75);
      expect(result.isCompleted).toBe(false);
    });

    it("should return 100% when current >= target", () => {
      const target = { id: "1", title: "Target", current: 120, target: 100 };
      const result = calculateTargetProgress(target);
      expect(result.progress).toBe(100);
      expect(result.isCompleted).toBe(true);
    });

    it("should handle zero target", () => {
      const target = { id: "1", title: "Target", current: 50, target: 0 };
      const result = calculateTargetProgress(target);
      expect(result.progress).toBe(0);
    });
  });

  describe("getCompletedTargets", () => {
    it("should return completed targets", () => {
      const targets = [
        { id: "1", title: "Target 1", current: 100, target: 100 },
        { id: "2", title: "Target 2", current: 50, target: 100 },
        { id: "3", title: "Target 3", current: 120, target: 100 },
      ];
      const result = getCompletedTargets(targets);
      expect(result.length).toBe(2);
    });
  });

  describe("getOverdueTargets", () => {
    it("should return overdue targets", () => {
      const targets = [
        { id: "1", title: "Target 1", current: 100, target: 100 },
        { id: "2", title: "Target 2", current: 50, target: 100 },
      ];
      const result = getOverdueTargets(targets);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("2");
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
