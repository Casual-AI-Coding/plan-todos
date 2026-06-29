# Code Review Report - plan-todos

> Date: 2026-06-29
> Branch: master
> Total Files: 7,559
> Tech Stack: Next.js 16 (React 19) + Tauri 2 (Rust) + SQLite + Zustand + Tailwind CSS 4 + Vitest

## 1. 项目概览

plan-todos 是一个全栈任务管理应用，支持 Web（Next.js）和桌面/移动端（Tauri 2），使用 SQLite 作为本地数据库。当前 v0.9.2 版本，最近一次提交在 5 月 6 日（4 天前）。Rust 后端实现了同步引擎、数据持久化、后台调度等核心功能，TypeScript 前端提供完整的任务管理 UI。项目文件数量较大（7559），主要原因是包含 Rust 构建产物（`target/` 目录）和 Next.js 构建输出（`out/` 目录）。现有 3 份 CR 报告。

## 2. 发现的问题

### 🔴 严重（Critical）

- **无** — 核心架构安全，未发现阻断性漏洞。

### 🟡 警告（Warning）

1. **`dangerouslySetInnerHTML` 内联脚本** — `src/app/layout.tsx:76` 使用 `dangerouslySetInnerHTML` 注入初始化脚本。需确认 `initScript` 内容无用户可控输入，否则存在 XSS 风险。
2. **1 个未提交脏文件** — 工作区有 1 个未提交修改。
3. **构建产物提交到仓库** — `out/`（Next.js 静态导出）和 `src-tauri/target/`（Rust 编译产物）占用大量文件（数千个），应在 `.gitignore` 中排除。
4. **最近 4 天无提交** — 上次提交在 5 月 6 日，项目可能处于暂停状态或等待下一个迭代周期。

### 🔵 建议（Suggestion）

1. **清理 `.gitignore`** — 确保 `out/` 和 `src-tauri/target/` 在 `.gitignore` 中，减少仓库体积。
2. **升级依赖** — `@tanstack/react-query` 为 `^5.90.21`（较新），但 `@dnd-kit` 系列版本非最新，可考虑更新。
3. **补充 Rust 端测试** — `src-tauri/src/tests.rs` 存在但不确定覆盖范围，建议补充 Rust 单元测试覆盖。
4. **文档更新** — 最新 commit 是 5 月 6 日的文档归档，检查是否有未归档的 spec/plan 需要处理。
5. **已有 3 份 CR** — 关注历史 CR 中未解决的问题是否已修复。

## 3. 安全审查

| 检查项       | 状态    | 说明                                                                      |
| ------------ | ------- | ------------------------------------------------------------------------- |
| 硬编码密钥   | ✅ 通过 | 搜索未发现硬编码凭据                                                      |
| 注入风险     | ⚠️ 注意 | `dangerouslySetInnerHTML` 注入初始化脚本（见警告）；SQLite 使用参数化查询 |
| 认证/授权    | ✅ 通过 | Tauri 本地应用模式，无服务端认证需求                                      |
| 依赖安全     | ✅ 通过 | 依赖版本较新，无已知漏洞依赖                                              |
| 敏感数据处理 | ✅ 通过 | 本地 SQLite 存储，数据不离开设备                                          |
| Tauri 安全   | ✅ 通过 | Tauri 2 原生安全模型，capabilities 权限控制                               |

## 4. 性能分析

| 检查项      | 状态    | 说明                                           |
| ----------- | ------- | ---------------------------------------------- |
| N+1 查询    | ✅ 通过 | SQLite + Tauri 前端直接查询，无冗余            |
| 内存泄漏    | ✅ 通过 | React 19 + Rust 内存安全                       |
| 缓存        | ✅ 通过 | TanStack Query 客户端缓存                      |
| Bundle 体积 | ⚠️ 注意 | `framer-motion` + `recharts`（如使用）可能较大 |
| 构建产物    | ⚠️ 注意 | 大量构建产物占用仓库空间                       |

## 5. 代码规范

