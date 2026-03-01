// src/lib/services/planService.test.ts
import { describe, it, expect } from "vitest";
import {
  calculatePlanProgress,
  sortPlansByDeadline,
  filterPlansByStatus,
  getOverduePlans,
} from "./planService";

describe("planService", () => {
  describe("calculatePlanProgress", () => {
    it("should return zero for empty steps", () => {
      const result = calculatePlanProgress([]);
      expect(result).toEqual({ completed: 0, total: 0, percentage: 0 });
    });

    it("should return zero for undefined steps", () => {
      const result = calculatePlanProgress(undefined as unknown as []);
      expect(result).toEqual({ completed: 0, total: 0, percentage: 0 });
    });

    it("should calculate correct progress", () => {
      const steps = [
        { id: "1", status: "completed" as const },
        { id: "2", status: "pending" as const },
        { id: "3", status: "completed" as const },
        { id: "4", status: "pending" as const },
      ];
      const result = calculatePlanProgress(steps);
      expect(result.completed).toBe(2);
      expect(result.total).toBe(4);
      expect(result.percentage).toBe(50);
    });

    it("should calculate 100% when all completed", () => {
      const steps = [
        { id: "1", status: "completed" as const },
        { id: "2", status: "completed" as const },
      ];
      const result = calculatePlanProgress(steps);
      expect(result.percentage).toBe(100);
    });
  });

  describe("sortPlansByDeadline", () => {
    it("should sort plans by deadline ascending", () => {
      const plans = [
        { id: "1", title: "Plan A", deadline: "2026-03-10" },
        { id: "2", title: "Plan B", deadline: "2026-03-01" },
        { id: "3", title: "Plan C", deadline: "2026-03-15" },
      ];
      const result = sortPlansByDeadline(plans);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
      expect(result[2].id).toBe("3");
    });

    it("should place plans without deadline at end", () => {
      const plans = [
        { id: "1", title: "Plan A", deadline: "2026-03-10" },
        { id: "2", title: "Plan B" },
        { id: "3", title: "Plan C", deadline: "2026-03-01" },
      ];
      const result = sortPlansByDeadline(plans);
      expect(result[2].id).toBe("2");
    });

    it("should not modify original array", () => {
      const plans = [
        { id: "1", title: "Plan A", deadline: "2026-03-10" },
        { id: "2", title: "Plan B", deadline: "2026-03-01" },
      ];
      sortPlansByDeadline(plans);
      expect(plans[0].id).toBe("1");
    });
  });

  describe("filterPlansByStatus", () => {
    it("should filter plans by status", () => {
      const plans = [
        { id: "1", title: "Plan A", status: "pending" },
        { id: "2", title: "Plan B", status: "completed" },
        { id: "3", title: "Plan C", status: "pending" },
      ];
      const result = filterPlansByStatus(plans, "pending");
      expect(result.length).toBe(2);
      expect(result[0].id).toBe("1");
    });
  });

  describe("getOverduePlans", () => {
    it("should return overdue plans", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const plans = [
        { id: "1", title: "Plan A", deadline: pastDate.toISOString() },
        { id: "2", title: "Plan B", deadline: "2099-12-31" },
        { id: "3", title: "Plan C" },
      ];
      const result = getOverduePlans(plans);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("1");
    });
  });
});
