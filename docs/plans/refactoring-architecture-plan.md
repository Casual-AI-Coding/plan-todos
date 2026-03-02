# 架构重构计划 - 高内聚低耦合演进

> 创建时间: 2026-03-02
> 目标: 通过合理的拆分、分包、分层次，向高内聚低耦合方向演进

---

## 一、现状分析

### 1.1 大文件问题

#### 前端 (TypeScript/TSX)

| 文件                                 | 行数     | 问题描述                                                         |
| ------------------------------------ | -------- | ---------------------------------------------------------------- |
| `src/lib/api.ts`                     | **1421** | 🔴 严重违反 SRP：类型定义 + API函数 + 工具函数混杂 (108个export) |
| `src/app/views/ViewsView.tsx`        | **1412** | 🔴 4种视图模式 + 状态管理 + 过滤逻辑 + 内联样式                  |
| `src/app/views/CirculationsView.tsx` | **886**  | 🟡 拖拽排序 + 打卡逻辑 + 详情模态框 + 设置视图                   |
| `src/app/views/PlansView.tsx`        | **556**  | 🟡 计划列表 + 任务管理 + 表单逻辑                                |
| `src/app/views/TargetsView.tsx`      | **518**  | 🟡 目标列表 + 步骤管理 + 进度计算                                |

#### 后端 (Rust)

| 文件                                      | 行数    | 问题描述                       |
| ----------------------------------------- | ------- | ------------------------------ |
| `src-tauri/src/commands/circulations.rs`  | **746** | 🟡 CRUD + 打卡/撤销 + 统计计算 |
| `src-tauri/src/commands/data.rs`          | **741** | 🟡 测试数据生成逻辑过长        |
| `src-tauri/src/commands/dashboard.rs`     | **577** | 🟢 多种统计数据聚合            |
| `src-tauri/src/commands/import.rs`        | **571** | 🟢 导入逻辑                    |
| `src-tauri/src/commands/notifications.rs` | **427** | 🟢 通知设置                    |

### 1.2 目录结构问题

#### `src/components/ui` (28文件) - 分类混乱

```
当前问题:
- 基础UI组件 (Button, Input, Card...) 与业务组件 (CheckinConfirm, SearchBar...) 混杂
- 布局组件 (TitleBar) 放在UI目录
- index.ts 只导出12个组件，其他组件需要单独导入
```

#### `src/lib/api.ts` - 最严重的架构问题

```
当前结构 (1421行):
├── 类型定义 (12+ interface, 6+ type)  ~150行
├── 工具函数 (isTauri, withTauriError)  ~20行
└── API函数 (50+ async functions)       ~1250行

问题:
- 违反单一职责原则 (SRP)
- 类型定义与API耦合
- 难以单独测试和维护
- 导入时无法按需加载类型
```

---

## 二、重构方案

### 2.1 方案A: `api.ts` 拆分 (优先级: P0)

#### 目标结构

```
src/lib/
├── types/
│   ├── index.ts              # 统一导出所有类型
│   ├── common.ts             # Priority, EntityType 等通用类型
│   ├── plan.ts               # Plan interface + CreatePlanParams
│   ├── task.ts               # Task interface + CreateTaskParams
│   ├── target.ts             # Target interface + CreateTargetParams
│   ├── step.ts               # Step interface + CreateStepParams
│   ├── todo.ts               # Todo interface + CreateTodoParams
│   ├── milestone.ts          # Milestone interface + CreateMilestoneParams
│   ├── circulation.ts        # Circulation, CirculationLog, CreateCirculationParams
│   ├── tag.ts                # Tag interface
│   ├── statistics.ts         # Statistics, Dashboard interfaces
│   ├── search.ts             # SearchResult interface
│   ├── notification.ts       # NotificationSettings, DailySummarySettings
│   └── bulk.ts               # BatchUpdateResult interface
├── api/
│   ├── index.ts              # 统一导出所有API
│   ├── client.ts             # isTauri(), withTauriError()
│   ├── plans.ts              # getPlan, getPlans, createPlan, updatePlan, deletePlan
│   ├── tasks.ts              # Task CRUD APIs + getTasksByPlan
│   ├── targets.ts            # Target CRUD APIs
│   ├── steps.ts              # Step CRUD APIs
│   ├── todos.ts              # Todo CRUD APIs + getTodosByTag
│   ├── milestones.ts         # Milestone CRUD APIs
│   ├── circulations.ts       # Circulation CRUD + checkin/undo APIs
│   ├── tags.ts               # Tag CRUD APIs
│   ├── search.ts             # searchAll
│   ├── dashboard.ts          # getDashboard
│   ├── statistics.ts         # getStatistics
│   ├── bulk.ts               # bulkUpdateTodoStatus, bulkDeleteTodos...
│   ├── notifications.ts      # Notification settings APIs
│   └── data.ts               # seedTestData, resetData
└── services/                  # 已存在，保持不变
    ├── validation.ts
    ├── planService.ts
    ├── todoService.ts
    ├── circulationService.ts
    ├── targetService.ts
    └── milestoneService.ts
```