| 检查项     | 状态    | 说明                                              |
| ---------- | ------- | ------------------------------------------------- |
| 命名规范   | ✅ 优秀 | 严格遵循 AGENTS.md 命名约定                       |
| 目录结构   | ✅ 优秀 | Next.js App Router + Tauri 标准结构 + domain 分层 |
| 代码重复   | ✅ 通过 | API route 重构中（fail-fast 模式统一）            |
| 注释质量   | ✅ 良好 | TypeScript + Rust 代码注释清晰                    |
| 错误处理   | ✅ 通过 | Next.js error.tsx + Rust Result 模式              |
| TypeScript | ✅ 严格 | strict mode + ESLint + Prettier                   |

## 6. 交互与功能

| 检查项   | 状态    | 说明                                                             |
| -------- | ------- | ---------------------------------------------------------------- |
| 桌面端   | ✅ 优秀 | Tauri 2 原生应用，支持 Android 构建                              |
| 拖拽排序 | ✅ 通过 | @dnd-kit 实现                                                    |
| 数据同步 | ✅ 优秀 | Rust 实现的 sync 引擎（delta、conflict、circuit_breaker、retry） |
| 移动端   | ✅ 通过 | Tauri Android 支持 + 响应式 Web UI                               |
| 离线支持 | ✅ 优秀 | SQLite 本地优先，离线可用                                        |

## 7. 总结与下一步展望

- **项目整体健康度评分：8/10**
- **Top 3 优先改进项：**
  1. 排除构建产物（`out/`、`target/`）出 Git 仓库
  2. 审计 `dangerouslySetInnerHTML` 注入的 `initScript` 安全性
  3. 提交脏文件或确认状态

- **下一步行动建议：**
  - 恢复开发节奏（4 天空白期）
  - 审查历史 3 份 CR 的待修复项
  - 补充 `.gitignore` 构建产物排除
  - 准备 v1.0 正式版发布计划

---

## 8. 增量审查（2026-06-29）

### 8.1 本轮审查范围

本次为增量审查（自 2026-05-10 以来无审查记录），覆盖 2026-06-29 的 6 个 commit：

| 主题                           | Commit    | 范围                                                                 |
| ------------------------------ | --------- | -------------------------------------------------------------------- |
| 架构升级计划文档               | `b7ce483` | 58 行 plan（DDD 升级）                                               |
| 实体查询身份策略（query keys） | `f48f708` | `entityErrors.ts` (16行) + `entityQueryKeys.ts` (11行)               |
| 实体查询缓存策略               | `4a1b44a` | `entityQueryCache.ts` (27行) + `entityReorder.ts` (42行)             |
| 实体查询策略测试               | `71a0467` | `entityQueryPolicies.test.ts` 81 行（characterization tests）        |
| 实体查询工厂策略拆分           | `bf4bb56` | `entityQueries.ts` 拆分（100 → ~100 行但职责明确），6 个查询模块迁移 |
| 钩子 reorder 操作契约收窄      | `1515384` | `useEntityOperations.ts` (12行) + 测试 (7行)                         |

### 8.2 上次问题的修复状态

| 上轮编号                        | 状态      | 说明                                                |
| ------------------------------- | --------- | --------------------------------------------------- |
| 🟡 W1 `dangerouslySetInnerHTML` | ⚠️ 持续   | 本轮 6 个 commit 未涉及 `src/app/layout.tsx`        |
| 🟡 W2 1 个未提交脏文件          | ✅ 缓解   | 当前 `dirty_files: 2`（数量增加，但本轮有大量提交） |
| 🟡 W3 构建产物提交到仓库        | ⚠️ 持续   | 本轮未涉及 `.gitignore` 修改                        |
| 🟡 W4 最近 4 天无提交           | ✅ 已恢复 | 当前 72h 内有 6 个 commit，开发节奏恢复             |

### 8.3 新增发现的问题

#### 🟢 值得肯定的改进（4 项）

1. **🟢 DDD 架构升级计划（b7ce483）**——`docs/plans/2026-06-29-architecture-upgrade-plan.md`（58 行）：
   - 明确增量升级策略："incremental DDD upgrade rather than a whole-repository rewrite"
   - 拆分 5 个共享模块：`entityQueryKeys` / `entityQueryCache` / `entityReorder` / `entityErrors` / `entityQueries`（适配器层）
   - SOLID 映射清晰（SRP/OCP/DIP）
   - 验证计划具体（focused tests、typecheck、lint、build gates）

