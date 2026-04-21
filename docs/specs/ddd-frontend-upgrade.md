# Plan-Todos 前端 DDD 架构升级方案

> 版本: v2.0
> 日期: 2026-04-20
> 状态: 方案设计
> 关联: docs/specs/architecture-upgrade-design.md (Phase 1-3 已完成)

---

## 1. 问题诊断

### 1.1 核心架构缺陷

| 严重程度 | 问题 | 影响范围 |
|---------|------|---------|
| 🔴 P0 | page.tsx 上帝组件 (324行) | 路由、布局、导航、状态全部耦合 |
| 🔴 P0 | 5个 CRUD Hook 重复模式 (~1175行) | useTodos/usePlans/useTargets/useMilestones/useCirculations 完全相同模式 |
| 🔴 P0 | 导航配置硬编码两处 (Sidebar 430行 + BottomNav 53行) | 新增/修改导航需改两处 |
| 🟡 P1 | layout.tsx 硬编码 11 个主题名 (缺 14+ 个) | 新增主题不会生效 |
| 🟡 P1 | 无路由系统 (useState 管页面切换) | 无法支持 URL、后退、书签 |
| 🟡 P1 | 服务层极薄 (todoService 仅 5 个 filter 函数) | 业务逻辑散落在 View 和 Hook |
| 🟡 P1 | reorder.ts 绕过 apiClient 抽象直接调用 invoke | 架构一致性被破坏 |
| 🟢 P2 | 硬编码常量散落 (localStorage keys, CSS values, 中文UI文本) | 维护困难，无法国际化 |
| 🟢 P2 | 类型重复 (hooks 定义 CreateInput 与 types/ 定义重复) | 类型不同步风险 |
| 🟢 P2 | validation.ts 硬编码中文错误消息 | 国际化阻碍 |

### 1.2 依赖混乱

```
View (TodosView)
  → imports from @/lib/api (setEntityTags, setNotificationSettings)  // 跨层！
  → imports useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo...  // 多个hook
  → contains filter/state/business logic inline                   // 业务逻辑！
  
useMilestones
  → imports getPlans, getTargets, getCirculations (3个跨实体API)  // 跨领域！

Sidebar
  → defines menus[] with Chinese labels inline  // 导航配置 = 组件内
  → hardcodes entity→route mapping               // 路由逻辑 = 组件内
```

---

## 2. 目标架构 (DDD + 分层)

### 2.1 分层架构图

```
┌─────────────────────────────────────────────────────┐
│                   Presentation 层                     │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Views/    │  │  Layout  │  │  UI Components   │ │
│  │  (页面)    │  │  (壳)    │  │  (原子组件)       │ │
│  └─────┬─────┘  └────┬─────┘  └──────────────────┘ │
│        │              │                              │
│  ┌─────▼──────────────▼──────────────────────────┐ │
│  │              Application 层                     │ │
│  │  ┌───────────────────────────────────────────┐ │ │
│  │  │   Hooks (useEloquentEntity, useNavigation)│ │ │
│  │  │   → 编排领域服务 + React Query             │ │ │
│  │  └───────────────────────────────────────────┘ │ │
│  └──────────────────┬─────────────────────────────┘ │
│                     │                               │
│  ┌──────────────────▼─────────────────────────────┐ │
│  │              Domain 层                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │ │
│  │  │ Entities  │  │ Value    │  │ Domain       │ │ │
│  │  │ (聚合根)  │  │ Objects  │  │ Services     │ │ │
│  │  └──────────┘  └──────────┘  └──────────────┘ │ │
│  └──────────────────┬─────────────────────────────┘ │
│                     │                               │
│  ┌──────────────────▼─────────────────────────────┐ │
│  │              Infrastructure 层                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │ │
│  │  │   API    │  │Constants │  │   localStorage│ │ │
│  │  │ Client   │  │ /Config  │  │   Adapter    │ │ │
│  │  └──────────┘  └──────────┘  └──────────────┘ │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 2.2 目标目录结构

```
src/
├── app/
│   ├── page.tsx                    # 精简后 ~50行 (仅布局壳)
│   ├── layout.tsx                  # Root layout (fix theme init)
│   └── views/                      # 视图组件 (无业务逻辑)
│       ├── Dashboard.tsx
│       ├── TodosView.tsx
│       └── ...
├── config/                         # 【新】集中配置
│   ├── routes.ts                   # 路由/导航配置 (数据驱动)
│   ├── constants.ts                # localStorage keys, CSS constants
│   └── i18n.ts                     # UI文本国际化提取
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # 精简后 ~100行 (config-driven)
│   │   ├── BottomNav.tsx           # 精简后 ~20行 (共享配置)
│   │   └── TitleBar.tsx
│   ├── features/                   # 业务组件
│   └── ui/                         # 基础UI组件
├── domain/                         # 【新】领域层
│   ├── todo/
│   │   ├── todoTypes.ts            # 领域类型 (单一真相源)
│   │   ├── todoService.ts          # 领域服务 (业务逻辑)
│   │   └── todoQueries.ts          # React Query keys + 工厂hook
│   ├── plan/
│   │   ├── planTypes.ts
│   │   ├── planService.ts
│   │   └── planQueries.ts
│   ├── target/
│   ├── milestone/
│   ├── circulation/
│   └── shared/
│       ├── entityQueries.ts         # 【新】通用CRUD Hook工厂
│       ├── domainTypes.ts           # 跨领域共享类型
│       └── validation.ts            # 验证逻辑 (移自 lib/services)
├── hooks/                           # 通用UI hooks (保留非CRUD的)
│   ├── useAutoUpdate.ts
│   ├── useHotkey.ts
│   ├── useFormState.ts
│   └── useListNavigation.ts
├── lib/
│   ├── api/                         # 基础设施层 (保留, 修复reorder.ts)
│   │   ├── client.ts
│   │   ├── utils.ts
│   │   └── ...
│   ├── services/                    # 【重构】移至 domain/
│   └── utils/
└── stores/                          # Zustand stores
    ├── listDensity.ts
    └── navigation.ts                # 【新】导航状态管理