#### 类型文件示例 (`src/lib/types/plan.ts`)

```typescript
// src/lib/types/plan.ts
export interface Plan {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface CreatePlanParams {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdatePlanParams {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: "active" | "completed" | "archived";
}
```

#### API文件示例 (`src/lib/api/plans.ts`)

```typescript
// src/lib/api/plans.ts
import type { Plan, CreatePlanParams, UpdatePlanParams } from "@/lib/types";
import { isTauri } from "./client";

export async function getPlan(id: string): Promise<Plan> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to get plan");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Plan>("get_plan", { id });
}

export async function getPlans(): Promise<Plan[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Plan[]>("get_plans");
}

export async function createPlan(data: CreatePlanParams): Promise<Plan> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to create plans");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Plan>("create_plan", {
    title: data.title,
    description: data.description || null,
    startDate: data.start_date || null,
    endDate: data.end_date || null,
  });
}

export async function updatePlan(
  id: string,
  data: UpdatePlanParams,
): Promise<Plan> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to update plans");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Plan>("update_plan", {
    id,
    title: data.title,
    description: data.description,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
  });
}

export async function deletePlan(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to delete plans");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("delete_plan", { id });
}
```

#### 统一导出 (`src/lib/types/index.ts`)

```typescript
// src/lib/types/index.ts
export * from "./common";
export * from "./plan";
export * from "./task";
export * from "./target";
export * from "./step";
export * from "./todo";
export * from "./milestone";
export * from "./circulation";
export * from "./tag";
export * from "./statistics";
export * from "./search";
export * from "./notification";
export * from "./bulk";
```

#### 迁移后的导入方式

```typescript
// 之前 (从巨型文件导入)
import { Plan, getPlan, createPlan } from "@/lib/api";

// 之后 (按需导入类型和API)
import type { Plan, CreatePlanParams } from "@/lib/types";
import { getPlan, createPlan } from "@/lib/api/plans";

// 或统一导入 (向后兼容)
import { Plan, getPlan, createPlan } from "@/lib/api";
```

#### 预估工作量

| 任务                       | 预估时间      |
| -------------------------- | ------------- |
| 创建 types/ 目录和类型文件 | 30分钟        |
| 创建 api/ 目录和API文件    | 1小时         |
| 创建统一导出的 index.ts    | 15分钟        |
| 更新所有导入路径           | 1小时         |
| 运行测试和修复             | 30分钟        |
| **总计**                   | **3-3.5小时** |

---

### 2.2 方案B: `components/ui` 分类 (优先级: P1)

#### 目标结构

```
src/components/
├── ui/                        # 纯UI组件 (无业务逻辑，可复用)
│   ├── Button.tsx
│   ├── Button.test.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Checkbox.tsx
│   ├── Calendar.tsx
│   ├── ProgressBar.tsx
│   ├── ProgressRing.tsx
│   ├── Skeleton.tsx
│   ├── Toast.tsx
│   ├── ToastProvider.tsx
│   ├── QueryProvider.tsx
│   ├── FadeIn.tsx
│   ├── ScaleIn.tsx
│   ├── PageTransition.tsx
│   ├── index.ts               # 导出所有UI组件
│   ├── animations/            # 动画组件
│   │   └── ...
│   └── charts/                # 图表组件
│       └── ...
├── layout/                    # 布局组件
│   ├── TitleBar.tsx           # 从 ui/ 移入
│   ├── PageTransition.tsx     # 从 ui/ 移入 (或保留为动画组件)
│   └── index.ts
├── features/                  # 业务组件 (包含业务逻辑)
│   ├── CheckinConfirm.tsx     # 从 ui/ 移入
│   ├── SearchBar.tsx          # 从 ui/ 移入
│   ├── ThemeSelector.tsx      # 从 ui/ 移入 (大型业务组件)
│   ├── EmptyState.tsx
│   ├── EmptyStateCard.tsx     # 从 ui/ 移入
│   ├── DraggableCard.tsx      # 从 ui/ 移入
│   ├── SortableList.tsx       # 从 ui/ 移入
│   ├── TodoFilters.tsx        # 已存在
│   ├── TodoForm.tsx           # 已存在
│   ├── CirculationCard.tsx    # 已存在
│   ├── CirculationForm.tsx    # 已存在
│   └── index.ts
└── shared/                    # (可选) 跨模块共享组件
    └── ErrorBoundary.tsx      # 从 ui/ 移入
```

