import { describe, expect, it } from "vitest";

import { circulationKeys } from "@/domain/circulation/circulationQueries";

describe("circulationKeys", () => {
  it("includes circulation logs in subkeys", () => {
    expect(circulationKeys.circulationLogs("c1")).toEqual([
      "circulations",
      "c1",
      "logs",
    ]);
  });
});