```

---

## 3. 实施计划

### Phase 1A: 抽取配置常量 (预计 1h)

**目标**: 消除硬编码，建立 `config/` 目录

#### 1A-1: 创建 `src/config/routes.ts`

```typescript
// src/config/routes.ts - 路由与导航配置 (单一真相源)
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;        // i18n key
  icon: string | LucideIcon;
  children?: NavItem[];
}

export interface RouteConfig {
  id: string;
  component: () => import("react").ReactNode; // lazy load
  parentId?: string;     // routes that map to same view
}

// 导航菜单 (Sidebar + BottomNav 共享)
export const NAV_MENU_ITEMS: NavItem[] = [
  { id: "dashboard", icon: "📊", label: "nav.dashboard" },
  { id: "todos", icon: "📋", label: "nav.todos" },
  { id: "circulations", icon: "🔄", label: "nav.circulations",
    children: [
      { id: "circulations-today", icon: "☀️", label: "nav.circulationsToday" },
      { id: "circulations-settings", icon: "⚙️", label: "nav.circulationsSettings" },
    ]
  },
  { id: "plans", icon: "🚀", label: "nav.plans" },
  { id: "goals", icon: "🎯", label: "nav.goals" },
  { id: "milestones", icon: "🏆", label: "nav.milestones" },
  { id: "views", icon: "👁️", label: "nav.views" },
  { id: "statistics", icon: "📈", label: "nav.statistics" },
  { id: "notifications", icon: "🔔", label: "nav.notifications",
    children: [
      { id: "notification-center", icon: "📨", label: "nav.notificationCenter" },
      { id: "settings-notifications", icon: "⚙️", label: "nav.notificationSettings" },
      { id: "settings-channels", icon: "📢", label: "nav.channels" },
      { id: "settings-daily-summary", icon: "📅", label: "nav.dailySummary" },
      { id: "settings-circulation-notifications", icon: "⏰", label: "nav.circulationNotifications" },
    ]
  },
  { id: "data-management", icon: "💾", label: "nav.dataManagement",
    children: [
      { id: "data-import-export", icon: "🔄", label: "nav.importExport" },
      { id: "settings-sync", icon: "☁️", label: "nav.sync" },
    ]
  },
  { id: "settings", icon: "⚙️", label: "nav.settings",
    children: [
      { id: "settings-general", icon: "🎨", label: "nav.general" },
      { id: "settings-tags", icon: "🏷️", label: "nav.tagManagement" },
    ]
  },
  { id: "settings-about", icon: "ℹ️", label: "nav.about" },
];

// 底部导航 (移动端)
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: "📊", label: "nav.home" },
  { id: "todos", icon: "📋", label: "nav.todos" },
  { id: "circulations", icon: "🔄", label: "nav.checkin" },
  { id: "plans", icon: "🚀", label: "nav.plans" },
  { id: "settings", icon: "⚙️", label: "nav.more" },
];

// 路由 → 视图映射 (消除 switch/case)
export const ROUTE_VIEW_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  todos: "TodosView", "todos-all": "TodosView", "todos-today": "TodosView",
  "todos-upcoming": "TodosView", "todos-completed": "TodosView",
  plans: "PlansView", "plans-active": "PlansView", "plans-archived": "PlansView",
  goals: "TargetsView", "goals-active": "TargetsView", "goals-completed": "TargetsView",
  milestones: "MilestonesView",
  views: "ViewsView",
  circulations: "CirculationsView", "circulations-today": "CirculationsView",
  "circulations-settings": "CirculationsView",
  statistics: "StatisticsView",
  notifications: "NotificationCenterView", "notification-center": "NotificationCenterView",
  "settings-channels": "SettingsChannelsView",
  "settings-daily-summary": "SettingsDailySummaryView",
  "settings-circulation-notifications": "SettingsCirculationNotificationsView",
  "settings-notifications": "SettingsNotificationsView",
  "data-management": "DataManagementView", "data-import-export": "DataManagementView",
  "settings-sync": "SettingsSyncView",
  settings: "SettingsGeneralView", "settings-general": "SettingsGeneralView",
  "settings-tags": "SettingsTagsView",
  "settings-about": "SettingsAboutView",
};

