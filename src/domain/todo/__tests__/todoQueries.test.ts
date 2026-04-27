import { describe, expect, it } from "vitest";

import { todoKeys } from "@/domain/todo/todoQueries";
import { todoDomainService } from "@/domain/todo/todoService";

describe("todoKeys", () => {
  it("creates stable todo query keys", () => {
    expect(todoKeys.todos).toEqual(["todos"]);
    expect(todoKeys.todo("abc")).toEqual(["todos", "abc"]);
  });
});

describe("todoDomainService", () => {
  it("builds reorder payloads from ordered todos", () => {
    const payload = todoDomainService.toReorderInput([
      { id: "a", sort_order: 3 },
      { id: "b", sort_order: 8 },
    ]);

    expect(payload).toEqual([
      { id: "a", sort_order: 0 },
      { id: "b", sort_order: 1 },
    ]);
  });
});
