import { describe, expect, it } from "vitest";

import { tagKeys } from "@/domain/tag/tagQueries";

describe("tagKeys", () => {
  it("uses tag root keys", () => {
    expect(tagKeys.tags).toEqual(["tags"]);
  });
});