// 视图特殊参数映射 (如 CirculationDetailView 的 mode)
export const ROUTE_PARAMS_MAP: Record<string, Record<string, string>> = {
  "circulations-today": { mode: "today" },
  "circulations-settings": { mode: "settings" },
};

// 实体类型→路由映射
export const ENTITY_ROUTE_MAP: Record<string, string> = {
  todo: "todos",
  plan: "plans",
  target: "goals",
  milestone: "milestones",
};
```

#### 1A-2: 创建 `src/config/constants.ts`

```typescript
// src/config/constants.ts - 集中常量

// localStorage keys
export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "sidebar-collapsed",
  THEME: "plan-todos-theme",
  FONT_SIZE: "plan-todos-font-size",
  LIST_DENSITY: "list-density-settings",
} as const;

// CSS layout constants
export const LAYOUT = {
  SIDEBAR_WIDTH_EXPANDED: "13rem",
  SIDEBAR_WIDTH_COLLAPSED: "4rem",
  TITLE_BAR_HEIGHT: "3.5rem",
  BOTTOM_NAV_HEIGHT: "3.5rem",
  MOBILE_HEADER_HEIGHT: "3.5rem",
} as const;

// Priority ordering (domain constant, single source of truth)
export const PRIORITY_ORDER: Record<string, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
} as const;

// Valid values (derived from types, not duplicated)
export const VALID_PRIORITIES = ["P0", "P1", "P2", "P3"] as const;
export const VALID_STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;
```

#### 1A-3: 创建 `src/config/i18n.ts`

```typescript
// src/config/i18n.ts - UI文本集中管理 (Phase 1: 提取, Phase 2: i18n库)
export const MESSAGES = {
  nav: {
    dashboard: "今日总览",
    todos: "待办",
    circulations: "打卡",
    plans: "计划",
    goals: "目标",
    milestones: "里程碑",
    views: "视图查看",
    statistics: "数据统计",
    // ...
  },
  action: {
    delete: "删除",
    confirmDelete: "确认删除?",
    loading: "加载中...",
    created: "待办已创建",
    // ...
  },
  error: {
    fieldRequired: (field: string) => `${field}不能为空`,
    invalidPriority: "无效的优先级",
    invalidStatus: "无效的状态",
    fieldMaxLength: (field: string, max: number) => `${field}不能超过${max}个字符`,
  },
} as const;
```

#### 1A-4: 修复 `layout.tsx` 主题初始化

```typescript
// layout.tsx - 从 registry 动态获取所有有效主题ID
// BEFORE: hardcoded 'light' || 'dark' || 'dracula' || ... (11个)
// AFTER: 动态生成检查

import { allThemeIds } from "@/lib/themes/registry";

const initScript = `
(function() {
  var validThemes = ${JSON.stringify(allThemeIds)};
  var theme = localStorage.getItem('${STORAGE_KEYS.THEME}');
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (validThemes.includes(theme)) {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  // ... font size init
})();
`;
```

---

### Phase 1B: 创建通用 CRUD Hook 工厂 (预计 1.5h)

**目标**: 消除 5 个 entity hook 的重复 CRUD + optimistic reorder 逻辑

#### 1B-1: 创建 `src/domain/shared/entityQueries.ts`

```typescript
// src/domain/shared/entityQueries.ts - 通用 CRUD Hook 工厂
// 消除 useTodos/usePlans/useTargets/useMilestones/useCirculations 重复代码

import {
  useQuery, useMutation, useQueryClient,
  type UseQueryOptions, type UseMutationOptions,
} from "@tanstack/react-query";

/**
 * 创建实体的完整 CRUD hooks 集合
 * 
 * @example
 * // 使用前 (44行重复):
 * export const useTodos = ... useCreateTodo = ... useUpdateTodo = ...
 * 
 * // 使用后 (3行):
 * export const todoHooks = createEntityHooks<Todo, CreateTodoInput, UpdateTodoInput>({
 *   queryKey: "todos",
 *   getAllFn: getTodos,
 *   getOneFn: (id) => getTodo(id),
 *   createFn: createTodo,
 *   updateFn: ({ id, ...data }) => updateTodo(id, data),
 *   deleteFn: deleteTodo,
 * });
 * 
 * // 在组件中使用:
 * const { useGetAll, useGetOne, useCreate, useUpdate, useDelete } = todoHooks;
 */
