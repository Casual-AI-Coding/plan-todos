# Dashboard & ViewsView 重构升级设计方案

> **版本**: v1.0  
> **日期**: 2026-04-28  
> **状态**: 待审批  

---

## 1. 问题陈述

### 1.1 现状分析

**Dashboard (335行)**
- 单体组件，所有 UI 区域在一个文件中
- 简单的 Card 布局，缺乏视觉层次和信息密度
- 每个统计区域使用相同 HoverCard + StaggeredList 模式，动效同质化
- Todo 列表只用 Checkbox + 文字，缺少优先级、截止日期等关键信息
- 已过期区域只是简单列表，没有紧急度视觉暗示
- 进行中计划/目标/里程碑使用相同 ProgressBar 模式，缺乏差异化

**ViewsView (172行) + 子组件**
- ViewsView 是"上帝组件"：管理4种视图模式 + 筛选器 + 日历日期 + Gantt缩放 + 悬停状态
- ViewsBoard: 使用废弃的 `<style jsx global>`，列状态映射逻辑重复
- ViewsCalendar: 接收了 hover props 但未使用（无 tooltip）
- ViewsGantt: `allTasks` prop 传入但从未渲染
- 所有视图缺少点击导航到详情页的功能
- 测试覆盖不足：ViewsView 只有1个测试用例

### 1.2 核心问题

| 问题 | 影响 |
|------|------|
| 组件职责不清晰 | ViewsView 承担了筛选、视图切换、数据获取、tooltip 管理等多重职责 |
| UI 同质化 | 不同信息类型使用相同的展示模式，缺乏视觉区分度 |
| 子组件孤立 | 各视图组件的 props 接口不统一，难以复用和扩展 |
| 功能缺失 | Calendar 无 tooltip、Gantt 不渲染 tasks、无点击导航 |
| 技术债 | `<style jsx global>`、硬编码颜色值、重复的状态映射逻辑 |

---

## 2. 设计目标

| 目标 | 衡量标准 |
|------|----------|
| DDD 架构对齐 | 视图层（View）只负责 UI 呈现，数据逻辑归入应用层（Application），实体逻辑归入领域层（Domain） |
| SOLID 原则 | 每个组件单一职责，通过接口而非实现依赖，扩展视图模式无需修改现有组件 |
| 高内聚低耦合 | 相同领域的逻辑集中（如 Board 的列状态映射），不同领域解耦（筛选器与视图独立） |
| 可维护性 | 新增视图模式只需：1) 实现视图组件 2) 注册到路由映射，无需修改 ViewsView |
| 视觉升级 | 每个信息类型有独特的视觉语言，提升信息密度和可扫描性 |

---

## 3. 架构设计

### 3.1 整体分层

```
┌───────────────────────────────────────────────────────────────┐
│                      View Layer (视图层)                       │
│  DashboardPage / ViewsViewPage → 纯 UI 呈现，无业务逻辑       │
├───────────────────────────────────────────────────────────────┤
│                   Application Layer (应用层)                   │
│  useDashboardViewModel / useViewsViewModel → 编排数据流         │
│  管理 UI 状态（viewMode, filters, calendarDate, ganttZoom）   │
├───────────────────────────────────────────────────────────────┤
│                    Domain Layer (领域层)                        │
│  entityQueries (已有) / viewModels (新增)                      │
│  getDashboardQuery / getFilteredEntities / getGanttItems       │
├───────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer (基础设施层)              │
│  Tauri API / lib/api / lib/types                               │
└───────────────────────────────────────────────────────────────┘
```

### 3.2 Dashboard 重构方案

**目标**: 从 335 行单体组件 → 多个专注子组件 + ViewModel 模式

```
src/
├── app/views/Dashboard.tsx                    # 轻量页面壳 (≤40行)
├── app/views/dashboard/
│   ├── useDashboardViewModel.ts               # 编排 hook：组合数据 + 计算派生状态
│   ├── DashboardSkeleton.tsx                  # 骨架屏
│   ├── DashboardError.tsx                     # 错误态
│   ├── StatsRow.tsx                           # 统计卡片行 (3 cards)
│   ├── EntityCountsRow.tsx                    # 实体计数行 (7 badges)
│   ├── CirculationSection.tsx                 # 打卡统计区
│   ├── ProgressSection.tsx                    # 环形进度区 (效率/今日/连续)
│   ├── TodayTodosCard.tsx                     # 今日待办卡片
│   ├── OverdueTodosCard.tsx                   # 已过期卡片
│   ├── ActivePlansCard.tsx                    # 进行中计划卡片
│   ├── ActiveTargetsCard.tsx                  # 进行中目标卡片
│   ├── ActiveMilestonesCard.tsx               # 进行中里程碑卡片
│   └── SectionCard.tsx                        # 通用区块卡片封装
```

**ViewModel 设计**:

```typescript
// useDashboardViewModel.ts
interface DashboardViewModel {
  // 数据
  stats: StatsData;
  entityCounts: EntityCountsData;
  todayTodos: TodoItem[];
  overdueTodos: TodoItem[];
  activePlans: ActivePlanItem[];
  activeTargets: ActiveTargetItem[];
  activeMilestones: ActiveMilestoneItem[];
  circulationStats: CirculationStatsData | null;
  progressMetrics: ProgressMetricsData;
  
  // UI 状态
  isLoading: boolean;
  error: Error | null;
  
  // 操作
  handleToggleTodo: (id: string) => void;
  handleNavigateToEntity: (type: string, id: string) => void;
}
```

**关键改进**:
1. 每个子组件接收精确的 props 类型，而非整个 dashboard 对象
2. Todo 列表支持 Checkbox 交互（调用 useTodo 的 useUpdate mutation）
3. 每个实体列表项可点击导航
4. 骨架屏替代简单"加载中"文字
5. 已过期列表添加紧急度标识（红色边脉冲/背景）

### 3.3 ViewsView 重构方案

**目标**: 从"上帝组件" → 视图编排器 + 独立视图容器

```
src/
├── app/views/ViewsView.tsx                    # 轻量页面壳 (≤50行)
├── app/views/views/
│   ├── useViewsViewModel.ts                   # 编排 hook
│   ├── ViewHeader.tsx                         # 标题 + 模式选择器 + 筛选器
│   ├── ViewContainer.tsx                      # 视图容器：切换模式 + 动画
│   ├── ViewEmpty.tsx                          # 空状态
│   └── types.ts                               # 共享类型定义
├── components/views/
│   ├── ViewsList.tsx                          # (保留，增强点击导航)
│   ├── ViewsBoard.tsx                         # (保留，修复 style jsx，增强交互)
│   ├── ViewsCalendar.tsx                      # (保留，增加 tooltip + 点击)
│   ├── ViewsGantt.tsx                         # (保留，增加 tasks 渲染)
│   ├── ViewsFilters.tsx                       # (保留)
│   ├── ItemTooltip.tsx                        # (保留)
│   └── EntityCard.tsx                         # (新增) 通用实体卡片组件
```

**ViewModel 设计**:

```typescript
// useViewsViewModel.ts
interface ViewsViewModel {
  // 视图模式
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // 筛选
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  toggleFilter: (key: keyof FilterState) => void;
  selectAllFilters: () => void;
  invertFilters: () => void;
  
  // 数据
  todos: Todo[];
  plans: Plan[];
  targets: Target[];
  milestones: Milestone[];
  tasksByPlan: Record<string, Task[]>;
  targetSteps: Record<string, Step[]>;
  
  // 日历
  calendarDate: Date;
  setCalendarDate: (date: Date) => void;
  
  // Gantt
  ganttZoom: number;
  setGanttZoom: (zoom: number) => void;
  
  // Tooltip (提升到 ViewModel，所有视图共享)
  hoveredItem: HoveredItem | null;
  setHoveredItem: (item: HoveredItem | null) => void;
  hoverPosition: { x: number; y: number };
  setHoverPosition: (pos: { x: number; y: number }) => void;
  
  // 操作
  handleItemClick: (type: string, id: string) => void;
  
  // 加载状态
  isLoading: boolean;
}
```

**关键改进**:
1. ViewsView 从 172 行 → ~50 行，只负责组装 ViewModel 和渲染 ViewContainer
2. 筛选逻辑抽取到 ViewModel，支持 selectAll / invert / toggle
3. Tooltip 状态提升到 ViewModel，所有视图共享（解决 Calendar 无 tooltip 的问题）
4. 新增 `EntityCard` 通用组件，统一 Board/Calendar 中的实体卡片样式
5. 每个视图组件接收 ViewModel 的子集 props，而非独立管理状态
6. 点击实体卡片导航到对应详情页

### 3.4 子组件改进

#### ViewsBoard
- 移除 `<style jsx global>`，使用 Tailwind `scrollbar-hide` 工具类
- 抽取 `getColumnItems()` 为独立 pure function，消除重复状态映射
- 卡片添加点击导航和右键菜单
- 列头添加数量 badge 和快速添加按钮

#### ViewsCalendar
- 使用 ViewModel 中的 hover 状态，启用 tooltip
- 日历格子增加点击事件（可展开详情或导航）
- 今日高亮更明显
- 超过3个项目的日期显示 "+N" 溢出提示

#### ViewsGantt
- 渲染 tasks（从 allTasks 中按 plan 分组）
- 添加 tooltip 悬停显示详情
- 任务条增加进度可视化
- 月份标签使用中文

#### ViewsList
- 保持现有结构，增强交互
- 每个实体项添加点击导航
- 状态徽章使用项目统一的 Badge 组件
- 添加展开/折叠动画

---

## 4. UI 设计改进

### 4.1 Dashboard 视觉升级

