# 架构重构任务进度追踪

> 创建时间: 2026-03-02
> 基于文档: [refactoring-architecture-plan.md](../refactoring-architecture-plan.md)

---

## Phase 1: 拆分 `api.ts` (优先级: P0)

### Task 1.1: 创建类型目录结构 ✅

- [x] 创建 `src/lib/types/` 目录
- [x] 创建 `src/lib/types/common.ts` - 通用类型 (Priority, EntityType)
- [x] 创建 `src/lib/types/plan.ts` - Plan 相关类型
- [x] 创建 `src/lib/types/task.ts` - Task 相关类型
- [x] 创建 `src/lib/types/target.ts` - Target 相关类型
- [x] 创建 `src/lib/types/step.ts` - Step 相关类型
- [x] 创建 `src/lib/types/todo.ts` - Todo 相关类型
- [x] 创建 `src/lib/types/milestone.ts` - Milestone 相关类型
- [x] 创建 `src/lib/types/circulation.ts` - Circulation 相关类型
- [x] 创建 `src/lib/types/tag.ts` - Tag 相关类型
- [x] 创建 `src/lib/types/statistics.ts` - Statistics 相关类型
- [x] 创建 `src/lib/types/search.ts` - SearchResult 类型
- [x] 创建 `src/lib/types/notification.ts` - Notification 相关类型
- [x] 创建 `src/lib/types/bulk.ts` - BatchUpdateResult 类型
- [x] 创建 `src/lib/types/data.ts` - SeedResult, ResetOptions 类型
- [x] 创建 `src/lib/types/export.ts` - ExportData, ImportResult 类型
- [x] 创建 `src/lib/types/index.ts` - 统一导出
- [x] TypeScript 编译通过
- [x] Code Review 通过 (Momus)

**完成时间**: 2026-03-02
**Commit**: cca9181

### Task 1.2: 创建API目录结构 ✅

- [x] 创建 `src/lib/api/` 目录
- [x] 创建 `src/lib/api/client.ts` - isTauri, withTauriError
- [x] 创建 `src/lib/api/plans.ts` - Plan CRUD APIs
- [x] 创建 `src/lib/api/tasks.ts` - Task CRUD APIs
- [x] 创建 `src/lib/api/targets.ts` - Target CRUD APIs
- [x] 创建 `src/lib/api/steps.ts` - Step CRUD APIs
- [x] 创建 `src/lib/api/todos.ts` - Todo CRUD APIs
- [x] 创建 `src/lib/api/milestones.ts` - Milestone CRUD APIs
- [x] 创建 `src/lib/api/circulations.ts` - Circulation APIs
- [x] 创建 `src/lib/api/tags.ts` - Tag CRUD APIs
- [x] 创建 `src/lib/api/search.ts` - searchAll API
- [x] 创建 `src/lib/api/dashboard.ts` - getDashboard API
- [x] 创建 `src/lib/api/statistics.ts` - getStatistics API
- [x] 创建 `src/lib/api/bulk.ts` - 批量操作 APIs
- [x] 创建 `src/lib/api/notifications.ts` - 通知设置 APIs
- [x] 创建 `src/lib/api/data.ts` - seedTestData, resetData APIs
- [x] 创建 `src/lib/api/export.ts` - Export/Import APIs
- [x] 创建 `src/lib/api/index.ts` - 统一导出
- [x] 更新 `src/lib/api.ts` 重新导出
- [x] TypeScript 编译通过
- [x] 257 个测试全部通过
- [x] Code Review 通过 (Momus)

**完成时间**: 2026-03-02

### Task 1.3: 更新导入路径

- [ ] 更新 `src/hooks/*.ts` 中的导入
- [ ] 更新 `src/app/views/*.tsx` 中的导入
- [ ] 更新 `src/components/**/*.tsx` 中的导入
- [ ] 验证 TypeScript 编译通过
- [ ] 验证所有测试通过

### Task 1.4: 清理旧文件

- [ ] 删除或归档旧的 `src/lib/api.ts`
- [ ] 更新 `src/lib/index.ts` (如果存在)

**验收标准**:

- [ ] `api.ts` 文件行数 < 100 (仅保留统一导出)
- [ ] TypeScript 编译通过: `npm run typecheck`
- [ ] 所有测试通过: `npm run test`

---

## Phase 2: 分类 `components/ui` (优先级: P1)

### Task 2.1: 创建目录结构

- [ ] 创建 `src/components/layout/` 目录
- [ ] 移动 `TitleBar.tsx` 到 `layout/`
- [ ] 创建 `src/components/layout/index.ts`

### Task 2.2: 移动业务组件到 features

- [ ] 移动 `CheckinConfirm.tsx` 到 `features/`
- [ ] 移动 `SearchBar.tsx` 到 `features/`
- [ ] 移动 `ThemeSelector.tsx` 到 `features/`
- [ ] 移动 `EmptyStateCard.tsx` 到 `features/`
- [ ] 移动 `SortableList.tsx` 到 `features/`
- [ ] 更新 `features/index.ts` 导出

### Task 2.3: 更新导入路径

- [ ] 更新所有引用这些组件的文件
- [ ] 更新 `ui/index.ts` 导出
- [ ] 验证 TypeScript 编译通过
- [ ] 验证所有测试通过

**验收标准**:

- [ ] `ui/` 目录仅包含纯UI组件
- [ ] `layout/` 目录包含布局组件
- [ ] `features/` 目录包含业务组件
- [ ] 所有测试通过

---

## Phase 3: 拆分 `ViewsView.tsx` (优先级: P2)

### Task 3.1: 创建 Hooks

- [ ] 创建 `src/app/views/hooks/` 目录
- [ ] 创建 `useViewsData.ts` - 数据获取
- [ ] 创建 `useViewsFilters.ts` - 过滤逻辑
- [ ] 创建 `useScrollIndicators.ts` - 滚动指示器逻辑

### Task 3.2: 创建组件

- [ ] 创建 `src/app/views/components/ViewModeSelector.tsx`
- [ ] 创建 `src/app/views/components/ScrollIndicators.tsx`
- [ ] 创建 `src/app/views/components/BoardColumn.tsx`
- [ ] 创建 `src/app/views/components/GanttRow.tsx`

### Task 3.3: 重构主组件

- [ ] 重构 `ViewsView.tsx` 使用新的 Hooks 和组件
- [ ] 提取内联样式到 CSS 模块或全局样式
- [ ] 验证所有视图功能正常

**验收标准**:

- [ ] `ViewsView.tsx` 行数 < 300
- [ ] 所有视图功能正常 (list, board, calendar, gantt)
- [ ] 所有测试通过

---

## Phase 4: 拆分后端 `commands` (优先级: P3)

### Task 4.1: 拆分 circulations.rs

- [ ] 创建 `src-tauri/src/commands/circulations/` 目录
- [ ] 创建 `mod.rs` - CRUD 和导出
- [ ] 创建 `checkin.rs` - 打卡/撤销逻辑
- [ ] 创建 `statistics.rs` - 打卡统计
- [ ] 更新 `commands/mod.rs`

### Task 4.2: 拆分 data.rs

- [ ] 创建 `src-tauri/src/commands/data/` 目录
- [ ] 创建 `mod.rs` - 导出
- [ ] 创建 `seed.rs` - 测试数据生成
- [ ] 创建 `reset.rs` - 数据重置
- [ ] 更新 `commands/mod.rs`

**验收标准**:

- [ ] `circulations.rs` 行数 < 300
- [ ] `data.rs` 行数 < 100
- [ ] Rust 编译通过: `cargo build`
- [ ] Rust 测试通过: `cargo test`

---

## 进度总览

| Phase   | 状态      | 开始时间 | 完成时间 |
| ------- | --------- | -------- | -------- |
| Phase 1 | 🔴 未开始 | -        | -        |
| Phase 2 | 🔴 未开始 | -        | -        |
| Phase 3 | 🔴 未开始 | -        | -        |
| Phase 4 | 🔴 未开始 | -        | -        |

**状态说明**: 🔴 未开始 | 🟡 进行中 | 🟢 已完成

---

## 变更日志

| 时间       | 操作         | 结果         |
| ---------- | ------------ | ------------ |
| 2026-03-02 | 创建任务清单 | 文档创建成功 |