export function createEntityHooks<TEntity, TCreateInput, TUpdateInput>(config: {
  queryKey: string;
  getAllFn: () => Promise<TEntity[]>;
  getOneFn?: (id: string) => Promise<TEntity>;
  createFn: (input: TCreateInput) => Promise<TEntity>;
  updateFn: (input: TUpdateInput) => Promise<TEntity>;
  deleteFn: (id: string) => Promise<void>;
  reorderFn?: (orders: { id: string; sort_order: number }[]) => Promise<number>;
}) {
  const { queryKey, getAllFn, getOneFn, createFn, updateFn, deleteFn, reorderFn } = config;
  
  const keys = {
    all: [queryKey] as const,
    one: (id: string) => [queryKey, id] as const,
  };

  function useGetAll(options?: Omit<UseQueryOptions<TEntity[], Error>, "queryKey" | "queryFn">) {
    return useQuery<TEntity[], Error>({
      queryKey: keys.all,
      queryFn: getAllFn,
      ...options,
    });
  }

  function useGetOne(id: string, options?: Omit<UseQueryOptions<TEntity, Error>, "queryKey" | "queryFn">) {
    return useQuery<TEntity, Error>({
      queryKey: keys.one(id),
      queryFn: () => getOneFn!(id),
      enabled: !!id && !!getOneFn,
      ...options,
    });
  }

  function useCreate(options?: Omit<UseMutationOptions<TEntity, Error, TCreateInput>, "mutationFn">) {
    const queryClient = useQueryClient();
    return useMutation<TEntity, Error, TCreateInput>({
      mutationFn: createFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.all });
      },
      ...options,
    });
  }

  function useUpdate(options?: Omit<UseMutationOptions<TEntity, Error, TUpdateInput>, "mutationFn">) {
    const queryClient = useQueryClient();
    return useMutation<TEntity, Error, TUpdateInput>({
      mutationFn: updateFn,
      onSuccess: (data) => {
        queryClient.setQueryData<TEntity[]>(keys.all, (old) => {
          if (!old) return old;
          return old.map((item) => (item.id === (data as { id: string }).id ? data : item));
        });
      },
      ...options,
    });
  }

  function useDelete(options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">) {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
      mutationFn: deleteFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.all });
      },
      ...options,
    });
  }

  function useReorder(options?: Omit<UseMutationOptions<number, Error, { id: string; sort_order: number }[]>, "mutationFn">) {
    const queryClient = useQueryClient();
    
    if (!reorderFn) {
      throw new Error(`Reorder not supported for entity: ${queryKey}`);
    }

    return useMutation<number, Error, { id: string; sort_order: number }[]>({
      mutationFn: reorderFn,
      onMutate: async (newOrders) => {
        await queryClient.cancelQueries({ queryKey: keys.all });
        const previousData = queryClient.getQueryData<TEntity[]>(keys.all);
        if (previousData) {
          const updated = previousData.map((item) => {
            const order = newOrders.find((o) => o.id === (item as { id: string }).id);
            return order ? { ...item, sort_order: order.sort_order } : item;
          });
          updated.sort((a, b) => (a as { sort_order: number }).sort_order - (b as { sort_order: number }).sort_order);
          queryClient.setQueryData(keys.all, updated);
        }
        return { previousData };
      },
      onError: (_err, _newOrders, context) => {
        const ctx = context as { previousData?: TEntity[] } | undefined;
        if (ctx?.previousData) {
          queryClient.setQueryData(keys.all, ctx.previousData);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: keys.all });
      },
      ...options,
    });
  }

  return {
    keys,
    useGetAll,
    useGetOne,
    useCreate,
    useUpdate,
    useDelete,
    useReorder,
  };
}
```

#### 1B-2: 重构各实体 Hook 使用工厂

```typescript
// src/domain/todo/todoQueries.ts (替代 src/hooks/useTodos.ts - 从187行→30行)
import { createEntityHooks } from "../shared/entityQueries";
import type { Todo } from "@/lib/types";
import { getTodo, getTodos, createTodo, updateTodo, deleteTodo } from "@/lib/api";
import { reorderTodos } from "@/lib/api/reorder";
import type { CreateTodoInput, UpdateTodoInput } from "./todoTypes";

export const todoHooks = createEntityHooks<Todo, CreateTodoInput, UpdateTodoInput>({
  queryKey: "todos",
  getAllFn: getTodos,
  getOneFn: getTodo,
  createFn: createTodo,
  updateFn: ({ id, ...data }) => updateTodo(id, data),
  deleteFn: deleteTodo,
  reorderFn: reorderTodos,
});

// Re-export for convenience
export const { useGetAll: useTodos, useGetOne: useTodo, useCreate: useCreateTodo, 
               useUpdate: useUpdateTodo, useDelete: useDeleteTodo, useReorder: useReorderTodos } = todoHooks;
