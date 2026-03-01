// src/lib/services/circulationService.test.ts
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
        { id: "1", count: 10, date: "2026-03-01" },
        { id: "2", count: 20, date: "2026-03-02" },
        { id: "3", count: 30, date: "2026-03-03" },
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
      expect(result.every((v) => v === 0)).toBe(true);
    });

    it("should return trend for specified days", () => {
      const today = new Date().toISOString().split("T")[0];
      const logs = [{ id: "1", count: 5, date: today }];
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
        { id: "1", count: 10, date: "2026-03-01" },
        { id: "2", count: 50, date: "2026-03-02" },
        { id: "3", count: 30, date: "2026-03-03" },
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
        { id: "1", count: 10, date: "2026-03-01" },
        { id: "2", count: 50, date: "2026-03-02" },
        { id: "3", count: 30, date: "2026-03-03" },
      ];
      const result = getLowestCirculationDay(logs);
      expect(result?.id).toBe("1");
    });
  });
});
