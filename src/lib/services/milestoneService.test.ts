// src/lib/services/milestoneService.test.ts
import { describe, it, expect } from "vitest";
import {
  filterMilestonesByStatus,
  sortMilestonesByDueDate,
  getUpcomingMilestones,
  getOverdueMilestones,
  getCompletedMilestones,
} from "./milestoneService";

describe("milestoneService", () => {
  describe("filterMilestonesByStatus", () => {
    it("should filter milestones by status", () => {
      const milestones = [
        { id: "1", title: "M1", status: "completed" as const, target_date: null, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
        { id: "2", title: "M2", status: "pending" as const, target_date: null, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
        { id: "3", title: "M3", status: "completed" as const, target_date: null, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
      ];
      const result = filterMilestonesByStatus(milestones, "completed");
      expect(result.length).toBe(2);
    });

    it("should handle milestones without status", () => {
      const milestones = [
        { id: "1", title: "M1", status: undefined, target_date: null, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" } as never,
        { id: "2", title: "M2", status: "completed" as const, target_date: null, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
      ];
      const result = filterMilestonesByStatus(milestones as never, "completed");
      expect(result.length).toBe(1);
    });

    it("should return empty array for empty input", () => {
      const result = filterMilestonesByStatus([], "completed");
      expect(result).toEqual([]);
    });
  });

  describe("sortMilestonesByDueDate", () => {
    it("should sort milestones by target_date ascending", () => {
      const milestones = [
        { id: "1", title: "M1", target_date: "2026-03-10", status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
        { id: "2", title: "M2", target_date: "2026-03-01", status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
        { id: "3", title: "M3", target_date: "2026-03-15", status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
      ];
      const result = sortMilestonesByDueDate(milestones);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
      expect(result[2].id).toBe("3");
    });

    it("should place milestones without target_date at end", () => {
      const milestones = [
        { id: "1", title: "M1", target_date: "2026-03-10", status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
        { id: "2", title: "M2", target_date: null, status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
        { id: "3", title: "M3", target_date: "2026-03-01", status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
      ];
      const result = sortMilestonesByDueDate(milestones);
      expect(result[2].id).toBe("2");
    });

    it("should handle all milestones without target_date", () => {
      const milestones = [
        { id: "1", title: "M1", target_date: null, status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
        { id: "2", title: "M2", target_date: null, status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
      ];
      const result = sortMilestonesByDueDate(milestones);
      expect(result.length).toBe(2);
    });
  });

  describe("getUpcomingMilestones", () => {
    it("should return milestones due within specified days", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const milestones = [
        { id: "1", title: "M1", target_date: tomorrow.toISOString(), status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
        { id: "2", title: "M2", target_date: "2099-12-31", status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
        { id: "3", title: "M3", target_date: null, status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
      ];
      const result = getUpcomingMilestones(milestones, 7);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("1");
    });

    it("should use default 7 days", () => {
      const threeDays = new Date();
      threeDays.setDate(threeDays.getDate() + 3);

      const milestones = [
        { id: "1", title: "M1", target_date: threeDays.toISOString(), status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
      ];
      const result = getUpcomingMilestones(milestones);
      expect(result.length).toBe(1);
    });
  });

  describe("getOverdueMilestones", () => {
    it("should return overdue milestones that are not completed", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const milestones = [
        { id: "1", title: "M1", target_date: yesterday.toISOString(), status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
        { id: "2", title: "M2", target_date: yesterday.toISOString(), status: "completed" as const, biz_type: null, biz_id: null, progress: 100, created_at: "", updated_at: "" },
        { id: "3", title: "M3", target_date: "2099-12-31", status: "pending" as const, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
      ];
      const result = getOverdueMilestones(milestones);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("getCompletedMilestones", () => {
    it("should return completed milestones", () => {
      const milestones = [
        { id: "1", title: "M1", status: "completed" as const, target_date: null, biz_type: null, biz_id: null, progress: 100, created_at: "", updated_at: "" },
        { id: "2", title: "M2", status: "pending" as const, target_date: null, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" },
      ];
      const result = getCompletedMilestones(milestones);
      expect(result.length).toBe(1);
    });

    it("should return empty array when no completed milestones", () => {
      const milestones = [{ id: "1", title: "M1", status: "pending" as const, target_date: null, biz_type: null, biz_id: null, progress: 0, created_at: "", updated_at: "" }];
      const result = getCompletedMilestones(milestones);
      expect(result).toEqual([]);
    });
  });
});