export const { keys: todoKeys } = todoHooks;
```

#### 1B-3: 重构其他实体 (Plans, Targets, Milestones, Circulations)

每个实体类似:

```typescript
// src/domain/plan/planQueries.ts
export const planHooks = createEntityHooks<Plan, PlanCreateInput, PlanUpdateInput>({ ... });
// + 额外的 usePlanTags, usePlanTasks hook 保留在文件中
```

#### 1B-4: 修复 `reorder.ts` 使用 apiClient

```typescript
// src/lib/api/reorder.ts - 使用 apiClient 而非直接 invoke
import { invoke } from "./client";  // 从 client 导入,不是 @tauri-apps

export async function reorderTodos(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map((o) => [o.id, o.sort_order] as [string, number]);
  return invoke<number>("reorder_todos", { orders: ordersTuple });
}
// ... 同理 reorderPlans, reorderTargets
```

---

### Phase 1C: 建立领域模型层 (预计 2h)

**目标**: 将散落的业务逻辑集中到 domain/ 层

#### 1C-1: 类型统一 (消除 hooks 和 types 之间的重复)

```typescript
// src/domain/todo/todoTypes.ts - 领域类型 (单一真相源)
import type { Priority, Recurrence } from "@/lib/types/common";

export type TodoStatus = "pending" | "in-progress" | "done";

export interface CreateTodoInput {
  title: string;
  content?: string;
  due_date?: string;
  priority?: Priority;
  recurrence?: Recurrence;
}

export interface UpdateTodoInput {
  id: string;
  title?: string;
  content?: string;
  due_date?: string;
  status?: TodoStatus;
  priority?: Priority;
  recurrence?: Recurrence;
}
```

#### 1C-2: 领域服务 (从 service + hooks 中提取业务逻辑)

```typescript
// src/domain/todo/todoService.ts - 领域服务 (真正的业务逻辑)
import { PRIORITY_ORDER } from "@/config/constants";
import type { Todo } from "@/lib/types";
import type { CreateTodoInput, UpdateTodoInput, TodoStatus } from "./todoTypes";

export const todoDomainService = {
  /** 按优先级筛选 */
  filterByPriority(todos: Todo[], priority: string): Todo[] {
    return todos.filter((t) => t.priority === priority);
  },

  /** 按状态分组 */
  groupByStatus(todos: Todo[]): Record<TodoStatus, Todo[]> {
    return todos.reduce((acc, todo) => {
      const status = (todo.status || "pending") as TodoStatus;
      if (!acc[status]) acc[status] = [];
      acc[status].push(todo);
      return acc;
    }, {} as Record<TodoStatus, Todo[]>);
  },

  /** 按优先级排序 */
  sortByPriority(todos: Todo[]): Todo[] {
    return [...todos].sort(
      (a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99),
    );
  },

  /** 获取即将到期的待办 */
  getDueSoon(todos: Todo[], days: number = 3): Todo[] {
    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return todos.filter((t) => {
      if (!t.due_date) return false;
      return new Date(t.due_date) <= threshold;
    });
  },

  /** 验证创建输入 */
  validateCreate(input: CreateTodoInput): string[] {
    const errors: string[] = [];
    if (!input.title?.trim()) errors.push("标题不能为空");
    if (input.title && input.title.length > 500) errors.push("标题不能超过500个字符");
    return errors;
  },
};
```

#### 1C-3: 验证逻辑迁移到 domain/shared

```typescript
// src/domain/shared/validation.ts - 替代 lib/services/validation.ts
import { VALID_PRIORITIES, VALID_STATUSES } from "@/config/constants";
import { MESSAGES } from "@/config/i18n";

export interface ValidationError {
  field: string;
  message: string;
}

export function required(value: unknown, fieldName: string): ValidationError | null {
  if (value === null || value === undefined || value === "") {
    return { field: fieldName, message: MESSAGES.error.fieldRequired(fieldName) };
  }
  if (typeof value === "string" && value.trim() === "") {
    return { field: fieldName, message: MESSAGES.error.fieldRequired(fieldName) };
  }
  return null;
}

export function maxLength(value: string, max: number, fieldName: string): ValidationError | null {
  if (value && value.length > max) {
    return { field: fieldName, message: MESSAGES.error.fieldMaxLength(fieldName, max) };
  }
  return null;
}

export function validatePriority(priority: string): ValidationError | null {
  if (!(VALID_PRIORITIES as readonly string[]).includes(priority)) {
    return { field: "priority", message: MESSAGES.error.invalidPriority };
  }
  return null;
}

export function validateStatus(status: string): ValidationError | null {
  if (!(VALID_STATUSES as readonly string[]).includes(status)) {
    return { field: "status", message: MESSAGES.error.invalidStatus };
  }
  return null;
}
```

---

### Phase 2A: 重构路由系统 (预计 1.5h)

**目标**: 消除 page.tsx 的 switch/case, 用配置驱动路由

#### 2A-1: 创建 `src/stores/navigation.ts` (Zustand)

```typescript
// src/stores/navigation.ts - 导航状态管理
import { create } from "zustand";
import { ROUTE_VIEW_MAP, BOTTOM_NAV_ITEMS } from "@/config/routes";

