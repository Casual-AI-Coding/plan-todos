# Code Review Report - plan-todos

> Date: 2026-05-08
> Branch: master
> Total Files: 7,546
> Tech Stack: TypeScript (194), React/TSX (192), Rust (93), Next.js + Tauri + SQLite

## 1. 项目概览

plan-todos 是一个全栈计划与任务管理应用，结合 Next.js 前端和 Tauri 桌面端（Rust 后端），实现跨平台的任务、目标、计划管理。

- **前端**: Next.js 16 + React 19 + Tailwind CSS 4 + Zustand
- **桌面端**: Tauri 2.x + Rust + SQLite (rusqlite)
- **测试**: Vitest (前端) + Rust tests
- **版本**: v0.9.2，活跃开发中

7,546 个文件中大量为 Tauri Rust 编译产物（`target/` 下 4000+），实际源码约 500 文件。

## 2. 发现的问题

### 🔴 严重（Critical）

1. **TODO 状态值三处不一致！** — 这是一个数据完整性问题
   - `src-tauri/src/commands/batch.rs:9`: `["pending", "in-progress", "done", "archived"]`
   - `src-tauri/src/commands/validation.rs:4`: `["pending", "in-progress", "completed", "cancelled"]`
   - `src/domain/shared/domainTypes.ts:62`: `["pending", "in-progress", "done"]` (as const)
   - **`batch.rs` 允许 `"done"` 和 `"archived"`，但 `validation.rs` 报告的错误信息却使用 `"completed"` 和 `"cancelled"`**
   - **前端的 `TODO_STATUSES` 不包含 `"archived"`**
   - **影响**: 如果后端 batch 接口使用 batch.rs 的校验（允许 "done"/"archived"），但前端根据 domainTypes 定义（只有 "pending"/"in-progress"/"done"），状态同步会出错。Rust 的 validation.rs 也可能被其他命令调用，产生不一致校验。
   - **建议**: 统一到单一真相源（推荐 `"pending", "in-progress", "done", "archived"`），删除 validation.rs 中的旧值，或废弃 validation.rs

2. **Batch 操作缺少事务** — `batch.rs` 中所有批量更新在循环中逐条执行 SQL，但没有包裹在事务中
   - 如果中途失败，部分记录已更新，无法回滚
   - **建议**: 使用 `conn.execute("BEGIN")` / `conn.execute("COMMIT")` 或 `conn.execute_batch()` 包裹

### 🟡 警告（Warning）

1. **通知插件均为空壳实现** — 三个通知插件全部标记为 `TODO`
   - `feishu.rs:51`: `// TODO: 实际发送 HTTP 请求`
   - `dingtalk.rs:51`: `// TODO: 实际发送 HTTP 请求`
   - `webhook.rs:51`: `// TODO: 实际发送 HTTP 请求`
   - 当前 `send()` 方法仅打印日志并返回 `success: true`，实际上没有发送任何通知
   - **影响**: 用户以为通知已发送，但实际上静默失败
   - **建议**: 要么实现真实发送逻辑，要么返回明确的状态（如 `SendResult { success: false, message: "功能开发中" }`）

2. **`bulk_delete_plans` 未使用事务且先删 tasks 再删 plans** — `batch.rs:425-426`
   - 如果删除 plans 失败（如已被其他操作删除），tasks 已被删除但无回滚
   - **建议**: 使用事务 + 外键 ON DELETE CASCADE 替代手动级联删除

3. **`dead_code` 属性在通知插件中** — `feishu.rs:27`: `#[allow(dead_code)] pub app_secret: Option<String>`
   - 字段从未使用，说明实现不完整
   - **建议**: 完成实现后移除 `#[allow(dead_code)]`

4. **`bulk_update_todos` 中动态 SQL 拼接** — `batch.rs:305`
   ```rust
   let sql = format!("UPDATE todos SET {} WHERE id = ?", set_clauses.join(", "));
   ```

   - `set_clauses` 来自硬编码字符串，当前无注入风险，但使用了 `format!` 而非参数化占位符，是潜在风险模式
   - **建议**: 虽然 `set_clauses` 当前安全，但最佳实践是避免任何动态 SQL 拼接

### 🔵 建议（Suggestion）

1. **`VALID_TODO_STATUSES` 和 `TODO_STATUSES` 定义重复** — Rust batch.rs、Rust validation.rs、TypeScript domainTypes 各有定义
   - **建议**: 使用 Tauri command 返回统一常量，或通过 shared types package 统一

2. **前端 `domain/todo/todoService.ts:46` 使用类型转换** — `(TODO_STATUSES as readonly string[]).includes(status)`
   - 因为 `TODO_STATUSES` 是 `readonly` tuple，需要使用类型断言
   - **建议**: 使用类型守卫函数替代 `includes`

3. **Cargo 编译产物在项目内** — `src-tauri/target/` 包含千余编译产物文件
   - **建议**: 确保 `.gitignore` 正确排除 `target/` 目录

## 3. 安全审查

| 检查项   | 状态 | 说明                                                                |
| -------- | ---- | ------------------------------------------------------------------- |
| SQL 注入 | ⚠️   | `bulk_update_todos` 使用 `format!` 拼接 SQL（当前安全但模式不推荐） |
| 输入验证 | ✅   | 状态/优先级均有枚举校验                                             |
| 认证     | N/A  | 本地应用，无网络认证需求                                            |
| 数据暴露 | ✅   | SQLite 本地数据库，数据不离开设备                                   |
| 命令注入 | ✅   | Tauri command 参数均由 Rust 类型系统约束                            |

## 4. 性能分析

- **Batch 操作 N+1 问题**: `batch.rs` 中循环逐条 UPDATE，对于大量 ID（如 100+），性能较差
  - **建议**: 使用 `WHERE id IN (...)` + 批量参数替代循环
- **SQLite 锁**: `state.db.lock()` 在整个 batch 操作期间持有锁，若操作耗时会阻塞其他请求
  - **建议**: 考虑使用 WAL 模式 + 连接池

## 5. 代码规范

| 检查项              | 状态 | 说明                               |
| ------------------- | ---- | ---------------------------------- |
| Rust 代码质量       | ⚠️   | 状态常量重复定义、TODO 未完成      |
| TypeScript 代码质量 | ✅   | 领域驱动设计清晰                   |
| 错误处理            | ✅   | 使用 `Result<T, String>` + `match` |
| 文档                | ✅   | AGENTS.md + docs/ 文档体系完善     |
| 测试                | ✅   | 前后端均有测试覆盖                 |

## 6. 交互与功能

- **任务管理**: 完整的 CRUD + 批量操作
- **层级结构**: Plan → Task → Step 三级管理
- **通知系统**: 飞书/钉钉/Webhook 通知（但未实现！）
- **设置面板**: 数据备份设置集成
- **Tauri 桌面端**: 原生窗口 + 系统通知能力

## 7. 总结与下一步展望

- **健康度评分**: 6.5/10
- **Top 3 优先改进项**:
  1. **紧急**: 统一 TODO 状态值定义，消除三处不一致
  2. **高优**: 为批量操作添加事务包裹
  3. **高优**: 实现或明确标记通知插件为 WIP（不要让静默失败）

- **下一步行动**:
  - 统一状态枚举到单一源（建议在所有 Rust 模块中共用 `validation.rs` 的常量，或删除 validation.rs 改为引用 batch.rs）
  - 实现通知插件或返回明确失败状态
  - 批量 SQL 操作改用 `IN` 子句 + 事务
