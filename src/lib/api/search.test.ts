import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchAll } from "./search";
import type { SearchResult } from "@/lib/types";

// Mock the client module to control isTauri
vi.mock("@/lib/api/client", () => ({
  isTauri: vi.fn(),
}));

// Mock @tauri-apps/api/core
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

import { isTauri } from "@/lib/api/client";
import { invoke } from "@tauri-apps/api/core";

describe("searchAll", () => {
  const mockResults: SearchResult[] = [
    {
      entity_type: "todo",
      id: "todo-1",
      title: "Buy groceries",
      content: "Buy milk and bread",
      status: "pending",
    },
    {
      entity_type: "plan",
      id: "plan-1",
      title: "Weekend trip",
      content: "Plan a trip to the beach",
      status: "active",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: not in Tauri
    vi.mocked(isTauri).mockReturnValue(false);
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ========================================================================
  // Non-Tauri Environment Tests
  // ========================================================================
  describe("non-Tauri environment", () => {
    it("should return empty array when not in Tauri environment", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await searchAll("test query");

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Running outside Tauri - search not available",
      );
      consoleSpy.mockRestore();
    });

    it("should not call invoke when not in Tauri environment", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await searchAll("test query");

      expect(invoke).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should return empty array with empty query when not in Tauri", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await searchAll("");

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Running outside Tauri - search not available",
      );
      consoleSpy.mockRestore();
    });
  });

  // ========================================================================
  // Tauri Environment Tests
  // ========================================================================
  describe("Tauri environment", () => {
    beforeEach(() => {
      vi.mocked(isTauri).mockReturnValue(true);
      (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    });

    it("should call invoke with correct parameters when in Tauri", async () => {
      vi.mocked(invoke).mockResolvedValue(mockResults);

      const result = await searchAll("test query");

      expect(invoke).toHaveBeenCalledWith("search_all", {
        query: "test query",
      });
      expect(result).toEqual(mockResults);
    });

    it("should return search results from invoke", async () => {
      vi.mocked(invoke).mockResolvedValue(mockResults);

      const result = await searchAll("groceries");

      expect(result).toHaveLength(2);
      expect(result[0].entity_type).toBe("todo");
      expect(result[1].entity_type).toBe("plan");
    });

    it("should return empty array when invoke returns empty array", async () => {
      vi.mocked(invoke).mockResolvedValue([]);

      const result = await searchAll("nonexistent");

      expect(result).toEqual([]);
    });

    it("should pass empty string query to invoke", async () => {
      vi.mocked(invoke).mockResolvedValue([]);

      await searchAll("");

      expect(invoke).toHaveBeenCalledWith("search_all", { query: "" });
    });

    it("should handle invoke throwing an error", async () => {
      const error = new Error("Backend error");
      vi.mocked(invoke).mockRejectedValue(error);

      await expect(searchAll("test")).rejects.toThrow("Backend error");
    });

    it("should handle invoke throwing a string error", async () => {
      vi.mocked(invoke).mockRejectedValue("String error");

      await expect(searchAll("test")).rejects.toThrow("String error");
    });

    it("should handle invoke throwing null", async () => {
      vi.mocked(invoke).mockRejectedValue(null);

      await expect(searchAll("test")).rejects.toBeNull();
    });

    it("should handle search results with null content", async () => {
      const resultsWithNullContent: SearchResult[] = [
        {
          entity_type: "todo",
          id: "todo-1",
          title: "No content",
          content: null,
          status: "pending",
        },
      ];
      vi.mocked(invoke).mockResolvedValue(resultsWithNullContent);

      const result = await searchAll("test");

      expect(result).toHaveLength(1);
      expect(result[0].content).toBeNull();
    });

    it("should handle various entity types", async () => {
      const variousTypes: SearchResult[] = [
        {
          entity_type: "todo",
          id: "1",
          title: "T1",
          content: null,
          status: "pending",
        },
        {
          entity_type: "plan",
          id: "2",
          title: "P1",
          content: null,
          status: "active",
        },
        {
          entity_type: "target",
          id: "3",
          title: "TG1",
          content: null,
          status: "active",
        },
        {
          entity_type: "milestone",
          id: "4",
          title: "M1",
          content: null,
          status: "pending",
        },
        {
          entity_type: "task",
          id: "5",
          title: "TK1",
          content: null,
          status: "done",
        },
      ];
      vi.mocked(invoke).mockResolvedValue(variousTypes);

      const result = await searchAll("test");

      expect(result).toHaveLength(5);
      expect(result.map((r) => r.entity_type)).toEqual([
        "todo",
        "plan",
        "target",
        "milestone",
        "task",
      ]);
    });

    it("should handle various status values", async () => {
      const variousStatuses: SearchResult[] = [
        {
          entity_type: "todo",
          id: "1",
          title: "T1",
          content: null,
          status: "pending",
        },
        {
          entity_type: "todo",
          id: "2",
          title: "T2",
          content: null,
          status: "in-progress",
        },
        {
          entity_type: "todo",
          id: "3",
          title: "T3",
          content: null,
          status: "completed",
        },
        {
          entity_type: "plan",
          id: "4",
          title: "P1",
          content: null,
          status: "active",
        },
        {
          entity_type: "plan",
          id: "5",
          title: "P2",
          content: null,
          status: "completed",
        },
        {
          entity_type: "plan",
          id: "6",
          title: "P3",
          content: null,
          status: "archived",
        },
      ];
      vi.mocked(invoke).mockResolvedValue(variousStatuses);

      const result = await searchAll("test");

      expect(result).toHaveLength(6);
    });
  });

  // ========================================================================
  // Type Tests
  // ========================================================================
  describe("SearchResult type", () => {
    it("should have correct SearchResult structure", () => {
      const result: SearchResult = {
        entity_type: "todo",
        id: "test-id",
        title: "Test Title",
        content: "Test content",
        status: "pending",
      };

      expect(result.entity_type).toBe("todo");
      expect(result.id).toBe("test-id");
      expect(result.title).toBe("Test Title");
      expect(result.content).toBe("Test content");
      expect(result.status).toBe("pending");
    });

    it("should allow null content", () => {
      const result: SearchResult = {
        entity_type: "plan",
        id: "plan-1",
        title: "Test Plan",
        content: null,
        status: "active",
      };

      expect(result.content).toBeNull();
    });
  });
});