interface NavigationState {
  activeRoute: string;
  circulationDetailId: string | null;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  
  // Actions
  setActiveRoute: (route: string) => void;
  setCirculationDetailId: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeRoute: "dashboard",
  circulationDetailId: null,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,

  setActiveRoute: (route) => set({ activeRoute: route }),
  setCirculationDetailId: (id) => set({ circulationDetailId: id }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));

// 使用方便的 selector
export const useActiveRoute = () => useNavigationStore((s) => s.activeRoute);
export const useCirculationDetailId = () => useNavigationStore((s) => s.circulationDetailId);
```

#### 2A-2: 创建 `src/app/views/ViewRouter.tsx`

```typescript
// src/app/views/ViewRouter.tsx - 配置驱动的视图路由
import { lazy, Suspense } from "react";
import { ROUTE_VIEW_MAP, ROUTE_PARAMS_MAP } from "@/config/routes";
import { useActiveRoute } from "@/stores/navigation";
import { PageSlide } from "@/components/ui/animations";
import { CirculationDetailView } from "./CirculationDetailView";

// Lazy load views
const viewComponents: Record<string, React.LazyExoticComponent<typeof import("./Dashboard").Dashboard>> = {
  Dashboard: lazy(() => import("./Dashboard").then(m => ({ default: m.Dashboard }))),
  TodosView: lazy(() => import("./TodosView").then(m => ({ default: m.TodosView }))),
  PlansView: lazy(() => import("./PlansView").then(m => ({ default: m.PlansView }))),
  TargetsView: lazy(() => import("./TargetsView").then(m => ({ default: m.TargetsView }))),
  MilestonesView: lazy(() => import("./MilestonesView").then(m => ({ default: m.MilestonesView }))),
  ViewsView: lazy(() => import("./ViewsView").then(m => ({ default: m.ViewsView }))),
  CirculationsView: lazy(() => import("./CirculationsView").then(m => ({ default: m.CirculationsView }))),
  StatisticsView: lazy(() => import("./StatisticsView").then(m => ({ default: m.StatisticsView }))),
  NotificationCenterView: lazy(() => import("./NotificationCenterView").then(m => ({ default: m.NotificationCenterView }))),
  SettingsChannelsView: lazy(() => import("./SettingsChannelsView").then(m => ({ default: m.SettingsChannelsView }))),
  SettingsDailySummaryView: lazy(() => import("./SettingsDailySummaryView").then(m => ({ default: m.SettingsDailySummaryView }))),
  SettingsAboutView: lazy(() => import("./SettingsAboutView").then(m => ({ default: m.SettingsAboutView }))),
  SettingsTagsView: lazy(() => import("./SettingsTagsView").then(m => ({ default: m.SettingsTagsView }))),
  SettingsCirculationNotificationsView: lazy(() => import("./SettingsCirculationNotificationsView").then(m => ({ default: m.SettingsCirculationNotificationsView }))),
  SettingsNotificationsView: lazy(() => import("./SettingsNotificationsView").then(m => ({ default: m.SettingsNotificationsView }))),
  SettingsSyncView: lazy(() => import("./SettingsSyncView").then(m => ({ default: m.SettingsSyncView }))),
  SettingsGeneralView: lazy(() => import("./SettingsGeneralView").then(m => ({ default: m.SettingsGeneralView }))),
  DataManagementView: lazy(() => import("./DataManagementView").then(m => ({ default: m.DataManagementView }))),
};

export function ViewRouter() {
  const activeRoute = useActiveRoute();
  const viewName = ROUTE_VIEW_MAP[activeRoute] ?? "Dashboard";
  const ViewComponent = viewComponents[viewName];
  const params = ROUTE_PARAMS_MAP[activeRoute];
  
  if (!ViewComponent) return <Dashboard />;

  return (
    <PageSlide key={activeRoute}>
      <Suspense fallback={<LoadingSpinner />}>
        <ViewComponent {...(params ?? {})} />
      </Suspense>
    </PageSlide>
  );
}
```

#### 2A-3: 简化 `page.tsx`

```typescript
// src/app/page.tsx - 精简后 ~50行
"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TitleBar } from "@/components/layout/TitleBar";
import { ViewRouter } from "./views/ViewRouter";
import { CirculationDetailView } from "./views/CirculationDetailView";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { useNavigationStore } from "@/stores/navigation";

