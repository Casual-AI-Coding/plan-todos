import { describe, expect, it, vi } from "vitest";
import { createEntitySideEffects } from "@/domain/shared/entityOperations";

describe("createEntitySideEffects", () => {
  it("writes entity tags through the provided adapter", async () => {
    const setEntityTags = vi.fn(async () => undefined);
    const sideEffects = createEntitySideEffects({
      setEntityTags,
      setNotificationSettings: vi.fn(async () => undefined),
      getNotificationSettings: vi.fn(async () => null),
    });

    await sideEffects.saveTags("todo", "todo-1", ["tag-1"]);

    expect(setEntityTags).toHaveBeenCalledWith("todo", "todo-1", ["tag-1"]);
  });
});