#### 组件分类标准

| 分类        | 特征                       | 示例                                |
| ----------- | -------------------------- | ----------------------------------- |
| `ui/`       | 纯展示、无业务逻辑、可复用 | Button, Input, Card, Modal          |
| `layout/`   | 页面布局、全局导航         | TitleBar, Sidebar, Header           |
| `features/` | 包含业务逻辑、状态管理     | SearchBar, TodoForm, CheckinConfirm |
| `shared/`   | 跨模块共享、基础设施       | ErrorBoundary, LoadingSpinner       |

#### 迁移步骤

1. 创建 `layout/` 目录，移动 TitleBar.tsx
2. 将业务组件移至 `features/`
3. 更新 `ui/index.ts` 导出
4. 更新所有导入路径
5. 运行测试验证

#### 预估工作量

| 任务           | 预估时间      |
| -------------- | ------------- |
| 创建目录结构   | 10分钟        |
| 移动组件文件   | 30分钟        |
| 更新导出和导入 | 30分钟        |
| 运行测试和修复 | 30分钟        |
| **总计**       | **1.5-2小时** |

---

### 2.3 方案C: `ViewsView.tsx` 拆分 (优先级: P2)

#### 当前结构分析

```
ViewsView.tsx (1412行):
├── 状态管理 (~80行)
│   ├── viewMode, filters, hoveredItem
│   ├── calendarDate, ganttZoom
│   └── scrollContainerRefs, scrollIndicators
├── 数据获取 (~100行)
│   └── useQueries 并行获取 5种数据
├── 过滤逻辑 (~150行)
│   └── handleFilterChange, getFilteredItems
├── 滚动指示器逻辑 (~100行)
│   └── handleScroll, checkScrollNeeded
├── 视图渲染 (~800行)
│   ├── renderList
│   ├── renderBoard (含拖拽)
│   ├── renderCalendar
│   └── renderGantt
└── 内联样式 (~100行)
    └── style jsx global
```

#### 目标结构

```
src/app/views/
├── ViewsView.tsx              # 主入口 (~200行)
├── components/
│   ├── ViewsFilters.tsx       # 已存在，过滤组件
│   ├── ViewModeSelector.tsx   # 新增：视图模式切换按钮组
│   ├── ScrollIndicators.tsx   # 新增：滚动指示器组件
│   ├── BoardColumn.tsx        # 新增：看板列组件
│   └── GanttRow.tsx           # 新增：甘特图行组件
├── views/                     # 已存在的视图组件
│   ├── ListView.tsx
│   ├── BoardView.tsx
│   ├── CalendarView.tsx
│   └── GanttView.tsx
└── hooks/
    ├── useViewsFilters.ts     # 新增：过滤状态和逻辑
    ├── useScrollIndicators.ts # 新增：滚动指示器逻辑
    └── useViewsData.ts        # 新增：数据获取和缓存
```

#### 新增Hook: `useViewsData.ts`

```typescript
// src/app/views/hooks/useViewsData.ts
import { useQueries } from "@tanstack/react-query";
import { getTodos } from "@/lib/api/todos";
import { getPlans } from "@/lib/api/plans";
import { getTasks } from "@/lib/api/tasks";
import { getTargets } from "@/lib/api/targets";
import { getMilestones } from "@/lib/api/milestones";

export function useViewsData() {
  const queries = useQueries({
    queries: [
      { queryKey: ["todos"], queryFn: getTodos },
      { queryKey: ["plans"], queryFn: getPlans },
      { queryKey: ["tasks"], queryFn: getTasks },
      { queryKey: ["targets"], queryFn: getTargets },
      { queryKey: ["milestones"], queryFn: getMilestones },
    ],
  });

  return {
    todos: queries[0].data ?? [],
    plans: queries[1].data ?? [],
    tasks: queries[2].data ?? [],
    targets: queries[3].data ?? [],
    milestones: queries[4].data ?? [],
    isLoading: queries.some((q) => q.isLoading),
    error: queries.find((q) => q.error)?.error,
  };
}
```