export default function Home() {
  const { activeRoute, circulationDetailId, setCirculationDetailId, 
          sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setActiveRoute, setMobileSidebarOpen } = 
    useNavigationStore();

  return (
    <div className="flex flex-col h-screen" style={{ background: "transparent", fontFamily: "var(--font-sans)" }}>
      {/* Desktop layout */}
      <div className="hidden md:flex flex-col h-screen rounded-lg overflow-hidden border border-[var(--color-border)] shadow-lg">
        <TitleBar />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:block h-full">
            <Sidebar activeMenu={activeRoute} onMenuChange={setActiveRoute} onCollapseChange={setSidebarCollapsed} />
          </div>
          <main className="flex-1 overflow-auto pb-16 md:pb-0" style={{ backgroundColor: "var(--color-bg)" }}>
            <ViewRouter />
          </main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex flex-col h-full">
        <MobileSidebar />
        <main className="flex-1 overflow-auto" style={{ backgroundColor: "var(--color-bg)" }}>
          <ViewRouter />
        </main>
      </div>

      <BottomNav activeMenu={activeRoute} onMenuChange={setActiveRoute} />
      
      {circulationDetailId && (
        <CirculationDetailView id={circulationDetailId} onClose={() => setCirculationDetailId(null)} />
      )}
    </div>
  );
}
```

---

### Phase 2B: 分离视图层关注点 (预计 2h)

**目标**: 从 TodosView 等视图中提取业务逻辑到领域服务

#### 2B-1: 提取 TodosView 业务逻辑

从 TodosView.tsx (316行) 提取:
- `useTodosFilter` hook → `src/domain/todo/todoFilterHooks.ts`
- 筛选/搜索/priority 状态管理 → Zustand store 或 custom hook
- handleSave/handleToggle/handleDelete → 调用 `todoHooks.useCreate()/.useUpdate()/.useDelete()`

```typescript
// src/domain/todo/todoFilterHooks.ts - 从 TodosView 提取的筛选逻辑
import { useState, useMemo } from "react";
import type { Todo } from "@/lib/types";
import type { Priority, TodoStatus } from "./todoTypes";

interface TodoFilters {
  search: string;
  priorityFilter: Priority | "all";
  tagFilter: string[];
  statusFilter: TodoStatus | "all";
  viewMode: "list" | "calendar";
}

export function useTodosFilter(todos: Todo[]) {
  const [filters, setFilters] = useState<TodoFilters>({
    search: "",
    priorityFilter: "all",
    tagFilter: [],
    statusFilter: "all",
    viewMode: "list",
  });

  const filteredTodos = useMemo(() => {
    let result = todos;
    if (filters.search) result = result.filter(t => t.title.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.priorityFilter !== "all") result = result.filter(t => t.priority === filters.priorityFilter);
    if (filters.tagFilter.length > 0) result = result.filter(t => filters.tagFilter.some(tag => t.tags?.includes(tag)));
    if (filters.statusFilter !== "all") result = result.filter(t => t.status === filters.statusFilter);
    return result;
  }, [todos, filters]);

  return { filters, setFilters, filteredTodos };
}
```

---

### Phase 2C: 重构 Sidebar/BottomNav (预计 1h)

**目标**: 导航配置共享，消除重复

#### 2C-1: 重构 Sidebar 使用共享配置

```typescript
// 精简 Sidebar ~100行 (从430行)
import { NAV_MENU_ITEMS, ENTITY_ROUTE_MAP } from "@/config/routes";
import { MESSAGES } from "@/config/i18n";
import { STORAGE_KEYS, LAYOUT } from "@/config/constants";

export function Sidebar({ activeMenu, onMenuChange, onCollapseChange, isMobile }: SidebarProps) {
  // ... 简化后的 Sidebar 组件
  // menus 不再内联，从 NAV_MENU_ITEMS 读取
  // width = isCollapsed ? LAYOUT.SIDEBAR_WIDTH_COLLAPSED : LAYOUT.SIDEBAR_WIDTH_EXPANDED
  // localStorage key = STORAGE_KEYS.SIDEBAR_COLLAPSED
}
```

#### 2C-2: 重构 BottomNav 使用共享配置

```typescript
// BottomNav 从53行→20行
import { BOTTOM_NAV_ITEMS } from "@/config/routes";
import { MESSAGES } from "@/config/i18n";

