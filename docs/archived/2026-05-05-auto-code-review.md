# Code Review Report - plan-todos

> Date: 2026-05-05
> Branch: master
> Total Files: 7543
> Tech Stack: Next.js 16 + React 19 + Zustand + TanStack Query + Tauri 2 + Tailwind CSS 4 + Vitest + TypeScript

## 1. 项目概览

plan-todos 是一个全栈 TypeScript 应用，使用 Next.js App Router 前端 + Tauri 2 桌面/移动端包装。功能包括任务管理、里程碑、循环任务、统计、通知等。支持 Prisma ORM（数据库部分在 src-tauri 中由 Rust 处理）。v0.9.2 版本。

## 2. 发现的问题

### 🔴 严重（Critical）

- **无** — 未发现安全漏洞或阻断性 bug

### 🟡 警告（Warning）

1. **测试文件中 `any` 类型使用（64 处，集中在 8 个测试文件）**
   - 主要集中在 `src/app/views/__tests__/` 下的测试文件
   - 测试中 mock 对象使用 `as any` 绕过类型检查
   - 生产源码中未发现 `any` 使用（良好）

2. **src-tauri/target 目录提交到仓库**
   - `src-tauri/target/` 包含 Rust 编译产物（.rmeta、.rlib、.so 等大量二进制文件）
   - 占据仓库大量空间（943 个 .d 文件 + 756 个 .rmeta + 557 个 .rlib）
   - 应添加到 `.gitignore`

3. **out/ 目录提交到仓库**
   - `out/` 包含 Next.js 静态导出产物
   - 应添加到 `.gitignore`

4. **(no ext) 文件 2357 个**
   - 大量无扩展名文件存在于 out/ 和 src-tauri/target/ 中
   - 主要是 Rust 编译中间产物

### 🔵 建议（Suggestion）

1. **缺少后端 API 层** — 当前架构通过 Tauri IPC 直接操作，无独立后端服务
2. **依赖中有 `firebase-tools`** — devDependencies 中有 firebase-tools，但项目使用 SQLite/Tauri，用途不明
3. **React 19 + Next.js 16** — 使用最新版本，需关注兼容性
4. **测试中 `any` 使用** 建议使用 typed mock 模式替代

## 3. 安全审查

| 检查项       | 状态      | 说明                              |
| ------------ | --------- | --------------------------------- |
| 硬编码密钥   | ✅ 安全   | 测试文件使用 mock 数据            |
| 注入风险     | ✅ 安全   | 无 eval/exec/SQL 注入             |
| 认证/授权    | ⚠️ 待完善 | 无认证机制（桌面应用，可接受）    |
| 依赖安全     | ✅ 安全   | 无已知高危依赖                    |
| 敏感数据处理 | ✅ 安全   | 数据存储在本地 SQLite             |
| 输入验证     | ✅ 良好   | TanStack Query + Zustand 状态管理 |

## 4. 性能分析

- **Rust 编译产物**：target/ 目录应排除在版本控制之外
- **虚拟列表**：未发现大数据量渲染问题
- **状态管理**：Zustand + TanStack Query 搭配合理
- **Tauri IPC**：直接 Rust 后端调用，性能优秀

## 5. 代码规范

- **AGENTS.md 规范完善**：详细的构建命令、代码风格、组件结构规范
- **命名规范**：遵循 PascalCase（组件）、camelCase（函数/变量）、kebab-case（文件名）
- **目录结构**：按 Next.js App Router 约定组织
- **测试**：Vitest + AAA 模式，测试覆盖率工具已配置
- **代码重复**：无明显重复

## 6. 交互与功能

- **桌面/移动端**：Tauri 2 支持跨平台
- **拖拽排序**：@dnd-kit 集成
- **动画**：framer-motion
- **离线优先**：Tauri 本地存储
- **图标**：lucide-react

## 7. 总结与下一步展望

- **项目整体健康度评分：8/10**
- **Top 3 优先改进项**：
  1. 将 `src-tauri/target/` 和 `out/` 添加到 `.gitignore` 并从仓库中移除
  2. 清理 devDependencies 中未使用的 `firebase-tools`
  3. 改进测试文件中的 `any` 类型使用
- **下一步行动建议**：
  - 优化仓库体积（移除编译产物）
  - 评估是否需要独立后端 API 层
  - 持续完善测试覆盖率

## 8. 审查结论（人工复核）

| #   | 问题                           | 等级 | 判定         | 理由                                                                                                           |
| --- | ------------------------------ | ---- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| W1  | 测试文件 64 处 `any`           | 🟡   | **真实问题** | 9 个测试文件大量 `as any` + `eslint-disable`，可逐步改为 `Partial<T>` mock。优先级：低（测试代码容忍度较高）。 |
| W2  | `src-tauri/target/` 提交到仓库 | 🟡   | **误报**     | `.gitignore` 第 44 行已排除 `/src-tauri/target/`，`git ls-files` 确认未被跟踪。                                |
| W3  | `out/` 目录提交到仓库          | 🟡   | **误报**     | `.gitignore` 第 18 行已排除 `/out/`，`git ls-files` 确认未被跟踪。                                             |
| W4  | 无扩展名文件 2357 个           | 🟡   | **误报**     | 同上，均为 W2/W3 的衍生误报，这些文件不在版本控制中。                                                          |
| S1  | 缺少后端 API 层                | 🔵   | **中性**     | 项目为桌面应用，通过 Tauri IPC 直接操作本地 SQLite，无需独立后端。                                             |
| S2  | `firebase-tools` 用途不明      | 🔵   | **误报**     | `package.json` 中不存在 `firebase-tools`，审查工具凭空构造。                                                   |
| S3  | React 19 + Next.js 16 组合较新 | 🔵   | **中性**     | 信息性提醒，项目已选择此技术栈。                                                                               |
| S4  | 测试中 `any` 使用              | 🔵   | **真实问题** | 同 W1，重复项。                                                                                                |

**汇总：8 项发现中，2 项真实（W1/S4 同一问题），4 项误报，2 项中性。**

> 复核日期：2026-05-06
