import { describe, expect, it } from "vitest";
import { createEntityHooks } from "@/domain/shared/entityQueries";

describe("createEntityHooks", () => {
  it("exposes stable query keys for all and one", () => {
    const hooks = createEntityHooks({
      entityName: "todos",
      apiGetAll: async () => [],
      apiGetOne: async () => ({ id: "1" }),
      apiCreate: async () => ({ id: "1" }),
      apiUpdate: async () => ({ id: "1" }),
      apiDelete: async () => undefined,
    });

    expect(hooks.queryKeys.all).toEqual(["todos"]);
    expect(hooks.queryKeys.one("1")).toEqual(["todos", "1"]);
  });
});
