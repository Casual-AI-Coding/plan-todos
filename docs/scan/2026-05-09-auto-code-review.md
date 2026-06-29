# Code Review Report - plan-todos

> Date: 2026-05-09
> Branch: master
> Total Files: 7,547
> Tech Stack: TypeScript, Next.js 16 (App Router), React 19, Rust (Tauri v2), SQLite (via Tauri), Tailwind CSS, Vitest

## 1. 项目概览

Plan Todos 是一款全栈待办事项与计划管理应用，技术架构为 Next.js 16 + Tauri v2 桌面/移动端包装。前端使用 React 19 + Tailwind CSS 4 + Zustand，后端以 Rust Tauri 命令为核心，内置 SQLite 数据库、同步引擎、循环任务、Google Drive 集成、通知插件等丰富功能。项目结构清晰，Rust 代码模块化良好（commands/sync/background），前端使用 Next.js App Router + TanStack Query。

## 2. 发现的问题

### 🔴 严重（Critical）

无

### 🟡 警告（Warning）

1. **dangerouslySetInnerHTML 用于主题初始化脚本** — `src/app/layout.tsx:76`
   - 用于注入内联主题脚本防止 hydration 闪烁，内容完全由编译时常量构成（`allThemeIds`、`STORAGE_KEYS`）
   - 当前用法安全，但标记为 `dangerously` 应保持警觉
   - 建议：考虑使用 `next/script` 的 `strategy="beforeInteractive"` 替代

2. **Rust Tauri 后端无认证层** — 作为本地桌面应用，Tauri 命令直接暴露给前端
   - 风险：若通过 devtools 或恶意前端代码调用，可能访问敏感数据（如 Google Drive token）
   - 建议：对敏感命令（如 `google_drive`、`export`）添加调用频率限制

3. **大文件数量** — 7,547 个文件中包含大量 Rust 编译产物（`target/` 下 `.d/.rmeta/.rlib` 约 2,000+）
   - 建议：确认 `target/` 和 `out/` 已在 `.gitignore` 中

### 🔵 建议（Suggestion）

1. **Tailwind CSS 4 使用 `@tailwindcss/vite` 而非 PostCSS 插件** — Check if compatible with Next.js 16
   - Tailwind CSS 4 + Next.js 的兼容性正处过渡期，确认生产构建无误

2. **React 19 特性使用不充分** — 未见使用 `use()` hook、Server Actions 等 React 19 新特性
   - 建议：评估 React 19 新特性带来的收益

3. **package.json 中 `name` 字段为 `plan-todos`** — 符合规范
   - 依赖管理：React 19 + Next.js 16 + Tauri 2 均为最新主版本
4. **dirty_files: 1** — 存在未提交的变更

## 3. 安全审查

| 检查项     | 状态 | 说明                                                 |
| ---------- | ---- | ---------------------------------------------------- |
| 硬编码密钥 | ✅   | 未发现，`.env` 变量通过 Tauri 管理                   |
| 注入风险   | ✅   | Rust SQLite 使用参数化查询，前端 Zod 校验            |
| 认证/授权  | ⚠️   | 本地应用无网络认证层（设计如此）                     |
| XSS        | ✅   | dangerouslySetInnerHTML 仅用于编译时常量脚本         |
| 依赖安全   | ✅   | 依赖版本较新，定期维护                               |
| 数据安全   | ⚠️   | SQLite 数据库文件本地存储，无加密                    |
| 敏感数据   | ✅   | 无硬编码密钥，Google Drive token 通过 OAuth 流程获取 |

## 4. 性能分析

- ✅ Rust Tauri 后端性能优异，SQLite 本地查询低延迟
- ✅ Next.js App Router 服务端组件优先
- ✅ TanStack Query 客户端缓存
- ✅ Tauri 同步引擎支持增量同步、冲突解决、断路器
- ⚠️ `out/` 目录包含 Next.js 静态导出产物（2,357 无扩展文件），构建产物体积需关注

## 5. 代码规范

- ✅ 完善的 AGENTS.md 编码规范（命名、导入顺序、组件结构、错误处理）
- ✅ Prettier + ESLint 配置
- ✅ Rust 代码模块化：`commands/`、`sync/`、`background/` 分离
- ✅ 测试文件存在（`src-tauri/src/tests.rs`）
- ✅ docs/ 体系完整（standards/guides/specs/plans/archived）
- ✅ 无 console.log 残留（生产代码）

## 6. 交互与功能

- ✅ 主题系统（多主题 + 字体大小）, `data-theme` 属性
- ✅ Toast 通知 + ErrorBoundary + HotkeyProvider
- ✅ Tauri 自动更新通知
- ✅ 循环任务、提醒、里程碑、Google Drive 备份
- ✅ 多设备同步引擎

## 7. 总结与下一步展望

- **项目整体健康度评分：8/10**
- **Top 3 优先改进项：**
  1. 确认 `target/` 和 `out/` 在 `.gitignore` 中，减少仓库体积
  2. 对 Tauri 敏感命令添加调用频率限制
  3. 评估 Tailwind CSS 4 与 Next.js 16 的兼容性
- **下一步行动建议：**
  - 清理 `dirty_files` 未提交变更
  - 考虑 SQLite 数据库文件加密（如 SQLCipher）
  - 添加 Tauri 命令权限细分（capabilities）
