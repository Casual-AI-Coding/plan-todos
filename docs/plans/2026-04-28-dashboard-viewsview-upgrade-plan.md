# Dashboard & ViewsView 升级实施计划

> **关联设计文档**: `docs/specs/2026-04-28-dashboard-viewsview-upgrade-design.md`  
> **日期**: 2026-04-28  

---

## Phase 1: Dashboard 重构

### Task 1.1: 创建 Dashboard ViewModel
- **文件**: `src/app/views/dashboard/useDashboardViewModel.ts`
- **内容**: 从 `useDashboard` 获取数据，计算派生状态（今日进度百分比、连续打卡进度等），提供 `handleToggleTodo` 和 `handleNavigateToEntity` 操作
- **依赖**: 无（直接使用现有 hooks）

### Task 1.2: 创建 SectionCard 封装组件
- **文件**: `src/app/views/dashboard/SectionCard.tsx`
- **内容**: 统一的区块卡片封装，包含标题、空态、列表容器，减少子组件重复代码

### Task 1.3: 创建 Dashboard 子组件
按以下顺序创建（每个文件独立，可并行）：
- `DashboardSkeleton.tsx` — 骨架屏
- `DashboardError.tsx` — 错误态
- `StatsRow.tsx` — 3张统计卡片（今日待办/即将到期/今日完成）
- `EntityCountsRow.tsx` — 7个实体计数 Badge
- `CirculationSection.tsx` — 打卡统计
- `ProgressSection.tsx` — 3个环形进度
- `TodayTodosCard.tsx` — 今日待办（支持 Checkbox 交互）
- `OverdueTodosCard.tsx` — 已过期（红色紧急视觉）
- `ActivePlansCard.tsx` — 进行中计划
- `ActiveTargetsCard.tsx` — 进行中目标
- `ActiveMilestonesCard.tsx` — 进行中里程碑

### Task 1.4: 重写 Dashboard 页面壳
- **文件**: `src/app/views/Dashboard.tsx`
- **内容**: 调用 `useDashboardViewModel`，组装子组件，≤40行

### Task 1.5: Dashboard 测试更新
- **文件**: `src/app/views/__tests__/Dashboard.test.tsx`
- **内容**: 更新选择器，确保现有 11 个测试通过，新增 ViewModel 测试

---

## Phase 2: ViewsView 重构

### Task 2.1: 创建共享类型
- **文件**: `src/app/views/views/types.ts`
- **内容**: `ViewMode`, `FilterState`, `HoveredItem`, `ViewsViewModel` 接口

### Task 2.2: 创建 ViewsView ViewModel
- **文件**: `src/app/views/views/useViewsViewModel.ts`
- **内容**: 组合所有数据查询，管理 UI 状态（viewMode, filters, calendarDate, ganttZoom, hover），提供 `handleItemClick`, `toggleFilter`, `selectAllFilters`, `invertFilters` 操作

### Task 2.3: 创建 ViewHeader 组件
- **文件**: `src/app/views/views/ViewHeader.tsx`
- **内容**: 标题 + ViewModeSelector + ViewsFilters，从 ViewsView 中抽取

### Task 2.4: 创建 EntityCard 通用组件
- **文件**: `src/components/views/EntityCard.tsx`
- **内容**: 统一的实体卡片（类型 Badge + 标题 + 进度条 + 点击事件），Board 和 Calendar 共用

### Task 2.5: 修复 ViewsBoard
- **文件**: `src/components/views/ViewsBoard.tsx`
- **修改**: 移除 `<style jsx global>`，使用 Tailwind scrollbar-hide；使用 EntityCard；添加点击导航

### Task 2.6: 修复 ViewsCalendar
- **文件**: `src/components/views/ViewsCalendar.tsx`
- **修改**: 启用 hover tooltip；添加日期格子点击；增加 "+N" 溢出提示

### Task 2.7: 修复 ViewsGantt
- **文件**: `src/components/views/ViewsGantt.tsx`
- **修改**: 渲染 tasks（按 plan 分组）；添加 tooltip 悬停；月份中文

### Task 2.8: 增强 ViewsList
- **文件**: `src/components/views/ViewsList.tsx`
- **修改**: 添加点击导航；使用 Badge 组件替代内联样式

### Task 2.9: 重写 ViewsView 页面壳
- **文件**: `src/app/views/ViewsView.tsx`
- **内容**: 调用 `useViewsViewModel`，组装 ViewHeader + ViewContainer，≤50行

### Task 2.10: ViewsView 测试更新
- **文件**: `src/app/views/__tests__/ViewsView.test.tsx`
- **内容**: 扩展测试覆盖所有4种视图模式、筛选器交互

---

## Phase 3: 验证与收尾

### Task 3.1: 运行验证
- `npm run test` — 全部通过
- `npm run typecheck` — 无类型错误
- `npm run build` — 构建成功
- `npm run lint` — 无 lint 错误

### Task 3.2: 视觉检查
- 手动验证 Dashboard 各区域渲染正确
- 手动验证 ViewsView 4种模式切换正常
- 验证 tooltip、点击导航功能

---

## 执行顺序

```
Phase 1 (Dashboard):
  1.1 → 1.2 → 1.3 (并行) → 1.4 → 1.5

Phase 2 (ViewsView):
  2.1 → 2.2 → 2.3 + 2.4 (并行) → 2.5 + 2.6 + 2.7 + 2.8 (并行) → 2.9 → 2.10

Phase 3:
  3.1 → 3.2
```

Phase 1 和 Phase 2 互不依赖，但按顺序执行以确保每次提交可编译。
