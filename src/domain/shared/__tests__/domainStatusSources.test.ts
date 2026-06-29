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
    const batchTodoSource = readSource("src-tauri/src/commands/batch/todo.rs");

    expect(validationSource).toContain("todo_status::TODO_STATUSES");
    expect(batchTodoSource).toContain("todo_status::validate_todo_status");
    expect(validationSource).not.toContain(
      '["pending", "in-progress", "completed", "cancelled"]',
    );
    expect(batchSource).not.toContain(
      '["pending", "in-progress", "done", "archived"]',
    );
    expect(batchSource).not.toContain("bulk_archive_todos");
    expect(batchSource).not.toContain("UPDATE todos SET status = 'archived'");
  });

  it("keeps frontend validation statuses inside the domain boundary", () => {
    const configSource = readSource("src/config/constants.ts");
    const validationSource = readSource("src/domain/shared/validation.ts");

    expect(validationSource).toContain("@/domain/shared/domainTypes");
    expect(validationSource).not.toContain("@/config/constants");
    expect(configSource).not.toContain("VALID_STATUSES");
    expect(configSource).not.toContain("in_progress");
    expect(configSource).not.toContain("cancelled");
  });

  it("keeps Rust batch command ownership split by aggregate", () => {
    const batchSource = readSource("src-tauri/src/commands/batch.rs");

    expect(batchSource).toContain("mod todo;");
    expect(batchSource).toContain("mod plan;");
    expect(batchSource).toContain("mod target;");
    expect(batchSource).toContain("mod task;");
    expect(batchSource).not.toContain("UPDATE todos SET");
    expect(batchSource).not.toContain("DELETE FROM plans");
    expect(batchSource).not.toContain("DELETE FROM targets");
  });
});