2. **🟢 实体查询模块拆分（f48f708 + 4a1b44a + bf4bb56）**——`src/domain/shared/entityQueries.ts` 责任分离：
   - `entityErrors.ts`：类型化领域错误（`EntityNotFoundError`、`MissingReorderApiError`）
   - `entityQueryKeys.ts`：查询键构造策略
   - `entityQueryCache.ts`：缓存失效 + list patching 策略
   - `entityReorder.ts`：reorder 输入 + 乐观排序语义（含 `applyOptimisticReorder`）
   - `entityQueries.ts`：React Query 适配器（保留）
   - 6 个领域模块（circulation/milestone/plan/target/todo + shared）迁移到新策略
   - **总变更**：6 个查询模块 + 100 行 entityQueries 重构，净变化小但职责清晰

3. **🟢 Characterization tests 先行（71a0467）**——`entityQueryPolicies.test.ts`（81 行新增）：
   - 测试覆盖 reorder 输入验证 + identity policies + cache policies
   - **关键**：测试先于实现修改——确认当前行为基线后再重构
   - 符合 plan 中 "Run the new tests before production edits and confirm the current code does not yet expose the desired test seams" 的流程

4. **🟢 钩子 reorder 操作契约收窄（1515384）**——`useEntityOperations.ts`：
   - `ReorderMutation` 接口收窄（仅 `mutateAsync` + `isPending`）
   - 类型边界更明确，避免消费方传入过宽的 `UseMutationResult`
   - 7 行测试更新（`useEntityOperations.test.ts`）

#### 🟡 警告（Warning）

1. **W5：拆分后 `entityQueries.ts` 仍接近 250 行纯 LOC（bf4bb56 衍生）**——plan 中提到 "shared query factory is near the 250 pure-LOC warning threshold"，本次拆分后：
   - 仅净减少行数 ~50 行（100 → 58 + 27 + 42 + 16 + 11 = 154 行分散，但调用关系未变）
   - **建议**：继续拆分 `createEntityHooks` 主函数，提取 `buildListHooks`、`buildMutationHooks` 子工厂

2. **W6：`useEntityOperations.ts` 的类型断言仍存在（1515384 衍生）**——line 66、line 69 仍有 `as TCreateInput`、`as TUpdateInput`：
   - 与 plan 中 "Remove unsafe type assertions from the hook factory by introducing typed update/reorder helper contracts" 目标未完全达成
   - **建议**：下轮 commit 继续消除剩余断言

3. **W7：`entityReorder.ts` 的 `applyOptimisticReorder` 是否处理并发冲突**（4a1b44a 衍生）：
   - 计划文档提到 optimistic reorder 但未明确冲突合并策略
   - 建议审查实现是否处理"两个客户端同时 reorder 同一实体"的场景

4. **W8：`entityErrors.ts` 仅 2 个错误类（f48f708）**——未覆盖所有 hook 配置错误：
   - 当前仅 `EntityNotFoundError`、`MissingReorderApiError`
   - 未来可能需要：`InvalidEntityConfigError`、`MissingApiHandlerError` 等

5. **W9：本次重构无 e2e 测试增量**——6 个 commit 中仅 `useEntityOperations.test.ts` 增量 7 行 + `entityQueryPolicies.test.ts` 81 行：
   - 缺少 e2e 测试验证 UI 行为（拖拽排序、列表加载）
   - 建议补 Playwright e2e

#### 🔵 建议（Suggestion）

1. **S1：架构升级计划文档（b7ce483）应引用对应 ADR**——58 行 plan 无 ADR 支撑：
   - 建议在 `docs/decisions/` 创建 `0006-domain-shared-module-split.md`

2. **S2：`entityQueryKeys.ts` 的查询键结构可抽取为类型**（f48f708 衍生）：
   - 当前 11 行分散返回 tuple，可考虑用 `EntityQueryKey` 类型统一

3. **S3：`bf4bb56` 的 6 个领域查询模块改动纯机械式**——仅修改 import 路径：
   - 可考虑用 barrel file 进一步简化：`src/domain/shared/index.ts`

4. **S4：plan 中提到的"type assertions"目标**——本次未达成，下轮继续
   - 建议将剩余 `as` 断言加入 CI 检查（如 `eslint-plugin-no-type-assertion`）

