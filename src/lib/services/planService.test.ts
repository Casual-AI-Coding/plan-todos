// src/lib/services/planService.test.ts
import { describe, it, expect } from "vitest";
import type { Plan, Step, Priority } from "@/lib/types";
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
      const result = calculatePlanProgress(undefined as unknown as Step[]);
      expect(result).toEqual({ completed: 0, total: 0, percentage: 0 });
    });

    it("should calculate correct progress", () => {
      const steps: Step[] = [
        {
          id: "1",
          target_id: "t1",
          title: "Step 1",
          weight: 25,
          status: "completed",
          priority: "P2" as Priority,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "2",
          target_id: "t1",
          title: "Step 2",
          weight: 25,
          status: "pending",
          priority: "P2" as Priority,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "3",
          target_id: "t1",
          title: "Step 3",
          weight: 25,
          status: "completed",
          priority: "P2" as Priority,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "4",
          target_id: "t1",
          title: "Step 4",
          weight: 25,
          status: "pending",
          priority: "P2" as Priority,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ];
      const result = calculatePlanProgress(steps);
      expect(result.completed).toBe(2);
      expect(result.total).toBe(4);
      expect(result.percentage).toBe(50);
    });

    it("should calculate 100% when all completed", () => {
      const steps: Step[] = [
        {
          id: "1",
          target_id: "t1",
          title: "Step 1",
          weight: 50,
          status: "completed",
          priority: "P2" as Priority,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "2",
          target_id: "t1",
          title: "Step 2",
          weight: 50,
          status: "completed",
          priority: "P2" as Priority,
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ];
      const result = calculatePlanProgress(steps);
      expect(result.percentage).toBe(100);
    });
  });

  describe("sortPlansByDeadline", () => {
    it("should sort plans by end_date ascending", () => {
      const plans: Plan[] = [
        {
          id: "1",
          title: "Plan A",
          description: null,
          start_date: null,
          end_date: "2026-03-10",
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "2",
          title: "Plan B",
          description: null,
          start_date: null,
          end_date: "2026-03-01",
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "3",
          title: "Plan C",
          description: null,
          start_date: null,
          end_date: "2026-03-15",
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ];
      const result = sortPlansByDeadline(plans);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("1");
      expect(result[2].id).toBe("3");
    });

    it("should place plans without end_date at end", () => {
      const plans: Plan[] = [
        {
          id: "1",
          title: "Plan A",
          description: null,
          start_date: null,
          end_date: "2026-03-10",
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "2",
          title: "Plan B",
          description: null,
          start_date: null,
          end_date: null,
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "3",
          title: "Plan C",
          description: null,
          start_date: null,
          end_date: "2026-03-01",
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ];
      const result = sortPlansByDeadline(plans);
      expect(result[2].id).toBe("2");
    });

    it("should not modify original array", () => {
      const plans: Plan[] = [
        {
          id: "1",
          title: "Plan A",
          description: null,
          start_date: null,
          end_date: "2026-03-10",
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "2",
          title: "Plan B",
          description: null,
          start_date: null,
          end_date: "2026-03-01",
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ];
      sortPlansByDeadline(plans);
      expect(plans[0].id).toBe("1");
    });
  });

  describe("filterPlansByStatus", () => {
    it("should filter plans by status", () => {
      const plans: Plan[] = [
        {
          id: "1",
          title: "Plan A",
          description: null,
          start_date: null,
          end_date: null,
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "2",
          title: "Plan B",
          description: null,
          start_date: null,
          end_date: null,
          status: "completed",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "3",
          title: "Plan C",
          description: null,
          start_date: null,
          end_date: null,
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ];
      const result = filterPlansByStatus(plans, "active");
      expect(result.length).toBe(2);
      expect(result[0].id).toBe("1");
    });
  });

  describe("getOverduePlans", () => {
    it("should return overdue plans", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const plans: Plan[] = [
        {
          id: "1",
          title: "Plan A",
          description: null,
          start_date: null,
          end_date: pastDate.toISOString(),
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "2",
          title: "Plan B",
          description: null,
          start_date: null,
          end_date: "2099-12-31",
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
        {
          id: "3",
          title: "Plan C",
          description: null,
          start_date: null,
          end_date: null,
          status: "active",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        },
      ];
      const result = getOverduePlans(plans);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("1");
    });
  });
});
