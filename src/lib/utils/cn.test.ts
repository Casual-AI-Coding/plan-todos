import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("returns a single class name", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("joins multiple class names with spaces", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("returns an empty string when called without arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns an empty string when all values are falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
