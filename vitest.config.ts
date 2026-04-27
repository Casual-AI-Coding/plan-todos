import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    // 测试超时设置
    testTimeout: 30000,
    hookTimeout: 30000,
    // 并行执行配置 (Vitest v4)
    pool: "forks", // forks 比 threads 更稳定，是默认值
    fileParallelism: true,
    maxWorkers: 4, // 固定 4 个 workers
    coverage: {
      provider: "v8",
      // 只生成text报告，减少I/O开销
      reporter: ["text", "json"],
      // 只对核心模块计算覆盖率，减少计算量
      include: ["src/lib/**", "src/hooks/**"],
      exclude: [
        "src/lib/api.ts", // Tauri API wrapper - requires Tauri runtime
        "src/lib/api/client.ts", // Tauri API helper - auxiliary module
        "src/lib/api/index.ts", // API re-exports - pure exports
        "src/lib/types/**", // Type definitions - pure types
        "**/*.d.ts", // 类型定义
        "**/index.ts", // 纯导出文件
        // Pure re-exports (no executable code, just `export { X } from "..."`)
        "src/hooks/useCirculations.ts",
        "src/hooks/useMilestones.ts",
        "src/hooks/usePlans.ts",
        "src/hooks/useTags.ts",
        "src/hooks/useTargets.ts",
        "src/hooks/useTodos.ts",
        "src/hooks/createEntityHooks.ts",
        "src/lib/services/validation.ts",
      ],
      // 90% threshold as per AGENTS.md (excluding Tauri-specific files)
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
