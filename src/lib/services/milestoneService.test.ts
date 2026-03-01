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
        { id: "1", title: "M1", status: "completed" },
        { id: "2", title: "M2", status: "pending" },
        { id: "3", title: "M3", status: "completed" },
      ];
      const result = filterMilestonesByStatus(milestones, "completed");
      expect(result.length).toBe(2);
    });
  });

  describe("sortMilestonesByDueDate", () => {
    it("should sort milestones by due date ascending", () => {
      const milestones = [
        { id: "1", title: "M1", dueDate: "2026-03-10" },
        { id: "2", title: "M2", dueDate: "2026-03-01" },
        { id: "3", title: "M3", dueDate: "2026-03-15" },
      ];
      const result = sortMilestonesByDueDate(milestones);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
      expect(result[2].id).toBe("3");
    });

    it("should place milestones without dueDate at end", () => {
      const milestones = [
        { id: "1", title: "M1", dueDate: "2026-03-10" },
        { id: "2", title: "M2" },
        { id: "3", title: "M3", dueDate: "2026-03-01" },
      ];
      const result = sortMilestonesByDueDate(milestones);
      expect(result[2].id).toBe("2");
    });
  });

  describe("getUpcomingMilestones", () => {
    it("should return milestones due within specified days", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const milestones = [
        { id: "1", title: "M1", dueDate: tomorrow.toISOString() },
        { id: "2", title: "M2", dueDate: "2099-12-31" },
        { id: "3", title: "M3" },
      ];
      const result = getUpcomingMilestones(milestones, 7);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("1");
    });

    it("should use default 7 days", () => {
      const threeDays = new Date();
      threeDays.setDate(threeDays.getDate() + 3);

      const milestones = [
        { id: "1", title: "M1", dueDate: threeDays.toISOString() },
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
        {
          id: "1",
          title: "M1",
          dueDate: yesterday.toISOString(),
          status: "pending",
        },
        {
          id: "2",
          title: "M2",
          dueDate: yesterday.toISOString(),
          status: "completed",
        },
        { id: "3", title: "M3", dueDate: "2099-12-31" },
      ];
      const result = getOverdueMilestones(milestones);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("getCompletedMilestones", () => {
    it("should return completed milestones", () => {
      const milestones = [
        { id: "1", title: "M1", status: "completed" },
        { id: "2", title: "M2", status: "pending" },
      ];
      const result = getCompletedMilestones(milestones);
      expect(result.length).toBe(1);
    });
  });
});
