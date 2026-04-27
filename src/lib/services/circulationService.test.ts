import { describe, it, expect } from "vitest";
import {
  calculateCirculationStats,
  getCirculationTrend,
  getHighestCirculationDay,
  getLowestCirculationDay,
} from "./circulationService";

describe("circulationService", () => {
  describe("calculateCirculationStats", () => {
    it("should return zero for empty logs", () => {
      const result = calculateCirculationStats([]);
      expect(result).toEqual({ totalCount: 0, avgCount: 0 });
    });

    it("should calculate correct stats", () => {
      const logs = [
        {
          id: "1",
          circulation_id: "c1",
          count: 10,
          completed_at: "2026-03-01T00:00:00Z",
          note: null,
          period: null,
        },
        {
          id: "2",
          circulation_id: "c1",
          count: 20,
          completed_at: "2026-03-02T00:00:00Z",
          note: null,
          period: null,
        },
        {
          id: "3",
          circulation_id: "c1",
          count: 30,
          completed_at: "2026-03-03T00:00:00Z",
          note: null,
          period: null,
        },
      ];
      const result = calculateCirculationStats(logs);
      expect(result.totalCount).toBe(60);
      expect(result.avgCount).toBe(20);
    });
  });

  describe("getCirculationTrend", () => {
    it("should return array of 7 zeros for empty logs", () => {
      const result = getCirculationTrend([]);
      expect(result.length).toBe(7);
      expect(result.every((v: number) => v === 0)).toBe(true);
    });

    it("should return trend for specified days", () => {
      const today = new Date().toISOString().split("T")[0];
      const logs = [
        {
          id: "1",
          circulation_id: "c1",
          count: 5,
          completed_at: `${today}T10:00:00Z`,
          note: null,
          period: null,
        },
      ];
      const result = getCirculationTrend(logs, 3);
      expect(result.length).toBe(3);
      expect(result[2]).toBe(5);
    });
  });

  describe("getHighestCirculationDay", () => {
    it("should return null for empty logs", () => {
      expect(getHighestCirculationDay([])).toBeNull();
    });

    it("should return log with highest count", () => {
      const logs = [
        {
          id: "1",
          circulation_id: "c1",
          count: 10,
          completed_at: "2026-03-01T00:00:00Z",
          note: null,
          period: null,
        },
        {
          id: "2",
          circulation_id: "c1",
          count: 50,
          completed_at: "2026-03-02T00:00:00Z",
          note: null,
          period: null,
        },
        {
          id: "3",
          circulation_id: "c1",
          count: 30,
          completed_at: "2026-03-03T00:00:00Z",
          note: null,
          period: null,
        },
      ];
      const result = getHighestCirculationDay(logs);
      expect(result?.id).toBe("2");
    });
  });

  describe("getLowestCirculationDay", () => {
    it("should return null for empty logs", () => {
      expect(getLowestCirculationDay([])).toBeNull();
    });

    it("should return log with lowest count", () => {
      const logs = [
        {
          id: "1",
          circulation_id: "c1",
          count: 10,
          completed_at: "2026-03-01T00:00:00Z",
          note: null,
          period: null,
        },
        {
          id: "2",
          circulation_id: "c1",
          count: 50,
          completed_at: "2026-03-02T00:00:00Z",
          note: null,
          period: null,
        },
        {
          id: "3",
          circulation_id: "c1",
          count: 30,
          completed_at: "2026-03-03T00:00:00Z",
          note: null,
          period: null,
        },
      ];
      const result = getLowestCirculationDay(logs);
      expect(result?.id).toBe("1");
    });
  });
});
