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
  isTauri: vi.fn(() => true),
  invoke: mockInvoke,
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
        data: {
          todos: [],
          plans: [],
          tasks: [],
          targets: [],
          steps: [],
          milestones: [],
          tags: [],
          entity_tags: [],
          settings: {
            daily_summary_settings: null,
            notification_plugins: [],
          },
        },
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
    const createMockExportData = (): ExportData => ({
      version: "1.0",
      exported_at: "2024-01-01T00:00:00Z",
      data: {
        todos: [],
        plans: [],
        tasks: [],
        targets: [],
        steps: [],
        milestones: [],
        tags: [],
        entity_tags: [],
        settings: {
          daily_summary_settings: null,
          notification_plugins: [],
        },
      },
    });

    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const mockData = createMockExportData();
      await expect(importData(mockData, "merge")).rejects.toThrow(
        "This app must run in Tauri to import data",
      );
    });

    it("should call invoke with import_data command when in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockData = createMockExportData();
      const mockResult: ImportResult = {
        imported: 10,
        skipped: 2,
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
      const mockData = createMockExportData();
      mockInvoke.mockResolvedValue({
        imported: 5,
        skipped: 0,
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
      const mockData = createMockExportData();
      mockInvoke.mockRejectedValue(new Error("Import failed"));
      await expect(importData(mockData, "merge" as ImportMode)).rejects.toThrow(
        "Import failed",
      );
    });
  });
});
