import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTag,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getEntityTags,
  setEntityTags,
  getEntitiesByTag,
} from "@/lib/api/tags";
import type { Tag } from "@/lib/types";

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

describe("Tag API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    vi.clearAllMocks();
  });

  describe("getTag", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(getTag("tag-1")).rejects.toThrow(
        "This app must run in Tauri to get tag",
      );
    });

    it("should call invoke with get_tag command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockTag: Tag = {
        id: "tag-1",
        name: "Test",
        color: "#fff",
        description: null,
        created_at: "2024-01-01",
      };
      mockInvoke.mockResolvedValue(mockTag);

      const result = await getTag("tag-1");

      expect(mockInvoke).toHaveBeenCalledWith("get_tag", { id: "tag-1" });
      expect(result).toEqual(mockTag);
    });
  });

  describe("getTags", () => {
    it("should return empty array when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const result = await getTags();
      expect(result).toEqual([]);
    });

    it("should call invoke with get_tags command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue([]);
      await getTags();
      expect(mockInvoke).toHaveBeenCalledWith("get_tags");
    });
  });

  describe("createTag", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(createTag("Test")).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with create_tag command with all params", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue({
        id: "new-id",
        name: "Test",
        color: "#fff",
        description: "desc",
        created_at: "2024-01-01",
      });

      await createTag("Test", "#fff", "desc");

      expect(mockInvoke).toHaveBeenCalledWith("create_tag", {
        name: "Test",
        color: "#fff",
        description: "desc",
      });
    });

    it("should handle optional params", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue({});

      await createTag("Test");

      expect(mockInvoke).toHaveBeenCalledWith("create_tag", {
        name: "Test",
        color: null,
        description: null,
      });
    });
  });

  describe("updateTag", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(updateTag("tag-1", { name: "Updated" })).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with update_tag command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue({});

      await updateTag("tag-1", {
        name: "Updated",
        color: "#000",
        description: "new",
      });

      expect(mockInvoke).toHaveBeenCalledWith("update_tag", {
        id: "tag-1",
        name: "Updated",
        color: "#000",
        description: "new",
      });
    });
  });

  describe("deleteTag", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(deleteTag("tag-1")).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("should call invoke with delete_tag command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(undefined);
      await deleteTag("tag-1");
      expect(mockInvoke).toHaveBeenCalledWith("delete_tag", { id: "tag-1" });
    });
  });

  describe("getEntityTags", () => {
    it("should return empty array when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const result = await getEntityTags("todo", "entity-1");
      expect(result).toEqual([]);
    });

    it("should call invoke with get_entity_tags command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue([]);
      await getEntityTags("todo", "entity-1");
      expect(mockInvoke).toHaveBeenCalledWith("get_entity_tags", {
        entityType: "todo",
        entityId: "entity-1",
      });
    });
  });

  describe("setEntityTags", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(
        setEntityTags("todo", "entity-1", ["tag-1"]),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("should call invoke with set_entity_tags command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(undefined);
      await setEntityTags("todo", "entity-1", ["tag-1", "tag-2"]);
      expect(mockInvoke).toHaveBeenCalledWith("set_entity_tags", {
        entityType: "todo",
        entityId: "entity-1",
        tagIds: ["tag-1", "tag-2"],
      });
    });
  });

  describe("getEntitiesByTag", () => {
    it("should return empty array when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const result = await getEntitiesByTag("todo", ["tag-1"]);
      expect(result).toEqual([]);
    });

    it("should call invoke with get_entities_by_tag command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(["entity-1"]);
      const result = await getEntitiesByTag("todo", ["tag-1"]);
      expect(mockInvoke).toHaveBeenCalledWith("get_entities_by_tag", {
        entityType: "todo",
        tagIds: ["tag-1"],
      });
      expect(result).toEqual(["entity-1"]);
    });
  });
});
