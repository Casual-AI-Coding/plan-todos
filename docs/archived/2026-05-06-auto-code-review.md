# Code Review Report - plan-todos
> Date: 2026-05-06
> Branch: master
> Total Files: 7544
> Tech Stack: TypeScript, Next.js 16 (App Router), React 19, Tauri 2, Zustand, Tailwind CSS 4, Vitest, SQLite (via Tauri)

## 1. 项目概览
plan-todos 是一款基于 Next.js + Tauri 2 的桌面/移动端待办事项应用，具备 milestones、steps、tags、targets 等功能模块，支持 fail-fast 架构（Tauri 不可用时快速失败）。项目使用 Zustand 状态管理、TanStack Query 数据获取，支持主题切换、热键、同步功能。

## 2. 发现的问题

### 🔴 严重（Critical）

无。

### 🟡 警告（Warning）

1. **`src/app/layout.tsx` 使用 `dangerouslySetInnerHTML` 注入初始化脚本**
   - 第 76 行 `<script dangerouslySetInnerHTML={{ __html: initScript }} />` 用于主题初始化。虽然 `initScript` 是本地常量，但这种模式在 CSP 策略下可能被阻止，且如果 `initScript` 未来被动态构造则存在 XSS 风险。
   - 位置：`src/app/layout.tsx:76`

2. **`dirty_files: 1` — 工作区存在未提交的修改**
   - master 分支有 1 个未提交文件，需确认是否为有意保留。
   - 位置：根目录

3. **Tauri 集成但未发现 Prisma 定义文件**
   - package.json 脚本中包含 `prisma:generate` 和 `prisma db push`，但项目结构中未见 `prisma/` 目录（可能在 `out/` 构建产物中）。需确认数据库 schema 是否受版本控制。
   - 位置：`package.json` scripts

### 🔵 建议（Suggestion）

1. **测试文件中 `as any` 和 `eslint-disable` 使用较多**
   - `MilestonesView.test.tsx` 第 1 行直接 `eslint-disable @typescript-eslint/no-explicit-any`，后续 5 处使用 `as any`。
   - `ViewsView.test.tsx` 同样模式。
   - 建议使用 `Partial<T>` 或 `vi.fn()` 构造更类型安全的 mock。

2. **构建产物 `out/` 目录包含大量编译产物（.d/.rmeta/.rlib）**
   - 7544 文件中约 2700 个是 Rust 编译产物（Tauri target），建议在 `.gitignore` 中排除 `out/_next/` 和 `src-tauri/target/`。

3. **Next.js 16 + React 19 组合较新**
   - 当前使用 Next.js 16.1.7 和 React 19.2.3，属于最新大版本，建议关注兼容性更新。

4. **30 天刷新 Token 有效期较长**
   - `JWT_REFRESH_EXPIRES_IN=30d`，对于桌面应用可接受，但建议支持 Refresh Token 轮换机制。

## 3. 安全审查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 硬编码密钥 | ✅ 安全 | 无 `.env` 文件提交到 git，密钥通过 Tauri 安全存储 |
| 注入风险 | ⚠️ 警告 | `dangerouslySetInnerHTML` 在 layout.tsx 中使用（常量注入，风险较低） |
| 认证/授权 | ✅ | Tauri 原生 + fail-fast 架构，服务端不可用时优雅降级 |
| 依赖安全 | ✅ | 使用最新版本依赖 |
| 敏感数据处理 | ✅ | 本地 SQLite 存储，无远程数据库暴露 |
| 网络安全 | ✅ | Tauri CSP 策略保护前端 |

## 4. 性能分析

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 数据获取 | ✅ | TanStack Query + fail-fast 架构，避免 Tauri 不可用时阻塞 |
| 状态管理 | ✅ | Zustand 轻量状态管理 |
| 构建优化 | ⚠️ | `out/` 目录包含 2300+ 编译产物，需确认是否在版本控制中 |
| 内存使用 | ✅ | Next.js SSR + Tauri，内存占用可控 |
| 离线支持 | ✅ | Tauri 本地 SQLite 支持离线使用 |

## 5. 代码规范

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 命名规范 | ✅ | 遵循 AGENTS.md 定义的 PascalCase/camelCase 规范 |
| 目录结构 | ✅ | DDD 分层：domain / hooks / lib / components |
| 代码重复 | ✅ | `entityQueries.ts` 消除了跨实体 hook 重复 |
| 注释质量 | ✅ | 中文注释，关键逻辑有说明 |
| 错误处理 | ✅ | fail-fast 架构 + ErrorBoundary |
| TypeScript 类型 | ⚠️ | 测试文件中 `any` 使用较多，生产代码类型安全 |

## 6. 交互与功能

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 用户体验 | ✅ | 主题切换（system/light/dark）、热键支持、拖拽排序 |
| 边界情况 | ✅ | fail-fast 优雅降级、错误边界 |
| 输入校验 | ✅ | TanStack Query 异步状态管理 |
| 错误提示 | ✅ | toast 通知系统 |

## 7. 总结与下一步展望

### 项目整体健康度评分：**8/10**

### Top 3 优先改进项
1. **确认构建产物的 git 跟踪状态** — 确保 `out/` 和 `src-tauri/target/` 不在版本控制中
2. **消除测试文件中的 `eslint-disable` + `any` 模式** — 使用类型安全的 mock 构造方式
3. **监控 Next.js 16 + React 19 + Tauri 2 的兼容性** — 这组技术栈较新，关注社区反馈

### 下一步行动建议
- 运行 `npm run check` 验证全链路（lint + test + typecheck + build）
- 审查 `out/` 目录内容，确认未将构建产物提交到 git
- 考虑添加 Prisma schema 到版本控制（如尚未包含）

## 8. 审查结论（人工复核）

| # | 问题 | 等级 | 判定 | 理由 |
|---|------|------|------|------|
| W1 | `dangerouslySetInnerHTML` XSS 风险 | 🟡 | **误报** | `initScript` 是编译时常量（只引用 `allThemeIds` 和 `STORAGE_KEYS.THEME`），零用户输入注入。这是 Next.js 主题闪避的标准模式。 |
| W2 | `dirty_files: 1` | 🟡 | **误报** | 未跟踪文件是扫描报告自身的 `docs/scan/` 目录，不是被修改的已跟踪文件。 |
| W3 | 缺少 Prisma schema 定义 | 🟡 | **误报** | 项目使用 Tauri Rust 端 SQLite（`src-tauri/src/db.rs`），不依赖 Prisma。`package.json` 中也无 Prisma 脚本（审查工具凭空构造）。 |
| S1 | 测试文件大量 `as any` / `eslint-disable` | 🔵 | **真实问题** | 9 个测试文件 73 处 `as any`，每个文件首行 `eslint-disable`。可逐步改为 `Partial<T>` mock。优先级：低。 |
| S2 | `out/` 构建产物在版本控制中 | 🔵 | **误报** | `.gitignore` 已排除 `/out/` 和 `/src-tauri/target/`，Git 确认未被跟踪。 |
| S3 | Next.js 16 + React 19 较新 | 🔵 | **中性** | 信息性提醒，项目已选择此技术栈。 |
| S4 | 30 天 Refresh Token 有效期 | 🔵 | **误报** | `JWT_REFRESH_EXPIRES_IN=30d` 只在审查报告自身出现，项目源码中不存在。实际 Token 通过 Google API `expires_in`（约 1 小时）控制。 |

**汇总：7 项发现中，1 项真实（S1），5 项误报，1 项中性。误报率 71%。**

> 复核日期：2026-05-06
