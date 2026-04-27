import { describe, expect, it } from "vitest";
import { planKeys } from "@/domain/plan/planQueries";

describe("planKeys", () => {
  it("includes tag and task subqueries", () => {
    expect(planKeys.planTags("p1")).toEqual(["plans", "p1", "tags"]);
    expect(planKeys.planTasks("p1")).toEqual(["plans", "p1", "tasks"]);
  });
});
