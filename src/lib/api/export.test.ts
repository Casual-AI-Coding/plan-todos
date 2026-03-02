import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportData, importData } from "@/lib/api/export";
import type { ExportData, ImportResult, ImportMode } from "@/lib/types";

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

vi.mock("@/lib/api/client", () => ({
  isTauri: vi.fn(),
}));

import { isTauri } from "@/lib/api/client";

describe("Export API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    vi.clearAllMocks();
  });

  describe("exportData", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(exportData()).rejects.toThrow(
        "This app must run in Tauri to export data",
      );
    });

    it("should call invoke with export_data command when in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockExportData: ExportData = {
        version: "1.0",
        exported_at: "2024-01-01T00:00:00Z",
        todos: [],
        plans: [],
        tasks: [],
        targets: [],
        steps: [],
        milestones: [],
        circulations: [],
        tags: [],
        settings: [],
      };
      mockInvoke.mockResolvedValue(mockExportData);

      const result = await exportData();

      expect(mockInvoke).toHaveBeenCalledWith("export_data");
      expect(result).toEqual(mockExportData);
    });

    it("should handle invoke error", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockRejectedValue(new Error("Export failed"));
      await expect(exportData()).rejects.toThrow("Export failed");
    });
  });

  describe("importData", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const mockData: ExportData = {
        version: "1.0",
        exported_at: "2024-01-01T00:00:00Z",
        todos: [],
        plans: [],
        tasks: [],
        targets: [],
        steps: [],
        milestones: [],
        circulations: [],
        tags: [],
        settings: [],
      };
      await expect(importData(mockData, "merge")).rejects.toThrow(
        "This app must run in Tauri to import data",
      );
    });

    it("should call invoke with import_data command when in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockData: ExportData = {
        version: "1.0",
        exported_at: "2024-01-01T00:00:00Z",
        todos: [],
        plans: [],
        tasks: [],
        targets: [],
        steps: [],
        milestones: [],
        circulations: [],
        tags: [],
        settings: [],
      };
      const mockResult: ImportResult = {
        success: true,
        imported_counts: {
          todos: 0,
          plans: 0,
          tasks: 0,
          targets: 0,
          steps: 0,
          milestones: 0,
          circulations: 0,
          tags: 0,
          settings: 0,
        },
        errors: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await importData(mockData, "merge" as ImportMode);

      expect(mockInvoke).toHaveBeenCalledWith("import_data", {
        data: mockData,
        mode: "merge",
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle replace mode", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockData: ExportData = {
        version: "1.0",
        exported_at: "2024-01-01T00:00:00Z",
        todos: [],
        plans: [],
        tasks: [],
        targets: [],
        steps: [],
        milestones: [],
        circulations: [],
        tags: [],
        settings: [],
      };
      mockInvoke.mockResolvedValue({
        success: true,
        imported_counts: {},
        errors: [],
      });

      await importData(mockData, "replace" as ImportMode);

      expect(mockInvoke).toHaveBeenCalledWith("import_data", {
        data: mockData,
        mode: "replace",
      });
    });

    it("should handle invoke error", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockData: ExportData = {
        version: "1.0",
        exported_at: "2024-01-01T00:00:00Z",
        todos: [],
        plans: [],
        tasks: [],
        targets: [],
        steps: [],
        milestones: [],
        circulations: [],
        tags: [],
        settings: [],
      };
      mockInvoke.mockRejectedValue(new Error("Import failed"));
      await expect(importData(mockData, "merge" as ImportMode)).rejects.toThrow(
        "Import failed",
      );
    });
  });
});
