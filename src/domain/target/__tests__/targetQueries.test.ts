import { describe, expect, it } from "vitest";
import { targetKeys } from "@/domain/target/targetQueries";

describe("targetKeys", () => {
  it("includes tag and step subqueries", () => {
    expect(targetKeys.targetTags("t1")).toEqual(["targets", "t1", "tags"]);
    expect(targetKeys.targetSteps("t1")).toEqual(["targets", "t1", "steps"]);
  });
});
