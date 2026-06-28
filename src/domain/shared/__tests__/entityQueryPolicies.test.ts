import { describe, expect, it } from "vitest";

import { EntityNotFoundError, MissingReorderApiError } from "../entityErrors";
import { replaceEntityInList } from "../entityQueryCache";
import { createEntityQueryKeys } from "../entityQueryKeys";
import { applyOptimisticReorder } from "../entityReorder";

type QueryTestEntity = {
  readonly id: string;
  readonly title: string;
  readonly sort_order?: number;
};

describe("entity query policies", () => {
  it("builds stable all and item query keys", () => {
    const keys = createEntityQueryKeys("todos");

    expect(keys.all).toEqual(["todos"]);
    expect(keys.one("todo-1")).toEqual(["todos", "todo-1"]);
  });

  it("replaces matching cached entities without changing other rows", () => {
    const existing: readonly QueryTestEntity[] = [
      { id: "todo-1", title: "Draft", sort_order: 1 },
      { id: "todo-2", title: "Review", sort_order: 2 },
    ];

    const result = replaceEntityInList(existing, {
      id: "todo-2",
      title: "Reviewed",
      sort_order: 2,
    });

    expect(result).toEqual([
      { id: "todo-1", title: "Draft", sort_order: 1 },
      { id: "todo-2", title: "Reviewed", sort_order: 2 },
    ]);
  });

  it("returns undefined when there is no cached entity list to patch", () => {
    expect(
      replaceEntityInList<QueryTestEntity>(undefined, {
        id: "todo-1",
        title: "Draft",
      }),
    ).toBeUndefined();
  });

  it("applies optimistic reorder and sorts by the new order values", () => {
    const existing: readonly QueryTestEntity[] = [
      { id: "todo-1", title: "One", sort_order: 1 },
      { id: "todo-2", title: "Two", sort_order: 2 },
      { id: "todo-3", title: "Three", sort_order: 3 },
    ];

    const result = applyOptimisticReorder(existing, [
      { id: "todo-1", sort_order: 3 },
      { id: "todo-3", sort_order: 1 },
    ]);

    expect(result).toEqual([
      { id: "todo-3", title: "Three", sort_order: 1 },
      { id: "todo-2", title: "Two", sort_order: 2 },
      { id: "todo-1", title: "One", sort_order: 3 },
    ]);
  });

  it("uses typed errors for entity lookup and hook configuration failures", () => {
    const notFound = new EntityNotFoundError("todos", "todo-1");
    const missingReorderApi = new MissingReorderApiError("todos");

    expect(notFound).toBeInstanceOf(Error);
    expect(notFound.message).toBe('todos with id "todo-1" not found');
    expect(notFound.entityName).toBe("todos");
    expect(notFound.entityId).toBe("todo-1");
    expect(missingReorderApi.message).toBe(
      'useReorder requires apiReorder in config for "todos".',
    );
    expect(missingReorderApi.entityName).toBe("todos");
  });
});
