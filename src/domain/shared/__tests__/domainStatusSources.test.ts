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

  it("uses canonical Rust todo status validation sources", () => {
    const validationSource = readSource("src-tauri/src/commands/validation.rs");
    const batchSource = readSource("src-tauri/src/commands/batch.rs");

    expect(validationSource).toContain("todo_status::TODO_STATUSES");
    expect(batchSource).toContain("todo_status::validate_todo_status");
    expect(validationSource).not.toContain(
      '["pending", "in-progress", "completed", "cancelled"]',
    );
    expect(batchSource).not.toContain(
      '["pending", "in-progress", "done", "archived"]',
    );
    expect(batchSource).not.toContain("bulk_archive_todos");
    expect(batchSource).not.toContain("UPDATE todos SET status = 'archived'");
  });
});
