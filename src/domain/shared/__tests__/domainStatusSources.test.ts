import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

describe("domain status type sources", () => {
  it("uses shared plan status aliases for plan inputs", () => {
    const source = readSource("src/domain/plan/planTypes.ts");

    expect(source).toContain("@/domain/shared/domainTypes");
    expect(source).not.toContain('"active" | "completed" | "archived"');
  });

  it("uses shared todo status aliases for todo inputs", () => {
    const source = readSource("src/domain/todo/todoTypes.ts");

    expect(source).toContain("@/domain/shared/domainTypes");
    expect(source).not.toContain('"pending" | "in-progress" | "done"');
  });
});
