import { describe, expect, it } from "vitest";

import { milestoneKeys } from "@/domain/milestone/milestoneQueries";

describe("milestoneKeys", () => {
  it("uses milestone root keys", () => {
    expect(milestoneKeys.milestones).toEqual(["milestones"]);
  });
});