| 区域 | 现状 | 改进 |
|------|------|------|
| 统计卡片 | 单一数字 + 文字 | 数字动画 (countUp) + 趋势箭头 + 微妙背景渐变 |
| 实体计数 | 简单 Badge | 带图标的紧凑 Badge + 点击可导航 |
| 打卡统计 | 基础三栏 | 使用 ProgressRing 展示连续天数，增加火焰图标 |
| 环形进度 | 三个独立环 | 保持，增加数字动画和颜色编码 |
| 今日待办 | Checkbox + 文字 | 优先级色标 + 截止时间 + 标签 + 可勾选交互 |
| 已过期 | 简单列表 | 红色紧急背景 + 天数提示 + 批量操作入口 |
| 进行中计划 | ProgressBar | 保持，增加完成/总数文字、截止日期 |
| 进行中目标 | ProgressBar | 保持，增加步骤数提示 |
| 进行中里程碑 | ProgressBar | 保持，增加目标日期 |

### 4.2 ViewsView 视觉升级

| 视图 | 改进重点 |
|------|----------|
| Board | 统一卡片高度、状态色带、优先级标识、拖拽把手 (future) |
| List | 层级缩进优化、折叠/展开动画、面包屑导航 |
| Calendar | 日期格子高度适配、溢出 +N、今日高鲜明、tooltip |
| Gantt | 任务条渐变、进度填充、今日标记线、月份中文 |

---

## 5. 数据流设计

### 5.1 Dashboard 数据流

```
useDashboard() → DashboardViewModel → Dashboard Page
                                          ├── StatsRow
                                          ├── EntityCountsRow
                                          ├── CirculationSection
                                          ├── ProgressSection
                                          ├── TodayTodosCard (→ useTodo.useUpdate)
                                          ├── OverdueTodosCard
                                          ├── ActivePlansCard
                                          ├── ActiveTargetsCard
                                          └── ActiveMilestonesCard
```

### 5.2 ViewsView 数据流

```
useTodos() + usePlans() + useTargets() + useMilestones() + useTasks()
      ↓
useViewsViewModel()
      ↓
ViewsView Page
  ├── ViewHeader (ViewModeSelector + ViewsFilters)
  ├── ItemTooltip
  └── ViewContainer
        ├── ViewsList (filters + data)
        ├── ViewsBoard (filters + data + hover state)
        ├── ViewsCalendar (filters + data + hover state + calendarDate)
        └── ViewsGantt (filters + data + ganttZoom)
```

---

## 6. 技术约束

| 约束 | 说明 |
|------|------|
| 保持现有 API | 不修改 Tauri backend commands 或 lib/api 层 |
| 保持现有 hooks | 不修改 domain/*Queries.ts 或 hooks/useDashboard.ts |
| 保持现有 UI 组件 | 不修改 components/ui/* 基础组件 |
| 保持现有测试 | 现有测试必须通过，新增测试覆盖 ViewModel 和子组件 |
| 使用项目样式规范 | CSS 变量 (`var(--color-*)`) + Tailwind 工具类 |
| 渐进式迁移 | 一次性重构（不使用 feature flag），但保证每个 commit 可编译 |

---

## 7. 验收标准

| # | 验收项 | 优先级 |
|---|--------|--------|
| 1 | Dashboard 从 335 行 → 页面壳 ≤40 行 + 多个专注子组件 | P0 |
| 2 | ViewsView 从 172 行 → 页面壳 ≤50 行 + ViewModel | P0 |
| 3 | 所有视图支持点击实体导航到详情 | P0 |
| 4 | ViewsCalendar 启用 tooltip 悬停 | P0 |
| 5 | ViewsGantt 渲染 tasks（按 plan 分组） | P0 |
| 6 | ViewsBoard 移除 `<style jsx global>` | P0 |
| 7 | Dashboard Todo 支持 Checkbox 勾选交互 | P1 |
| 8 | Dashboard 已过期区域视觉紧急化 | P1 |
| 9 | ViewsBoard 统一卡片设计 | P1 |
| 10 | 所有现有测试通过 | P0 |
| 11 | 新增 ViewModel 单元测试 | P1 |
| 12 | TypeScript 类型检查通过 | P0 |
| 13 | 构建成功 | P0 |

---

## 8. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 重构范围过大 | 交付延迟 | 分阶段提交：先 ViewModel 抽取，再 UI 改进 |
| 现有测试依赖组件结构 | 测试失败 | 保持对外接口不变（props 类型），更新测试中的选择器 |
| 点击导航目标页面不存在 | 404 | 只实现卡片点击事件，导航到已有路由（如 activeMenu 切换） |
| Tooltip 在 Calendar 中表现不佳 | UX 降级 | 先用 ItemTooltip 组件，不满意再替换为 Popover |

---

## 9. 文件变更预估

| 操作 | 文件数 | 说明 |
|------|--------|------|
| 新增 | ~15 | ViewModel + 子组件 + 类型文件 |
| 修改 | ~8 | Dashboard, ViewsView, ViewsBoard, ViewsCalendar, ViewsGantt, ViewsList, ViewModeSelector |
| 删除 | 0 | 无 |
| 测试 | ~3 | ViewModel 测试 + 更新现有测试 |

总变更：~25 个文件，预计 +800/-300 行
