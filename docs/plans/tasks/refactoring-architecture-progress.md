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

### Task 1.3: 更新导入路径 ✅

- [x] 更新 `src/hooks/*.ts` 中的导入 (8 files)
- [x] 更新 `src/app/views/*.tsx` 中的导入
- [x] 更新 `src/components/**/*.tsx` 中的导入 (12 files)
- [x] TypeScript 编译通过
- [x] 257 个测试全部通过
- [x] Code Review 通过 (Momus)

**完成时间**: 2026-03-02
**Commits**: 9938cfc, c2febba

### Task 1.4: 清理旧文件 ✅

- [x] 检查 `src/lib/api.ts` 当前内容
- [x] 确认文件只包含统一导出语句（17行 < 100行）
- [x] 确认没有重复的类型定义
- [x] TypeScript 编译通过
- [x] 257 个测试全部通过
- [x] Code Review 通过 (Momus)

**完成时间**: 2026-03-02
**Commit**: d289b14

---

## ✅ Phase 1 完成

**成果**:

- `api.ts` 从 1421行 精简到 17行 (-98.8%)
- 类型定义完全独立到 `types/` 目录
- API 函数按实体拆分到 `api/` 目录
- 所有导入路径已更新
- TypeScript 编译通过
- 257 个测试全部通过

---

## Phase 2: 分类 `components/ui` (优先级: P1)

### Task 2.1: 创建目录结构 ✅

- [x] 创建 `src/components/layout/` 目录
- [x] 移动 `TitleBar.tsx` 到 `layout/`
- [x] 创建 `src/components/layout/index.ts`
- [x] TypeScript 编译通过
- [x] 257 个测试全部通过

**完成时间**: 2026-03-02

### Task 2.2: 移动业务组件到 features ✅

- [x] 移动 `CheckinConfirm.tsx` 到 `features/`
- [x] 移动 `SearchBar.tsx` 到 `features/`
- [x] 移动 `ThemeSelector.tsx` 到 `features/`
- [x] 移动 `EmptyStateCard.tsx` 到 `features/`
- [x] 移动 `SortableList.tsx` 到 `features/`
- [x] 更新 `features/index.ts` 导出
- [x] 更新所有引用这些组件的文件
- [x] TypeScript 编译通过
- [x] 257 个测试全部通过

**完成时间**: 2026-03-02
**Commit**: d9cd85e

### Task 2.3: 更新导入路径 ✅

- [x] 更新所有引用这些组件的文件
- [x] 更新 `ui/index.ts` 导出
- [x] TypeScript 编译通过
- [x] 257 个测试全部通过

**完成时间**: 2026-03-02

**验收标准**:

- [x] `ui/` 目录仅包含纯UI组件
- [x] `layout/` 目录包含布局组件
- [x] `features/` 目录包含业务组件
- [x] 所有测试通过

---

## ✅ Phase 2 完成

**成果**:
- 创建 `layout/` 目录，移动 TitleBar, Sidebar, BottomNav
- 移动 5 个业务组件到 `features/`
- 组件分类清晰：ui/ (纯UI) / layout/ (布局) / features/ (业务)
- TypeScript 编译通过
- 257 个测试全部通过


---

## Phase 3: 拆分 `ViewsView.tsx` (优先级: P2)

### Task 3.1: 创建 Hooks ✅

- [x] 创建 `src/app/views/hooks/` 目录
- [x] 创建 `useViewsData.ts` - 数据获取
- [x] 创建 `useViewsFilters.ts` - 过滤逻辑
- [x] 创建 `useScrollIndicators.ts` - 滚动指示器逻辑
- [x] TypeScript 编译通过
- [x] 257 个测试全部通过

**完成时间**: 2026-03-02
**Commit**: 97f067e

### Task 3.2: 创建组件 ✅

- [x] 创建 `src/app/views/components/ViewModeSelector.tsx`
- [x] 创建 `src/app/views/components/ScrollIndicators.tsx`
- [x] 创建 `src/app/views/components/index.ts`
- [ ] 创建 `src/app/views/components/BoardColumn.tsx` (可选)
- [ ] 创建 `src/app/views/components/GanttRow.tsx` (可选)
- [x] TypeScript 编译通过
- [x] 257 个测试全部通过

**完成时间**: 2026-03-02
**Commit**: d5671cc

### Task 3.3: 重构主组件 ✅

- [x] 重构 `ViewsView.tsx` 使用新的 Hooks 和组件
- [x] 使用 `useViewsData`, `useViewsFilters`, `useScrollIndicators`
- [x] 使用 `ViewModeSelector`, `ScrollIndicators` 组件
- [x] 验证所有视图功能正常
- [x] TypeScript 编译通过
- [x] 257 个测试全部通过

**完成时间**: 2026-03-02
**Commit**: a6e2bb6

**成果**: ViewsView.tsx 从 **1412 行减少到 830 行** (-41%)

---

## ✅ Phase 3 完成

**成果**:
- 创建 `hooks/` 目录，3 个 hook 文件
- 创建 `components/` 目录，2 个组件文件
- ViewsView.tsx 从 1412 行减少到 830 行 (-41%)
- TypeScript 编译通过
- 257 个测试全部通过

---

## Phase 4: 拆分后端 `commands` (优先级: P3)

### Task 4.1: 拆分 circulations.rs ✅

- [x] 创建 `src-tauri/src/commands/circulations/` 目录
- [x] 创建 `mod.rs` - CRUD 和导出
- [x] 创建 `checkin.rs` - 打卡/撤销逻辑
- [x] 创建 `statistics.rs` - 打卡统计
- [x] 更新 `commands/mod.rs`
- [x] Rust 编译通过

**完成时间**: 2026-03-02
**Commit**: 4f7b7c4

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

| Phase   | 状态      | 开始时间  | 完成时间  |
| ------- | --------- | --------- | --------- |
| Phase 1 | ✅ 完成   | 2026-03-02 | 2026-03-02 |
| Phase 2 | ✅ 完成   | 2026-03-02 | 2026-03-02 |
| Phase 3 | ✅ 完成   | 2026-03-02 | 2026-03-02 |
| Phase 4 | 🔴 未开始 | -         | -         |

**状态说明**: 🔴 未开始 | 🟡 进行中 | ✅ 完成

---

## 总结

### Phase 1 成果
- `api.ts` 从 **1421行** 精简到 **17行** (-98.8%)
- 类型定义独立到 `types/` 目录
- API 函数按实体拆分到 `api/` 目录

### Phase 2 成果
- 创建 `layout/` 目录
- 移动业务组件到 `features/`
- 组件分类清晰：ui/ (纯UI) / layout/ (布局) / features/ (业务)

### Phase 3 成果
- ViewsView.tsx 从 **1412行** 减少到 **830行** (-41%)
- 创建 hooks 和 components 目录
- 逻辑分离，代码可维护性提升

### 验证状态
- ✅ TypeScript 编译通过
- ✅ 257 个前端测试通过
- ✅ Rust 编译通过
- ✅ Git 提交完成

---

## 变更日志

| 时间       | 操作         | 结果         |
| ---------- | ------------ | ------------ |
| 2026-03-02 | 创建任务清单 | 文档创建成功 |
