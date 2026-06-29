import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

function pureLineCount(source: string): number {
  return source.split("\n").filter((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith("//");
  }).length;
}

describe("BatchActionBar structure", () => {
  it("keeps non-visual batch logic outside the JSX component", () => {
    const componentSource = readSource(
      "src/components/features/BatchActionBar.tsx",
    );

    expect(componentSource).toContain("useBatchActionController");
    expect(componentSource).not.toContain("useMutation");
    expect(componentSource).not.toContain("bulkUpdateTodos");
    expect(componentSource).not.toContain("bulkDeleteTodos");
    expect(pureLineCount(componentSource)).toBeLessThanOrEqual(250);
  });
});