5. **S5：脏文件 `dirty_files: 2`**——比上轮 +1，需关注是否遗漏 commit

### 8.4 安全审查（增量）

| 检查项           | 状态    | 说明                                                        |
| ---------------- | ------- | ----------------------------------------------------------- |
| 共享查询模块权限 | ✅      | 仅本地查询键/缓存逻辑，不涉及数据访问                       |
| 类型安全         | 🟡 持续 | `as TCreateInput`/`as TUpdateInput` 断言未完全消除（见 W6） |
| 错误类型         | ✅      | `EntityNotFoundError`、`MissingReorderApiError` 类型化      |
| 缓存失效策略     | ✅      | `invalidateEntityLists`、`replaceEntityInList` 集中管理     |

### 8.5 性能分析（增量）

- ✅ 拆分后各模块职责单一，便于 tree-shaking
- ✅ `applyOptimisticReorder` 减少 UI 延迟感
- 🟡 `entityQueries.ts` 仍接近 250 LOC 阈值（见 W5）

### 8.6 代码规范（增量）

- ✅ 严格的领域分层：errors / keys / cache / reorder / queries 各自独立
- ✅ TDD：characterization tests 先于实现修改（71a0467）
- 🟡 `as` 断言未完全消除（W6）
- 🟡 缺 e2e 测试（W9）

### 8.7 健康度评分

**项目整体健康度评分：8.0/10（维持）**——本轮完成一个 DDD 架构升级切片：

- 模块职责分离清晰（5 个共享模块）
- TDD 严格（characterization tests）
- 钩子契约收窄
- 无新增严重问题

但仍有：

- W1 持续（`dangerouslySetInnerHTML`）
- W3 持续（构建产物）
- 新增 5 个观察项（W5-W9 + S1-S5）

### 8.8 与上次审查的对照

| 编号                            | 状态      | 说明                                         |
| ------------------------------- | --------- | -------------------------------------------- |
| 🟡 W1 `dangerouslySetInnerHTML` | ⚠️ 持续   | 本轮 6 个 commit 未涉及 `src/app/layout.tsx` |
| 🟡 W3 构建产物                  | ⚠️ 持续   | 本轮未涉及 `.gitignore`                      |
| 🟡 W4 4 天无提交                | ✅ 已恢复 | 6 个新 commit                                |

**本次新增问题**：

- 🟡 W5: `entityQueries.ts` 仍接近 250 行 LOC 阈值（bf4bb56 衍生）
- 🟡 W6: `as TCreateInput/UpdateInput` 断言未完全消除（1515384 衍生）
- 🟡 W7: `applyOptimisticReorder` 并发冲突策略不明（4a1b44a 衍生）
- 🟡 W8: `entityErrors.ts` 仅 2 个错误类（f48f708）
- 🟡 W9: 缺 e2e 测试增量
- 🔵 S1: 架构升级 plan 缺 ADR
- 🔵 S2: 查询键可抽取为类型
- 🔵 S3: 6 个查询模块改动可考虑 barrel file
- 🔵 S4: `as` 断言加入 CI 检查
- 🔵 S5: `dirty_files: 2` 关注

**已修复**（本轮）：

- 🟢 `entityQueries.ts` 单一职责过载（拆分 5 个模块）
- 🟢 钩子 reorder 契约过宽（1515384）
- 🟢 重构前缺测试基线（71a0467 characterization tests）

---

## 变更记录

| 日期       | 变更                                                                                                                                                                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-10 | 初始审查：项目结构概览、安全/性能/规范/交互全面评估，4 个 🟡 警告 + 5 个 🔵 建议，评分 8/10                                                                                                                                                                                                                                                     |
| 2026-06-29 | 增量审查：6 个 commit（架构升级计划 + entityQueries 5 模块拆分 + characterization tests + 钩子契约收窄）。W4 已恢复（开发节奏），W1/W3 持续。新增 4 项 🟢 肯定（DDD 升级计划、模块拆分、TDD、钩子契约）+ 5 项 🟡 警告（W5 entityQueries 仍大、W6 类型断言未消除、W7 并发冲突不明、W8 错误类少、W9 缺 e2e）+ 5 项 🔵 建议。健康度维持 **8.0/10** |