export function BottomNav({ activeMenu, onMenuChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40 border-t pb-[env(safe-area-inset-bottom)]"
         style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
      <div className="flex justify-around items-center h-14">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <BottomNavItem key={item.id} item={item} activeMenu={activeMenu} onMenuChange={onMenuChange} />
        ))}
      </div>
    </nav>
  );
}
```

#### 2C-3: 提取 MobileSidebar 组件

从 page.tsx 中提取移动端侧边栏覆盖层为 `src/components/layout/MobileSidebar.tsx`

---

### Phase 3: 统一类型系统 (预计 1h)

**目标**: 消除 hooks 和 types 之间的重复类型定义

#### 3-1: 迁移类型到 domain 层

| 当前位置 | 目标位置 | 动作 |
|---------|---------|------|
| `hooks/useTodos.ts` CreateTodoInput | `domain/todo/todoTypes.ts` CreateTodoInput | 迁移 |
| `hooks/useTodos.ts` UpdateTodoInput | `domain/todo/todoTypes.ts` UpdateTodoInput | 迁移 |
| `hooks/usePlans.ts` CreatePlanInput | `domain/plan/planTypes.ts` CreatePlanInput | 迁移 |
| `hooks/usePlans.ts` PlanStatus | `domain/plan/planTypes.ts` PlanStatus | 迁移 |
| `hooks/useTargets.ts` CreateTargetInput | `domain/target/targetTypes.ts` CreateTargetInput | 迁移 |
| `lib/types/common.ts` Priority, EntityType | 保留不变 (已合理) | - |
| `lib/services/validation.ts` VALID_PRIORITIES | `config/constants.ts` VALID_PRIORITIES | 迁移 |
| `lib/services/validation.ts` VALID_STATUSES | `config/constants.ts` VALID_STATUSES | 迁移 |

#### 3-2: 更新所有导入路径

- 组件中的 `import { CreateTodoInput } from "@/hooks/useTodos"` → `import { CreateTodoInput } from "@/domain/todo/todoTypes"`
- 保留 re-export 的兼容性别名 (标记 `@deprecated`)

---

### Phase 4: Review 和验证 (预计 1h)

#### 4-1: 运行全量测试

```bash
npm run test           # 所有测试通过
npm run typecheck      # TypeScript 类型检查通过
npm run lint           # ESLint 无新增错误
npm run build          # 构建成功
```

#### 4-2: 验证代码行数减少

| 文件 | 重构前 | 重构后 (目标) | 减少 |
|------|--------|-------------|------|
| page.tsx | 324 | ~50 | -85% |
| Sidebar.tsx | 430 | ~100 | -77% |
| BottomNav.tsx | 53 | ~20 | -62% |
| useTodos.ts | 187 | ~30 | -84% |
| usePlans.ts | 244 | ~50 | -80% |
| useTargets.ts | 341 | ~80 | -77% |
| useMilestones.ts | 181 | ~40 | -78% |
| useCirculations.ts | 222 | ~50 | -77% |
| validation.ts | 91 | ~20 (移至domain) | -78% |
| **新增文件** | | | |
| entityQueries.ts | 0 | ~110 | - |
| routes.ts | 0 | ~80 | - |
| constants.ts | 0 | ~30 | - |
| i18n.ts | 0 | ~50 | - |
| todoQueries.ts | 0 | ~30 | - |
| todoService.ts | 0 | ~60 | - |
| navigation.ts (store) | 0 | ~30 | - |
| ViewRouter.tsx | 0 | ~60 | - |

#### 4-3: 确认无功能回归

- 所有 CRUD 操作正常
- 导航切换正常 (Sidebar + BottomNav + URL)
- 主题切换正常 (所有 25+ 主题)
- 移动端布局正常
- 排序拖拽 optimistic update 正常
- localStorage 持久化正常

---

## 4. 实施顺序与提交策略

### Git 提交计划

```
Phase 1A  → commit: refactor: extract config constants (routes, constants, i18n)
Phase 1A-4 → commit: fix: use theme registry for layout init (fix missing themes)
Phase 1B-1 → commit: refactor: create generic entity CRUD hook factory
Phase 1B-2/3 → commit: refactor: migrate entity hooks to use hook factory
Phase 1B-4 → commit: fix: use apiClient in reorder.ts instead of raw invoke
Phase 1C-1 → commit: refactor: unify entity types in domain layer
Phase 1C-2 → commit: refactor: create domain services with business logic
Phase 1C-3 → commit: refactor: migrate validation to domain/shared
Phase 2A-1/2/3 → commit: refactor: replace page.tsx god component with config-driven routing
Phase 2B-1 → commit: refactor: extract filter logic from TodosView
Phase 2C-1/2/3 → commit: refactor: shared navigation config for Sidebar and BottomNav
Phase 3-1/2 → commit: refactor: unify type system, remove duplicate type definitions
Phase 4 → commit: verify: all tests pass, typecheck clean
```

---

## 5. 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| Lazy loading 视图导致加载闪烁 | 使用 Suspense + skeleton loading |
| Zustand navigation store 与现有 useState 行为不同 | 保留 localStorage sync 行为 |
| Hook 工厂的泛型类型复杂 | 使用 good generics + JSDoc, 提供 example |
| 迁移 hooks 后组件导入路径变化 | 保留 re-export 兼容别名 (@deprecated) |
| 现有测试可能需要更新 | 先跑测试确认 baseline, 逐步更新 |

---

## 6. 未来优化 (超出现有范围)

1. **完整 i18n**: 当前仅提取文本常量,未来可接入 next-intl 或类似库
2. **URL 路由**: 当前用 Zustand 管理导航, 理想情况下应用 Next.js App Router 或 hash router
3. **领域事件**: 引入 DomainEvent 跨聚合通信 (如 TodoCompleted 事件)
4. **更多聚合根**: Milestone 作为聚合根管理 Target 子实体
5. **CQRS 分离**: 读写操作分离 (Query hooks vs Command hooks)