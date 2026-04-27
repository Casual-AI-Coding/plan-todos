import { describe, expect, it } from "vitest";

import { areTagsEqual, arraysEqual } from "./compare";

describe("arraysEqual", () => {
  it("returns true for equal arrays", () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it("returns false for arrays with different lengths", () => {
    expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it("returns false for arrays with different values", () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it("returns true for two empty arrays", () => {
    expect(arraysEqual([], [])).toBe(true);
  });

  it("compares single-element arrays", () => {
    expect(arraysEqual(["a"], ["a"])).toBe(true);
    expect(arraysEqual(["a"], ["b"])).toBe(false);
  });
});

describe("areTagsEqual", () => {
  it("returns true for equal tag arrays", () => {
    expect(
      areTagsEqual(
        [{ id: "tag-1" }, { id: "tag-2" }],
        [{ id: "tag-1" }, { id: "tag-2" }],
      ),
    ).toBe(true);
  });

  it("returns false for tag arrays with different lengths", () => {
    expect(
      areTagsEqual([{ id: "tag-1" }], [{ id: "tag-1" }, { id: "tag-2" }]),
    ).toBe(false);
  });

  it("returns false for tag arrays with different ids", () => {
    expect(
      areTagsEqual(
        [{ id: "tag-1" }, { id: "tag-2" }],
        [{ id: "tag-1" }, { id: "tag-3" }],
      ),
    ).toBe(false);
  });

  it("returns true for two empty tag arrays", () => {
    expect(areTagsEqual([], [])).toBe(true);
  });
});