#### 新增Hook: `useViewsFilters.ts`

```typescript
// src/app/views/hooks/useViewsFilters.ts
import { useState, useMemo } from "react";
import type { Todo, Task, Target, Milestone } from "@/lib/types";

export interface ViewsFilters {
  search: string;
  status: string;
  priority: string;
  planId: string;
  dateRange: { start: string; end: string };
}

export function useViewsFilters() {
  const [filters, setFilters] = useState<ViewsFilters>({
    search: "",
    status: "all",
    priority: "all",
    planId: "all",
    dateRange: { start: "", end: "" },
  });

  const updateFilter = <K extends keyof ViewsFilters>(
    key: K,
    value: ViewsFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      priority: "all",
      planId: "all",
      dateRange: { start: "", end: "" },
    });
  };

  return { filters, updateFilter, resetFilters };
}
```

#### 新增组件: `ScrollIndicators.tsx`

```typescript
// src/app/views/components/ScrollIndicators.tsx
interface ScrollIndicatorsProps {
  showTop: boolean;
  showBottom: boolean;
  topText?: string;
  bottomText?: string;
}

export function ScrollIndicators({
  showTop,
  showBottom,
  topText = "向上滑动",
  bottomText = "向下滑动",
}: ScrollIndicatorsProps) {
  return (
    <>
      {/* Top indicator */}
      <div
        className={`absolute top-0 left-0 right-0 h-14 pointer-events-none
          scroll-indicator-fade-top transition-all duration-300
          ${showTop ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <div className="flex flex-col items-center justify-start h-full pt-2">
          <div className="scroll-bounce-arrow-up">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <span className="text-xs text-gray-400 animate-pulse">{topText}</span>
        </div>
      </div>

      {/* Bottom indicator */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-14 pointer-events-none
          scroll-indicator-fade-bottom transition-all duration-300
          ${showBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="flex flex-col items-center justify-end h-full pb-2">
          <div className="scroll-bounce-arrow">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <span className="text-xs text-gray-400 mt-0.5 animate-pulse">{bottomText}</span>
        </div>
      </div>
    </>
  );
}
```

#### 预估工作量

| 任务                         | 预估时间      |
| ---------------------------- | ------------- |
| 创建 hooks/ 目录和 Hook 文件 | 1小时         |
| 创建 components/ 目录和组件  | 1小时         |
| 重构主组件 ViewsView.tsx     | 1小时         |
| 运行测试和修复               | 30分钟        |
| **总计**                     | **3-3.5小时** |

---

### 2.4 方案D: 后端 `commands` 拆分 (优先级: P3)

#### 目标结构

```
src-tauri/src/commands/
├── mod.rs                     # 统一导出
├── command_log.rs             # 已存在
├── validation.rs              # 已存在
├── window.rs                  # 已存在
├── search.rs                  # 已存在
├── plans.rs                   # 已存在 (161行)
├── tasks.rs                   # 已存在 (205行)
├── targets.rs                 # 已存在 (202行)
├── steps.rs                   # 已存在 (169行)
├── todos.rs                   # 已存在 (160行)
├── milestones.rs              # 已存在 (252行)
├── tags.rs                    # 已存在 (268行)
├── batch.rs                   # 已存在 (193行)
├── statistics.rs              # 已存在 (388行)
├── notifications.rs           # 已存在 (427行)
├── notification_plugins.rs    # 已存在 (401行)
├── export.rs                  # 已存在 (402行)
├── import.rs                  # 已存在 (571行)
├── dashboard.rs               # 已存在 (577行)
├── circulations/              # 新增：拆分打卡模块
│   ├── mod.rs                 # 导出 + CRUD
│   ├── checkin.rs             # 打卡/撤销逻辑
│   └── statistics.rs          # 打卡统计
└── data/                      # 新增：拆分数据管理
    ├── mod.rs                 # 导出
    ├── seed.rs                # 测试数据生成
    └── reset.rs               # 数据重置
```

#### 拆分 `circulations.rs`

```rust
// src-tauri/src/commands/circulations/mod.rs
mod checkin;
mod statistics;

pub use checkin::{checkin_circulation, undo_checkin};
pub use statistics::{get_circulation_statistics, get_circulation_trend};

// CRUD 函数保留在这里
#[tauri::command]
pub fn get_circulation(state: tauri::State<AppState>, id: String) -> Result<Circulation, String> {
    // ...
}

#[tauri::command]
pub fn get_circulations(state: tauri::State<AppState>) -> Result<Vec<Circulation>, String> {
    // ...
}

// ... 其他 CRUD
```

```rust
// src-tauri/src/commands/circulations/checkin.rs
use crate::models::{Circulation, CirculationLog};
use crate::AppState;

#[tauri::command]
pub fn checkin_circulation(
    state: tauri::State<AppState>,
    id: String,
    note: Option<String>,
    count: Option<i32>,
) -> Result<CirculationLog, String> {
    // 打卡逻辑
}

#[tauri::command]
pub fn undo_checkin(
    state: tauri::State<AppState>,
    log_id: String,
) -> Result<(), String> {
    // 撤销打卡逻辑
}
```

#### 拆分 `data.rs`

```rust
// src-tauri/src/commands/data/mod.rs
mod seed;
mod reset;

pub use seed::seed_test_data;
pub use reset::reset_data;
```

```rust
// src-tauri/src/commands/data/seed.rs
use crate::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SeedResult {
    pub todos: i32,
    pub plans: i32,
    pub tasks: i32,
    // ...
}

#[tauri::command]
pub fn seed_test_data(state: tauri::State<AppState>) -> Result<SeedResult, String> {
    // 测试数据生成逻辑
}
```

#### 预估工作量

| 任务                      | 预估时间    |
| ------------------------- | ----------- |
| 创建 circulations/ 子模块 | 30分钟      |
| 创建 data/ 子模块         | 30分钟      |
| 更新 mod.rs 导出          | 15分钟      |
| 运行测试验证              | 15分钟      |
| **总计**                  | **1.5小时** |

---

## 三、实施计划

### 3.1 阶段划分

| 阶段        | 内容                 | 预估时间     | 优先级 |
| ----------- | -------------------- | ------------ | ------ |
| **Phase 1** | 拆分 `api.ts`        | 3-3.5小时    | P0     |
| **Phase 2** | 分类 `components/ui` | 1.5-2小时    | P1     |
| **Phase 3** | 拆分 `ViewsView.tsx` | 3-3.5小时    | P2     |
| **Phase 4** | 拆分后端 `commands`  | 1.5小时      | P3     |
| **总计**    | -                    | **9-10小时** | -      |

### 3.2 依赖关系

```
Phase 1 (api.ts 拆分)
    ↓
Phase 2 (组件分类) ← 无依赖，可并行
    ↓
Phase 3 (ViewsView 拆分) ← 依赖 Phase 1 的类型导入
    ↓
Phase 4 (后端拆分) ← 独立，可随时进行
```

### 3.3 风险与缓解

| 风险                     | 影响 | 缓解措施                                 |
| ------------------------ | ---- | ---------------------------------------- |
| 导入路径变更导致编译错误 | 高   | 使用 TypeScript 的路径映射，保持向后兼容 |
| 测试覆盖不全             | 中   | 重构前运行全量测试，重构后验证           |
| 功能回归                 | 高   | 每阶段完成后进行手动验收                 |
| 时间超出预期             | 中   | 预留20%缓冲时间                          |

### 3.4 验收标准

#### Phase 1 验收

- [ ] `api.ts` 文件行数 < 100 (仅保留统一导出)
- [ ] `types/` 目录包含所有类型定义
- [ ] `api/` 目录包含所有API函数
- [ ] 所有导入路径正确，无编译错误
- [ ] 测试通过：`npm run test`
- [ ] 类型检查通过：`npm run typecheck`

#### Phase 2 验收

- [ ] `ui/` 目录仅包含纯UI组件
- [ ] `layout/` 目录包含布局组件
- [ ] `features/` 目录包含业务组件
- [ ] 所有导入路径正确
- [ ] 测试通过

#### Phase 3 验收

- [ ] `ViewsView.tsx` 行数 < 300
- [ ] 新增 `hooks/useViewsData.ts`
- [ ] 新增 `hooks/useViewsFilters.ts`
- [ ] 新增 `components/ScrollIndicators.tsx`
- [ ] 所有视图功能正常

#### Phase 4 验收

- [ ] `circulations.rs` 行数 < 300
- [ ] `data.rs` 行数 < 100
- [ ] Rust 编译通过
- [ ] Rust 测试通过

---

## 四、收益评估

### 4.1 代码质量提升

| 指标           | 当前 | 目标  | 改善     |
| -------------- | ---- | ----- | -------- |
| 最大文件行数   | 1421 | < 300 | -79%     |
| 平均文件行数   | ~400 | ~100  | -75%     |
| 类型与API耦合  | 100% | 0%    | 完全解耦 |
| 组件分类清晰度 | 低   | 高    | 显著提升 |

### 4.2 开发效率提升

- **导入更清晰**: `import type { Plan } from "@/lib/types"` vs `import { Plan } from "@/lib/api"`
- **定位更快速**: 文件职责单一，快速找到需要修改的位置
- **测试更简单**: 可以单独测试类型验证、API调用、组件渲染
- **重构更安全**: 改动影响范围小，回滚更容易

### 4.3 长期维护收益

- **新人上手更快**: 目录结构清晰，职责明确
- **Bug定位更快**: 问题隔离在特定模块
- **扩展更容易**: 新增类型/API只需创建新文件
- **代码审查更高效**: 每个PR影响范围更小

---

## 五、后续优化建议

### 5.1 短期 (1-2周)

1. 添加 ESLint 规则限制单文件行数
2. 创建组件分类指南文档
3. 添加架构决策记录 (ADR)

### 5.2 中期 (1个月)

1. 引入依赖注入模式，进一步解耦
2. 优化 React Query 的缓存策略
3. 添加组件库文档 (Storybook)

### 5.3 长期 (持续)

1. 定期进行架构审查
2. 监控代码复杂度指标
3. 持续优化和重构

---

## 附录

### A. 文件行数阈值建议

| 类型       | 建议最大行数 | 原因                 |
| ---------- | ------------ | -------------------- |
| React 组件 | 300          | 保持可读性，便于理解 |
| Hook       | 150          | 单一职责，易于测试   |
| API 文件   | 200          | 按实体拆分，职责清晰 |
| 类型定义   | 100          | 按领域拆分           |
| Rust 命令  | 250          | 保持可维护性         |

### B. 导入路径别名配置

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/lib/types": ["./src/lib/types"],
      "@/lib/types/*": ["./src/lib/types/*"],
      "@/lib/api": ["./src/lib/api"],
      "@/lib/api/*": ["./src/lib/api/*"],
      "@/components/ui": ["./src/components/ui"],
      "@/components/features": ["./src/components/features"],
      "@/components/layout": ["./src/components/layout"]
    }
  }
}
```

### C. 相关文档

- [AGENTS.md](../../AGENTS.md) - 项目开发指南
- [api-design.md](./api-design.md) - API设计文档
- [component-design.md](./component-design.md) - 组件设计文档

---

## 附录 D. 代码审查记录

### v0.5.7 → HEAD 审查 (2026-03-03)

**审查范围**: v0.5.7 → HEAD (18 commits)
**文件变更**: 95 files, +4491/-3119 lines

#### 发现的问题

| 优先级 | 文件 | 问题描述 | 状态 |
|--------|------|----------|------|
| P1 | `src-tauri/src/commands/data/reset.rs` | 数据重置缺少事务包装，中途失败会导致数据不一致 | ✅ 已修复 |
| P2 | `src-tauri/src/commands/circulations/statistics.rs` | 批量查询存在 N+1 问题 | ✅ 已修复 |
| P2 | `src-tauri/src/commands/validation.rs` | 验证逻辑分散，缺少统一接口 | ✅ 已评估合理 |
| P3 | 前端类型导入 | 类型导入路径不一致 (`@/lib/api` vs `@/lib/types`) | ✅ 已修复 |

#### 安全检查结果

| 检查项 | 状态 |
|--------|------|
| SQL 注入 | ✅ 安全 - 全部使用参数化查询 |
| XSS | ✅ 安全 - Tauri 桌面应用 |
| 输入验证 | ✅ 有 validation 模块 |
| 敏感数据泄露 | ✅ 安全 |

#### 架构改进亮点

1. **模块拆分**: `circulations.rs` 和 `data.rs` 拆分为子模块，符合 SRP 原则
2. **类型分离**: 前端类型从 API 模块分离到 `types` 模块
3. **Hook 提取**: ViewsView 中提取 `useEntityFilters` hook
4. **验证模块**: 新增 validation 模块集中处理输入验证

#### 修复记录 (2026-03-03)

| Commit | 描述 |
|--------|------|
| `a4ff66d` | fix(data): wrap reset_data in transaction for data integrity |
| `26f1b08` | perf(circulations): optimize batch logs query to avoid N+1 problem |
| `959c0ae` | refactor(frontend): separate type imports from API imports |


- [api-design.md](./api-design.md) - API设计文档
- [component-design.md](./component-design.md) - 组件设计文档
