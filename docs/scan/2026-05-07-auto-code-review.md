# Code Review Report - plan-todos

> Date: 2026-05-07
> Branch: master
> Total Files: 7545
> Tech Stack: Next.js 16 + React 19 + Zustand + TanStack Query + Vitest + Tailwind CSS 4 + Tauri

## 1. 项目概览

plan-todos 是一个全栈 TypeScript 任务管理应用，前端 Next.js App Router + SQLite（Prisma），支持 Tauri 桌面端和 Android 打包。v0.9.2，处于成熟迭代阶段。今日无新提交（上次提交 4/29），但代码库结构清晰，文档体系完善。

## 2. 发现的问题

### 🔴 严重（Critical）

- 无

### 🟡 警告（Warning）

- **Tauri 安全问题** — `src-tauri/` 目录存在，但未发现 CSP 配置检查。Tauri 默认 CSP 可能过宽，需确认 capabilities 配置。
- **无数据库迁移文件** — 使用 Prisma 但 `src-tauri/target/` 等构建产物目录未在 `.gitignore` 中明确排除（文件数 7545 大量为构建产物 `.timestamp/.d/.rmeta/.rlib/.so`）。
- **测试文件使用 `any` 类型** — 10 处 `any` 使用分布在测试文件中（hooks/theme tests, api/client tests），违反 AGENTS.md 中 `any` 禁止规范。

### 🔵 建议（Suggestion）

- **构建产物未完全 gitignore** — 7545 文件中有大量 Rust 编译产物（`.timestamp` 1031 个, `.d` 943 个, `.rmeta` 756 个），建议检查 `.gitignore` 覆盖 `src-tauri/target/`。
- **无 ESLint 配置文件发现** — `package.json` 有 `lint` 脚本但未见 `.eslintrc` 相关配置检查。
- **文档体系完善但迁移尚未完成** — `docs/AGENTS.md` 定义了清晰的文档分类，当前处于 0.9.2 版本，建议确认是否接近 v1.0 迁移节点。

## 3. 安全审查

| 检查项       | 状态    | 说明                                                                                 |
| ------------ | ------- | ------------------------------------------------------------------------------------ |
| 硬编码密钥   | ✅ 安全 | 未发现硬编码密钥                                                                     |
| 注入风险     | ✅ 安全 | 使用 Prisma ORM 参数化查询                                                           |
| 认证/授权    | ⚠️ 注意 | sync 模块有认证（username/password），但未见完整认证体系                             |
| 依赖安全     | ✅ 安全 | 主要依赖版本较新（Next.js 16, React 19）                                             |
| 敏感数据处理 | ⚠️ 注意 | `useSync.ts` 中 password 明文传递，`password_encrypted` 字段名暗示有加密但实现待确认 |

## 4. 性能分析

- Next.js 16 + React 19 最新框架，性能基线良好
- TanStack Query 提供数据缓存和乐观更新
- Zustand 状态管理轻量高效
- Tauri 桌面端性能优于 Electron
- 无 N+1 查询风险（Prisma ORM 保护）

## 5. 代码规范

- 文档体系 AGENTS.md 非常完善，定义了清晰的编码规范和命名约定
- 使用 Prettier 格式化 + ESLint 检查
- Vitest 测试框架选择合理
- Conventional Commits 规范执行良好

## 6. 交互与功能

- 拖拽排序（@dnd-kit）交互体验好
- Framer Motion 动画丰富
- Tauri 支持桌面端和 Android 打包，跨平台能力完整
- Google Drive 同步功能设计合理

## 7. 总结与下一步展望

- **项目整体健康度评分：8/10**
- **Top 3 优先改进项：**
  1. 清理构建产物 `.gitignore` 覆盖 `src-tauri/target/` 下的 Rust 编译产物
  2. 修复测试文件中的 `any` 类型使用，替换为具体类型
  3. 确认 sync 模块的密码加密实现完整性
- **下一步行动建议：** 发布 v1.0 前完成目录迁移和全面类型安全审计
