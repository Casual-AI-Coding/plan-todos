# DDD Architecture Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining frontend and backend DDD migration by moving CRUD/query/type logic into domain modules, finishing navigation state centralization, extracting Todos view behavior into focused domain hooks, and closing the backend validation and verification gaps.

**Architecture:** The repo already completed the first extraction wave (`config/`, `ViewRouter`, repository layer, generic hook factory), so this plan finishes the migration incrementally with compatibility shims. Each entity gets a domain-owned `*Types.ts` and `*Queries.ts` module, presentation components consume domain hooks instead of direct API wrappers, and the remaining page/view state moves into explicit domain/application hooks or Zustand stores.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, TanStack Query v5, Vitest, Tauri v2, Rust, rusqlite

---

## Scope and sequencing notes

- `src/app/page.tsx` is already slimmed down to 103 lines and already renders `ViewRouter`.
- `src/components/layout/Sidebar.tsx` and `src/components/layout/BottomNav.tsx` already consume `src/config/routes.ts`.
- `src/config/routes.ts` and `src/components/layout/ViewRouter.tsx` already implement config-driven route lookup.
- `src/stores/navigation.ts` and `src/domain/*/*Queries.ts` do **not** exist yet.
- `src/hooks/useTodos.ts`, `usePlans.ts`, `useTargets.ts`, `useMilestones.ts`, `useCirculations.ts`, and `useTags.ts` still own entity query logic and duplicate types.
- `src/domain/*/*Service.ts` files currently contain only pure helper logic; they do **not** yet own CRUD orchestration.
- `src/hooks/useEntityOperations.ts` still reaches across layers into `@/lib/api` for tags and notification settings.
- `src/app/views/TodosView.tsx` still owns 9 local state values and inline filter/dropdown/form behavior.
- `src-tauri/src/commands/validation.rs` still contains duplicated value arrays and mismatched statuses.

Because of that current state, the safest execution order is:

1. Finish navigation state ownership.
2. Move query factories into `domain/shared` and add compatibility re-exports.
3. Migrate entity types + entity query hooks into `domain/*` one entity at a time.
4. Move cross-layer side effects from generic hooks into entity/domain services.
5. Extract Todos view state and filter logic after the new hooks exist.
6. Finish Rust validation constants and add focused tests.
7. Run full verification once the migration is complete.

## Phase breakdown and effort

| Phase | Scope                                            | Depends on | Estimated effort |
| ----- | ------------------------------------------------ | ---------- | ---------------- |
| 1     | Navigation store integration                     | none       | 1.5h             |
| 2     | Shared query factory relocation                  | Phase 1    | 1h               |
| 3     | Todo domain migration                            | Phase 2    | 1.5h             |
| 4     | Plan and target domain migration                 | Phase 3    | 2h               |
| 5     | Milestone, circulation, and tag domain migration | Phase 4    | 2h               |
| 6     | Generic hook cleanup and Todos view extraction   | Phase 5    | 2.5h             |
| 7     | Rust validation/constants/tests                  | none       | 1.5h             |
| 8     | Full verification and cleanup                    | Phases 1-7 | 1h               |

## Planned file structure after this plan

- `src/stores/navigation.ts` — single source of truth for active menu and mobile sidebar visibility.
- `src/domain/shared/entityQueries.ts` — domain-owned replacement for `src/hooks/createEntityHooks.ts`.
- `src/domain/todo/todoTypes.ts` / `todoQueries.ts` — todo input types and query hooks.
- `src/domain/plan/planTypes.ts` / `planQueries.ts` — plan input types and query hooks.
- `src/domain/target/targetTypes.ts` / `targetQueries.ts` — target and step query hooks.
- `src/domain/milestone/milestoneTypes.ts` / `milestoneQueries.ts` — milestone query hooks.
- `src/domain/circulation/circulationTypes.ts` / `circulationQueries.ts` — circulation query hooks.
- `src/domain/tag/tagTypes.ts` / `tagQueries.ts` — tag query hooks.
- `src/domain/todo/todoViewState.ts` — local UI state orchestration for `TodosView`.
- `src/domain/todo/todoFilters.ts` — todo-specific filter and calendar selectors.
- `src/domain/shared/entityOperations.ts` — side-effect helpers now called from domain-aware hooks instead of direct API imports inside generic hooks.
- `src-tauri/src/commands/validation.rs` — constants + validator helpers.
- `src-tauri/src/tests.rs` — additional validation-focused unit tests.

---

### Task 1: Add a navigation store and connect the existing router shell

**Files:**

- Create: `src/stores/navigation.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/BottomNav.tsx`
- Modify: `src/components/layout/MobileSidebar.tsx`
- Test: `src/stores/__tests__/navigation.test.ts`

- [ ] **Step 1: Write the failing navigation store test**

```ts
import { beforeEach, describe, expect, it } from "vitest";

import { useNavigationStore } from "@/stores/navigation";

describe("useNavigationStore", () => {
  beforeEach(() => {
    useNavigationStore.setState({
      activeMenu: "dashboard",
      mobileSidebarOpen: false,
    });
  });

  it("updates the active menu through navigate", () => {
    useNavigationStore.getState().navigate("todos");

    expect(useNavigationStore.getState().activeMenu).toBe("todos");
  });

  it("opens and closes the mobile sidebar", () => {
    useNavigationStore.getState().openMobileSidebar();
    expect(useNavigationStore.getState().mobileSidebarOpen).toBe(true);

    useNavigationStore.getState().closeMobileSidebar();
    expect(useNavigationStore.getState().mobileSidebarOpen).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- src/stores/__tests__/navigation.test.ts`
Expected: FAIL with `Cannot find module '@/stores/navigation'`.

- [ ] **Step 3: Create the navigation store**

```ts
import { create } from "zustand";

interface NavigationState {
  activeMenu: string;
  mobileSidebarOpen: boolean;
  navigate: (menu: string) => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeMenu: "dashboard",
  mobileSidebarOpen: false,
  navigate: (menu) => set({ activeMenu: menu }),
  openMobileSidebar: () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
```

- [ ] **Step 4: Replace `useState` routing state in `src/app/page.tsx` with the store**

```tsx
import { useEffect, useState } from "react";
import { useNavigationStore } from "@/stores/navigation";

export default function Home() {
  const activeMenu = useNavigationStore((s) => s.activeMenu);
  const navigate = useNavigationStore((s) => s.navigate);
  const mobileSidebarOpen = useNavigationStore((s) => s.mobileSidebarOpen);
  const openMobileSidebar = useNavigationStore((s) => s.openMobileSidebar);
  const closeMobileSidebar = useNavigationStore((s) => s.closeMobileSidebar);
  const [, setSidebarCollapsed] = useState(getInitialSidebarCollapsed);

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "transparent", fontFamily: "var(--font-sans)" }}
    >
      <div className="hidden md:flex flex-col h-screen rounded-lg overflow-hidden border border-[var(--color-border)] shadow-lg">
        <TitleBar />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:block h-full">
            <Sidebar
              activeMenu={activeMenu}
              onMenuChange={navigate}
              onCollapseChange={setSidebarCollapsed}
            />
          </div>
          <main
            className="flex-1 overflow-auto pb-16 md:pb-0"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <ViewRouter activeMenu={activeMenu} />
          </main>
        </div>
      </div>

      <div className="md:hidden flex flex-col h-full">
        <header
          className="flex items-center px-4 border-b fixed top-0 left-0 right-0 z-40"
          style={{
            height: LAYOUT.MOBILE_HEADER_CALC,
            paddingTop: "env(safe-area-inset-top)",
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
          }}
        >
          <button
            onClick={openMobileSidebar}
            className="p-2 -ml-2 rounded hover:opacity-80"
            style={{ color: "var(--color-text)" }}
            aria-label="打开菜单"
          >
            {/* svg stays unchanged */}
          </button>
        </header>

        <main
          className="flex-1 overflow-auto"
          style={{
            backgroundColor: "var(--color-bg)",
            paddingTop: LAYOUT.MOBILE_HEADER_CALC,
            paddingBottom: LAYOUT.MOBILE_FOOTER_CALC,
          }}
        >
          <ViewRouter activeMenu={activeMenu} />
        </main>

        {mobileSidebarOpen && (
          <MobileSidebar
            activeMenu={activeMenu}
            onMenuChange={navigate}
            onClose={closeMobileSidebar}
            onCollapseChange={setSidebarCollapsed}
          />
        )}
      </div>

      <BottomNav activeMenu={activeMenu} onMenuChange={navigate} />
    </div>
  );
}
```

- [ ] **Step 5: Ensure the nav components stay prop-compatible while delegating to the store caller**

```tsx
// src/components/layout/MobileSidebar.tsx
<Sidebar
  activeMenu={activeMenu}
  onMenuChange={(menu) => {
    onMenuChange(menu);
    onClose();
  }}
  onCollapseChange={onCollapseChange}
  isMobile
/>
```

Keep `Sidebar.tsx` and `BottomNav.tsx` prop signatures unchanged in this task; only update imports or internal helpers if lint requires it.

- [ ] **Step 6: Run the focused verification**

Run: `npm run test -- src/stores/__tests__/navigation.test.ts`
Expected: PASS.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/stores/navigation.ts src/stores/__tests__/navigation.test.ts src/app/page.tsx src/components/layout/Sidebar.tsx src/components/layout/BottomNav.tsx src/components/layout/MobileSidebar.tsx
git commit -m "refactor(navigation): centralize active menu state in zustand"
```

---

### Task 2: Move the generic entity hook factory into the domain layer

**Files:**

- Create: `src/domain/shared/entityQueries.ts`
- Modify: `src/hooks/createEntityHooks.ts`
- Test: `src/domain/shared/__tests__/entityQueries.test.ts`

- [ ] **Step 1: Write the failing shared query factory test**

```ts
import { describe, expect, it } from "vitest";

import { createEntityHooks } from "@/domain/shared/entityQueries";

describe("createEntityHooks", () => {
  it("exposes stable query keys for all and one", () => {
    const hooks = createEntityHooks({
      entityName: "todos",
      apiGetAll: async () => [],
      apiGetOne: async () => ({ id: "1" }),
      apiCreate: async () => ({ id: "1" }),
      apiUpdate: async () => ({ id: "1" }),
      apiDelete: async () => undefined,
    });

    expect(hooks.queryKeys.all).toEqual(["todos"]);
    expect(hooks.queryKeys.one("1")).toEqual(["todos", "1"]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- src/domain/shared/__tests__/entityQueries.test.ts`
Expected: FAIL because `src/domain/shared/entityQueries.ts` does not exist.

- [ ] **Step 3: Create `src/domain/shared/entityQueries.ts` by copying the full factory implementation from `src/hooks/createEntityHooks.ts`**

```ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

export interface EntityHookConfig<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TReorderInput = { id: string; sort_order: number }[],
> {
  entityName: string;
  apiGetAll: () => Promise<TEntity[]>;
  apiGetOne?: (id: string) => Promise<TEntity>;
  apiCreate: (input: TCreateInput) => Promise<TEntity>;
  apiUpdate: (id: string, data: Omit<TUpdateInput, "id">) => Promise<TEntity>;
  apiDelete: (id: string) => Promise<void>;
  apiReorder?: (orders: TReorderInput) => Promise<number>;
  extraInvalidateKeys?: readonly (readonly string[])[];
  customCreateMutate?: (input: TCreateInput) => Promise<TEntity>;
  customUpdateMutate?: (input: TUpdateInput) => Promise<TEntity>;
  onCreateSuccess?: (
    data: TEntity,
    queryClient: ReturnType<typeof useQueryClient>,
    queryKey: readonly string[],
  ) => void;
  onUpdateSuccess?: (
    data: TEntity,
    queryClient: ReturnType<typeof useQueryClient>,
    queryKey: readonly string[],
  ) => void;
}

export function createEntityHooks<
  TEntity extends { id: string; sort_order?: number },
  TCreateInput,
  TUpdateInput extends { id: string },
  TReorderInput = { id: string; sort_order: number }[],
>(
  config: EntityHookConfig<TEntity, TCreateInput, TUpdateInput, TReorderInput>,
) {
  // copy the existing implementation body from src/hooks/createEntityHooks.ts
  // without changing behavior in this task
}
```

- [ ] **Step 4: Turn `src/hooks/createEntityHooks.ts` into a compatibility re-export**

```ts
export type { EntityHookConfig } from "@/domain/shared/entityQueries";
export { createEntityHooks } from "@/domain/shared/entityQueries";
```

- [ ] **Step 5: Run focused verification**

Run: `npm run test -- src/domain/shared/__tests__/entityQueries.test.ts`
Expected: PASS.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/shared/entityQueries.ts src/domain/shared/__tests__/entityQueries.test.ts src/hooks/createEntityHooks.ts
git commit -m "refactor(domain): move generic entity query factory into shared domain"
```

---

### Task 3: Migrate todos to domain-owned types, queries, and service orchestration

**Files:**

- Create: `src/domain/todo/todoTypes.ts`
- Create: `src/domain/todo/todoQueries.ts`
- Modify: `src/domain/todo/todoService.ts`
- Modify: `src/hooks/useTodos.ts`
- Modify: `src/app/views/TodosView.tsx`
- Test: `src/domain/todo/__tests__/todoQueries.test.ts`
- Test: `src/domain/todo/__tests__/todoService.test.ts`

- [ ] **Step 1: Write the failing todo query and service tests**

```ts
import { describe, expect, it } from "vitest";

import { todoKeys } from "@/domain/todo/todoQueries";
import { todoDomainService } from "@/domain/todo/todoService";

describe("todoKeys", () => {
  it("creates stable todo query keys", () => {
    expect(todoKeys.todos).toEqual(["todos"]);
    expect(todoKeys.todo("abc")).toEqual(["todos", "abc"]);
  });
});

describe("todoDomainService", () => {
  it("builds reorder payloads from ordered todos", () => {
    const payload = todoDomainService.toReorderInput([
      { id: "a", sort_order: 3 },
      { id: "b", sort_order: 8 },
    ]);

    expect(payload).toEqual([
      { id: "a", sort_order: 0 },
      { id: "b", sort_order: 1 },
    ]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- src/domain/todo/__tests__/todoQueries.test.ts src/domain/todo/__tests__/todoService.test.ts`
Expected: FAIL because `todoQueries.ts` does not exist and `toReorderInput` is missing.

- [ ] **Step 3: Create `src/domain/todo/todoTypes.ts` and move duplicated input types there**

```ts
import type { Priority, Recurrence } from "@/lib/types";

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
  status?: "pending" | "in-progress" | "done";
  priority?: Priority;
  recurrence?: Recurrence;
}
```

- [ ] **Step 4: Create `src/domain/todo/todoQueries.ts` and move hook ownership there**

```ts
import {
  getTodo,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "@/lib/api";
import { reorderTodos } from "@/lib/api/reorder";
import type { Todo } from "@/lib/types";

import { createEntityHooks } from "@/domain/shared/entityQueries";
import type { CreateTodoInput, UpdateTodoInput } from "./todoTypes";

const {
  queryKeys,
  useGetAll: useTodos,
  useGetOne: useTodo,
  useCreate: useCreateTodo,
  useUpdate: useUpdateTodo,
  useDelete: useDeleteTodo,
  useReorder: useReorderTodos,
} = createEntityHooks<Todo, CreateTodoInput, UpdateTodoInput>({
  entityName: "todos",
  apiGetAll: getTodos,
  apiGetOne: getTodo,
  apiCreate: createTodo,
  apiUpdate: updateTodo,
  apiDelete: deleteTodo,
  apiReorder: reorderTodos,
});

export const todoKeys = {
  todos: queryKeys.all,
  todo: queryKeys.one,
};

export {
  useTodos,
  useTodo,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
};
```

- [ ] **Step 5: Extend `src/domain/todo/todoService.ts` with orchestration helpers used by views and hooks**

```ts
export const todoDomainService = {
  // keep existing helpers
  filterByPriority(todos: Todo[], priority: string): Todo[] {
    return todos.filter((t) => t.priority === priority);
  },

  toReorderInput(
    todos: Array<Pick<Todo, "id">>,
  ): Array<{ id: string; sort_order: number }> {
    return todos.map((todo, index) => ({
      id: todo.id,
      sort_order: index,
    }));
  },
};
```

- [ ] **Step 6: Convert `src/hooks/useTodos.ts` into a compatibility shim and move `TodosView` imports to the domain module**

```ts
// src/hooks/useTodos.ts
export type { CreateTodoInput, UpdateTodoInput } from "@/domain/todo/todoTypes";
export {
  todoKeys,
  useTodos,
  useTodo,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
} from "@/domain/todo/todoQueries";
```

```tsx
// src/app/views/TodosView.tsx
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
} from "@/domain/todo/todoQueries";
```

- [ ] **Step 7: Run focused verification**

Run: `npm run test -- src/domain/todo/__tests__/todoQueries.test.ts src/domain/todo/__tests__/todoService.test.ts`
Expected: PASS.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/domain/todo/todoTypes.ts src/domain/todo/todoQueries.ts src/domain/todo/todoService.ts src/domain/todo/__tests__/todoQueries.test.ts src/domain/todo/__tests__/todoService.test.ts src/hooks/useTodos.ts src/app/views/TodosView.tsx
git commit -m "refactor(todo): move todo hooks and input types into domain layer"
```

---

### Task 4: Migrate plans and targets to domain-owned types and queries

**Files:**

- Create: `src/domain/plan/planTypes.ts`
- Create: `src/domain/plan/planQueries.ts`
- Create: `src/domain/target/targetTypes.ts`
- Create: `src/domain/target/targetQueries.ts`
- Modify: `src/domain/plan/planService.ts`
- Modify: `src/domain/target/targetService.ts`
- Modify: `src/hooks/usePlans.ts`
- Modify: `src/hooks/useTargets.ts`
- Test: `src/domain/plan/__tests__/planQueries.test.ts`
- Test: `src/domain/target/__tests__/targetQueries.test.ts`

- [ ] **Step 1: Write the failing plan/target query tests**

```ts
import { describe, expect, it } from "vitest";

import { planKeys } from "@/domain/plan/planQueries";
import { targetKeys } from "@/domain/target/targetQueries";

describe("planKeys", () => {
  it("includes tag and task subqueries", () => {
    expect(planKeys.planTags("p1")).toEqual(["plans", "p1", "tags"]);
    expect(planKeys.planTasks("p1")).toEqual(["plans", "p1", "tasks"]);
  });
});

describe("targetKeys", () => {
  it("includes tag and step subqueries", () => {
    expect(targetKeys.targetTags("t1")).toEqual(["targets", "t1", "tags"]);
    expect(targetKeys.targetSteps("t1")).toEqual(["targets", "t1", "steps"]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- src/domain/plan/__tests__/planQueries.test.ts src/domain/target/__tests__/targetQueries.test.ts`
Expected: FAIL because the query modules do not exist.

- [ ] **Step 3: Create `planTypes.ts` and `targetTypes.ts` from the duplicated hook-local input types**

```ts
// src/domain/plan/planTypes.ts
export type PlanStatus = "active" | "completed" | "archived";

export interface CreatePlanInput {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: PlanStatus;
  tagIds?: string[];
}

export interface UpdatePlanInput {
  id: string;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: PlanStatus;
  tagIds?: string[];
}
```

```ts
// src/domain/target/targetTypes.ts
export type TargetStatus = "active" | "completed" | "archived";

export interface CreateTargetInput {
  title: string;
  description?: string;
  due_date?: string;
  status?: TargetStatus;
  tagIds?: string[];
}

export interface UpdateTargetInput {
  id: string;
  title?: string;
  description?: string;
  due_date?: string;
  status?: TargetStatus;
  tagIds?: string[];
}
```

- [ ] **Step 4: Create `planQueries.ts` and `targetQueries.ts` by copying the current hook bodies into domain ownership**

```ts
// src/domain/plan/planQueries.ts
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  getEntityTags,
  getPlan,
  getPlans,
  getTasksByPlan,
  createPlan,
  updatePlan,
  deletePlan,
  setEntityTags,
} from "@/lib/api";
import { reorderPlans } from "@/lib/api/reorder";
import type { Plan, Tag, Task } from "@/lib/types";
import { createEntityHooks } from "@/domain/shared/entityQueries";
import type { CreatePlanInput, UpdatePlanInput } from "./planTypes";

export const planKeys = {
  plans: ["plans"] as const,
  plan: (id: string) => ["plans", id] as const,
  planTags: (planId: string) => ["plans", planId, "tags"] as const,
  planTasks: (planId: string) => ["plans", planId, "tasks"] as const,
};

const {
  useGetAll: usePlans,
  useGetOne: usePlan,
  useCreate: useCreatePlanBase,
  useUpdate: useUpdatePlanBase,
  useDelete: useDeletePlan,
  useReorder: useReorderPlans,
} = createEntityHooks<Plan, CreatePlanInput, UpdatePlanInput>({
  entityName: "plans",
  apiGetAll: getPlans,
  apiGetOne: getPlan,
  apiCreate: async (data) => {
    const { tagIds, ...planData } = data;
    const plan = await createPlan(planData);
    if (tagIds && tagIds.length > 0) {
      await setEntityTags("plan", plan.id, tagIds);
    }
    return plan;
  },
  apiUpdate: updatePlan,
  apiDelete: deletePlan,
  apiReorder: reorderPlans,
  customUpdateMutate: async ({ id, tagIds, ...data }) => {
    const plan = await updatePlan(id, data);
    if (tagIds !== undefined) {
      await setEntityTags("plan", id, tagIds);
    }
    return plan;
  },
  onUpdateSuccess: (data, queryClient) => {
    queryClient.setQueryData<Plan[]>(planKeys.plans, (old) => {
      if (!old) return old;
      return old.map((plan) => (plan.id === data.id ? data : plan));
    });
    queryClient.invalidateQueries({ queryKey: planKeys.planTags(data.id) });
  },
});

export function usePlanTags(
  planId: string,
  options?: Omit<UseQueryOptions<Tag[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Tag[], Error>({
    queryKey: planKeys.planTags(planId),
    queryFn: () => getEntityTags("plan", planId),
    enabled: !!planId,
    ...options,
  });
}

export function usePlanTasks(
  planId: string,
  options?: Omit<UseQueryOptions<Task[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Task[], Error>({
    queryKey: planKeys.planTasks(planId),
    queryFn: () => getTasksByPlan(planId),
    enabled: !!planId,
    ...options,
  });
}

export const useCreatePlan = useCreatePlanBase;
export const useUpdatePlan = useUpdatePlanBase;
export { usePlans, usePlan, useDeletePlan, useReorderPlans };
```

```ts
// src/domain/target/targetQueries.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createStep,
  createTarget,
  deleteStep,
  deleteTarget,
  getEntityTags,
  getSteps,
  getTargets,
  setEntityTags,
  updateStep,
  updateTarget,
} from "@/lib/api";
import { reorderTargets } from "@/lib/api/reorder";
import type { Step, Tag, Target } from "@/lib/types";
import { createEntityHooks } from "@/domain/shared/entityQueries";
import type { CreateTargetInput, UpdateTargetInput } from "./targetTypes";

export const targetKeys = {
  targets: ["targets"] as const,
  target: (id: string) => ["targets", id] as const,
  targetTags: (targetId: string) => ["targets", targetId, "tags"] as const,
  targetSteps: (targetId: string) => ["targets", targetId, "steps"] as const,
};

const {
  useGetAll: useTargets,
  useGetOne: useTarget,
  useCreate: useCreateTargetBase,
  useUpdate: useUpdateTargetBase,
  useDelete: useDeleteTarget,
  useReorder: useReorderTargets,
} = createEntityHooks<Target, CreateTargetInput, UpdateTargetInput>({
  entityName: "targets",
  apiGetAll: getTargets,
  apiCreate: async (data) => {
    const { tagIds, ...targetData } = data;
    const target = await createTarget(targetData);
    if (tagIds && tagIds.length > 0) {
      await setEntityTags("target", target.id, tagIds);
    }
    return target;
  },
  apiUpdate: updateTarget,
  apiDelete: deleteTarget,
  apiReorder: reorderTargets,
  customUpdateMutate: async ({ id, tagIds, ...data }) => {
    const target = await updateTarget(id, data);
    if (tagIds !== undefined) {
      await setEntityTags("target", id, tagIds);
    }
    return target;
  },
  extraInvalidateKeys: [["targets", "steps"]],
});

export function useTargetTags(
  targetId: string,
  options?: Omit<UseQueryOptions<Tag[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Tag[], Error>({
    queryKey: targetKeys.targetTags(targetId),
    queryFn: () => getEntityTags("target", targetId),
    enabled: !!targetId,
    ...options,
  });
}

export function useTargetSteps(
  targetId: string,
  options?: Omit<UseQueryOptions<Step[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Step[], Error>({
    queryKey: targetKeys.targetSteps(targetId),
    queryFn: () => getSteps(targetId),
    enabled: !!targetId,
    ...options,
  });
}

export function useCreateStep(
  options?: Omit<
    UseMutationOptions<
      Step,
      Error,
      {
        target_id: string;
        title: string;
        weight: number;
        priority?: "P0" | "P1" | "P2" | "P3";
      }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<
    Step,
    Error,
    {
      target_id: string;
      title: string;
      weight: number;
      priority?: "P0" | "P1" | "P2" | "P3";
    }
  >({
    mutationFn: createStep,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: targetKeys.targetSteps(data.target_id),
      });
    },
    ...options,
  });
}

export function useUpdateStep(
  options?: Omit<
    UseMutationOptions<
      Step,
      Error,
      {
        id: string;
        title?: string;
        weight?: number;
        status?: "pending" | "completed";
        priority?: "P0" | "P1" | "P2" | "P3";
      }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<
    Step,
    Error,
    {
      id: string;
      title?: string;
      weight?: number;
      status?: "pending" | "completed";
      priority?: "P0" | "P1" | "P2" | "P3";
    }
  >({
    mutationFn: async ({ id, ...data }) => {
      const result = await updateStep(id, data);
      queryClient.invalidateQueries({ queryKey: ["targets", "steps"] });
      return result;
    },
    ...options,
  });
}

export function useDeleteStep(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteStep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["targets", "steps"] });
    },
    ...options,
  });
}

export { useTargets, useTarget, useDeleteTarget, useReorderTargets };
export const useCreateTarget = useCreateTargetBase;
export const useUpdateTarget = useUpdateTargetBase;
```

- [ ] **Step 5: Add domain helpers that replace inline reorder and progress logic**

```ts
// src/domain/plan/planService.ts
export const planDomainService = {
  calculateProgress(steps: Step[]): PlanProgress {
    if (!steps || steps.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = steps.filter((s) => s.status === "completed").length;
    const total = steps.length;

    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  },
};
```

```ts
// src/domain/target/targetService.ts
export const targetDomainService = {
  calculateProgress(target: Target): TargetProgress {
    const progress = Math.min(target.progress ?? 0, 100);

    return {
      id: target.id,
      progress: Math.round(progress),
      isCompleted: target.status === "completed" || progress >= 100,
    };
  },
};
```

- [ ] **Step 6: Convert `src/hooks/usePlans.ts` and `src/hooks/useTargets.ts` into compatibility re-exports**

```ts
// src/hooks/usePlans.ts
export type {
  CreatePlanInput,
  UpdatePlanInput,
  PlanStatus,
} from "@/domain/plan/planTypes";
export {
  planKeys,
  usePlans,
  usePlan,
  usePlanTags,
  usePlanTasks,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useReorderPlans,
} from "@/domain/plan/planQueries";
```

```ts
// src/hooks/useTargets.ts
export type {
  CreateTargetInput,
  UpdateTargetInput,
  TargetStatus,
} from "@/domain/target/targetTypes";
export {
  targetKeys,
  useTargets,
  useTarget,
  useTargetTags,
  useTargetSteps,
  useCreateTarget,
  useUpdateTarget,
  useDeleteTarget,
  useReorderTargets,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
} from "@/domain/target/targetQueries";
```

- [ ] **Step 7: Run focused verification**

Run: `npm run test -- src/domain/plan/__tests__/planQueries.test.ts src/domain/target/__tests__/targetQueries.test.ts`
Expected: PASS.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/domain/plan/planTypes.ts src/domain/plan/planQueries.ts src/domain/plan/planService.ts src/domain/plan/__tests__/planQueries.test.ts src/domain/target/targetTypes.ts src/domain/target/targetQueries.ts src/domain/target/targetService.ts src/domain/target/__tests__/targetQueries.test.ts src/hooks/usePlans.ts src/hooks/useTargets.ts
git commit -m "refactor(domain): move plan and target hooks into entity modules"
```

---

### Task 5: Migrate milestones, circulations, and tags; remove the last direct CRUD hook islands

**Files:**

- Create: `src/domain/milestone/milestoneTypes.ts`
- Create: `src/domain/milestone/milestoneQueries.ts`
- Create: `src/domain/circulation/circulationTypes.ts`
- Create: `src/domain/circulation/circulationQueries.ts`
- Create: `src/domain/tag/tagTypes.ts`
- Create: `src/domain/tag/tagQueries.ts`
- Modify: `src/hooks/useMilestones.ts`
- Modify: `src/hooks/useCirculations.ts`
- Modify: `src/hooks/useTags.ts`
- Modify: `src/lib/api/reorder.ts`
- Test: `src/domain/milestone/__tests__/milestoneQueries.test.ts`
- Test: `src/domain/circulation/__tests__/circulationQueries.test.ts`
- Test: `src/domain/tag/__tests__/tagQueries.test.ts`

- [ ] **Step 1: Write the failing query-key tests**

```ts
import { describe, expect, it } from "vitest";

import { milestoneKeys } from "@/domain/milestone/milestoneQueries";
import { circulationKeys } from "@/domain/circulation/circulationQueries";
import { tagKeys } from "@/domain/tag/tagQueries";

describe("milestoneKeys", () => {
  it("uses milestone root keys", () => {
    expect(milestoneKeys.milestones).toEqual(["milestones"]);
  });
});

describe("circulationKeys", () => {
  it("includes circulation logs in subkeys", () => {
    expect(circulationKeys.circulationLogs("c1")).toEqual([
      "circulations",
      "c1",
      "logs",
    ]);
  });
});

describe("tagKeys", () => {
  it("uses tag root keys", () => {
    expect(tagKeys.tags).toEqual(["tags"]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- src/domain/milestone/__tests__/milestoneQueries.test.ts src/domain/circulation/__tests__/circulationQueries.test.ts src/domain/tag/__tests__/tagQueries.test.ts`
Expected: FAIL because the domain query modules do not exist.

- [ ] **Step 3: Create the three `*Types.ts` files from the existing hook-local types**

```ts
// src/domain/milestone/milestoneTypes.ts
export interface CreateMilestoneInput {
  title: string;
  target_date?: string;
  biz_type?: string;
  biz_id?: string;
}

export interface UpdateMilestoneInput {
  id: string;
  title?: string;
  target_date?: string;
  status?: "pending" | "completed";
}
```

```ts
// src/domain/circulation/circulationTypes.ts
import type { CirculationType, PeriodicFrequency } from "@/lib/types";

export interface CreateCirculationInput {
  title: string;
  circulation_type: CirculationType;
  frequency?: PeriodicFrequency;
  target_count?: number;
}

export interface UpdateCirculationInput {
  id: string;
  title?: string;
  circulation_type?: CirculationType;
  frequency?: PeriodicFrequency;
  target_count?: number;
}
```

```ts
// src/domain/tag/tagTypes.ts
export interface CreateTagInput {
  name: string;
  color: string;
  description?: string;
}

export interface UpdateTagInput {
  id: string;
  name?: string;
  color?: string;
  description?: string;
}
```

- [ ] **Step 4: Create `milestoneQueries.ts`, `circulationQueries.ts`, and `tagQueries.ts` by copying the current hook implementations into domain ownership**

```ts
// src/domain/tag/tagQueries.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { createTag, deleteTag, getTags, updateTag } from "@/lib/api";
import type { Tag } from "@/lib/types";
import type { CreateTagInput, UpdateTagInput } from "./tagTypes";

export const tagKeys = {
  tags: ["tags"] as const,
  tag: (id: string) => ["tags", id] as const,
};

export function useTags(
  options?: Omit<UseQueryOptions<Tag[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Tag[], Error>({
    queryKey: tagKeys.tags,
    queryFn: getTags,
    ...options,
  });
}

export function useTag(
  id: string,
  options?: Omit<UseQueryOptions<Tag, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Tag, Error>({
    queryKey: tagKeys.tag(id),
    queryFn: () =>
      getTags().then((tags) => {
        const tag = tags.find((candidate) => candidate.id === id);
        if (!tag) {
          throw new Error(`Tag with id "${id}" not found`);
        }
        return tag;
      }),
    enabled: !!id,
    ...options,
  });
}

export function useCreateTag(
  options?: Omit<UseMutationOptions<Tag, Error, CreateTagInput>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<Tag, Error, CreateTagInput>({
    mutationFn: ({ name, color, description }) =>
      createTag(name, color, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.tags });
    },
    ...options,
  });
}

export function useUpdateTag(
  options?: Omit<UseMutationOptions<Tag, Error, UpdateTagInput>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<Tag, Error, UpdateTagInput>({
    mutationFn: ({ id, ...data }) => updateTag(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData<Tag[]>(tagKeys.tags, (old) => {
        if (!old) return old;
        return old.map((tag) => (tag.id === data.id ? data : tag));
      });
    },
    ...options,
  });
}

export function useDeleteTag(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.tags });
    },
    ...options,
  });
}
```

Copy the entire current `useMilestones.ts` body into `src/domain/milestone/milestoneQueries.ts` and the entire current `useCirculations.ts` body into `src/domain/circulation/circulationQueries.ts`. Preserve the exported names and query keys exactly so downstream files can switch imports without changing call sites.

- [ ] **Step 5: Convert the old hook files into compatibility re-exports and clean up reorder client naming**

```ts
// src/hooks/useTags.ts
export type { CreateTagInput, UpdateTagInput } from "@/domain/tag/tagTypes";
export {
  tagKeys,
  useTags,
  useTag,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@/domain/tag/tagQueries";
```

```ts
// src/lib/api/reorder.ts
import { apiClient } from "./client";

export async function reorderTodos(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map(
    (o) => [o.id, o.sort_order] as [string, number],
  );
  return apiClient.invoke<number>("reorder_todos", { orders: ordersTuple });
}
```

Replace `apiInvoke<number>(...)` with `apiClient.invoke<number>(...)` in `reorderTodos`, `reorderPlans`, and `reorderTargets`.

- [ ] **Step 6: Run focused verification**

Run: `npm run test -- src/domain/milestone/__tests__/milestoneQueries.test.ts src/domain/circulation/__tests__/circulationQueries.test.ts src/domain/tag/__tests__/tagQueries.test.ts`
Expected: PASS.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/domain/milestone/milestoneTypes.ts src/domain/milestone/milestoneQueries.ts src/domain/milestone/__tests__/milestoneQueries.test.ts src/domain/circulation/circulationTypes.ts src/domain/circulation/circulationQueries.ts src/domain/circulation/__tests__/circulationQueries.test.ts src/domain/tag/tagTypes.ts src/domain/tag/tagQueries.ts src/domain/tag/__tests__/tagQueries.test.ts src/hooks/useMilestones.ts src/hooks/useCirculations.ts src/hooks/useTags.ts src/lib/api/reorder.ts
git commit -m "refactor(domain): migrate remaining entity hooks and align reorder api client"
```

---

### Task 6: Move cross-layer side effects out of `useEntityOperations`

**Files:**

- Create: `src/domain/shared/entityOperations.ts`
- Modify: `src/hooks/useEntityOperations.ts`
- Modify: `src/domain/todo/todoService.ts`
- Modify: `src/domain/plan/planService.ts`
- Modify: `src/domain/target/targetService.ts`
- Test: `src/domain/shared/__tests__/entityOperations.test.ts`

- [ ] **Step 1: Write the failing entity operations helper test**

```ts
import { describe, expect, it, vi } from "vitest";

import { createEntitySideEffects } from "@/domain/shared/entityOperations";

describe("createEntitySideEffects", () => {
  it("writes entity tags through the provided adapter", async () => {
    const setEntityTags = vi.fn(async () => undefined);
    const sideEffects = createEntitySideEffects({
      setEntityTags,
      setNotificationSettings: vi.fn(async () => undefined),
      getNotificationSettings: vi.fn(async () => null),
    });

    await sideEffects.saveTags("todo", "todo-1", ["tag-1"]);

    expect(setEntityTags).toHaveBeenCalledWith("todo", "todo-1", ["tag-1"]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- src/domain/shared/__tests__/entityOperations.test.ts`
Expected: FAIL because `entityOperations.ts` does not exist.

- [ ] **Step 3: Create the side-effect helper with explicit adapters**

```ts
import type { EntityType } from "@/lib/types";

interface EntitySideEffectAdapters {
  setEntityTags: (
    entityType: EntityType,
    entityId: string,
    tags: string[],
  ) => Promise<void>;
  setNotificationSettings: (
    entityType: EntityType,
    entityId: string,
    times: number[],
  ) => Promise<void>;
  getNotificationSettings: (
    entityType: EntityType,
    entityId: string,
  ) => Promise<unknown>;
}

export function createEntitySideEffects(adapters: EntitySideEffectAdapters) {
  return {
    saveTags(entityType: EntityType, entityId: string, tags: string[]) {
      return adapters.setEntityTags(entityType, entityId, tags);
    },
    updateReminder(entityType: EntityType, entityId: string, times: number[]) {
      return adapters.setNotificationSettings(entityType, entityId, times);
    },
    fetchReminder(entityType: EntityType, entityId: string) {
      return adapters.getNotificationSettings(entityType, entityId);
    },
  };
}
```

- [ ] **Step 4: Refactor `useEntityOperations.ts` to consume the helper instead of calling `@/lib/api` directly in the core logic**

```ts
import { useToast } from "@/components/ui/Toast";
import {
  getNotificationSettings,
  setEntityTags,
  setNotificationSettings,
} from "@/lib/api";
import { createEntitySideEffects } from "@/domain/shared/entityOperations";

const sideEffects = createEntitySideEffects({
  setEntityTags,
  setNotificationSettings,
  getNotificationSettings,
});

if (tags && entity.id && config.entityType) {
  await sideEffects.saveTags(config.entityType, entity.id, tags);
}

await sideEffects.updateReminder(config.entityType, entityId, times);
return sideEffects.fetchReminder(config.entityType, entityId);
```

Do not change the hook API in this task; only move the side-effect responsibility behind the domain helper.

- [ ] **Step 5: Run focused verification**

Run: `npm run test -- src/domain/shared/__tests__/entityOperations.test.ts`
Expected: PASS.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/shared/entityOperations.ts src/domain/shared/__tests__/entityOperations.test.ts src/hooks/useEntityOperations.ts src/domain/todo/todoService.ts src/domain/plan/planService.ts src/domain/target/targetService.ts
git commit -m "refactor(domain): isolate entity side effects behind shared service helpers"
```

---

### Task 7: Extract Todos view state and todo-specific selectors from `TodosView`

**Files:**

- Create: `src/domain/todo/todoViewState.ts`
- Create: `src/domain/todo/todoFilters.ts`
- Modify: `src/hooks/useEntityFilter.ts`
- Modify: `src/app/views/TodosView.tsx`
- Test: `src/domain/todo/__tests__/todoViewState.test.ts`
- Test: `src/domain/todo/__tests__/todoFilters.test.ts`

- [ ] **Step 1: Write the failing todo state and filter tests**

```ts
import { describe, expect, it } from "vitest";

import { filterTodos, toCalendarEvents } from "@/domain/todo/todoFilters";

describe("filterTodos", () => {
  it("filters by completed status and search query", () => {
    const result = filterTodos({
      todos: [
        {
          id: "1",
          title: "Ship feature",
          content: "",
          status: "done",
          priority: "P1",
        },
        {
          id: "2",
          title: "Draft plan",
          content: "",
          status: "pending",
          priority: "P2",
        },
      ],
      filter: "completed",
      priorityFilter: "all",
      tagFilters: [],
      searchQuery: "ship",
    });

    expect(result.map((todo) => todo.id)).toEqual(["1"]);
  });
});

describe("toCalendarEvents", () => {
  it("maps todos with due dates into calendar events", () => {
    const result = toCalendarEvents([
      {
        id: "1",
        title: "Ship feature",
        due_date: "2026-04-27",
        status: "pending",
        priority: "P1",
      },
    ]);

    expect(result).toEqual([
      { id: "1", title: "Ship feature", date: "2026-04-27", type: "todo" },
    ]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- src/domain/todo/__tests__/todoFilters.test.ts src/domain/todo/__tests__/todoViewState.test.ts`
Expected: FAIL because the files do not exist.

- [ ] **Step 3: Create `src/domain/todo/todoFilters.ts` and move the todo-only logic out of `useEntityFilter.ts`**

```ts
import type { Priority, Todo } from "@/lib/types";

export type TodoFilterMode = "all" | "today" | "upcoming" | "completed";

export interface TodoFilterCriteria {
  todos: Todo[];
  filter: TodoFilterMode;
  priorityFilter: Priority | "all";
  tagFilters: string[];
  searchQuery: string;
}

export function filterTodos({
  todos,
  filter,
  priorityFilter,
  tagFilters,
  searchQuery,
}: TodoFilterCriteria) {
  const today = new Date().toISOString().split("T")[0];

  return todos.filter((todo) => {
    if (searchQuery) {
      const normalized = searchQuery.toLowerCase();
      if (
        !todo.title.toLowerCase().includes(normalized) &&
        !todo.content?.toLowerCase().includes(normalized)
      ) {
        return false;
      }
    }

    if (priorityFilter !== "all" && todo.priority !== priorityFilter) {
      return false;
    }

    if (tagFilters.length > 0) {
      const hasTag = tagFilters.some((tagId) =>
        todo.tags?.some((tag) => tag.id === tagId),
      );
      if (!hasTag) return false;
    }

    if (filter === "today") return todo.due_date?.startsWith(today);
    if (filter === "upcoming") return !!todo.due_date && todo.due_date > today;
    if (filter === "completed") return todo.status === "done";

    return true;
  });
}

export function toCalendarEvents(todos: Todo[]) {
  return todos
    .filter((todo) => todo.due_date)
    .map((todo) => ({
      id: todo.id,
      title: todo.title,
      date: todo.due_date!,
      type: "todo" as const,
    }));
}
```

- [ ] **Step 4: Create `src/domain/todo/todoViewState.ts` to consolidate the view’s 9 local state variables**

```ts
import { useState } from "react";
import type { Priority, Todo } from "@/lib/types";

export function useTodoViewState() {
  const [filter, setFilter] = useState<
    "all" | "today" | "upcoming" | "completed"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  return {
    filter,
    priorityFilter,
    tagFilters,
    showPriorityDropdown,
    showTagDropdown,
    searchQuery,
    viewMode,
    showForm,
    editingTodo,
    setFilter,
    setPriorityFilter,
    setTagFilters,
    setSearchQuery,
    setViewMode,
    openCreateForm: () => {
      setEditingTodo(null);
      setShowForm(true);
    },
    openEditForm: (todo: Todo) => {
      setEditingTodo(todo);
      setShowForm(true);
    },
    closeForm: () => {
      setEditingTodo(null);
      setShowForm(false);
    },
    togglePriorityDropdown: () => {
      setShowPriorityDropdown((open) => !open);
      setShowTagDropdown(false);
    },
    toggleTagDropdown: () => {
      setShowTagDropdown((open) => !open);
      setShowPriorityDropdown(false);
    },
    closeDropdowns: () => {
      setShowPriorityDropdown(false);
      setShowTagDropdown(false);
    },
  };
}
```

- [ ] **Step 5: Update `src/app/views/TodosView.tsx` to consume the new domain hook and selectors**

```tsx
import { useTodoViewState } from "@/domain/todo/todoViewState";
import { filterTodos, toCalendarEvents } from "@/domain/todo/todoFilters";

export function TodosView() {
  const view = useTodoViewState();
  const batchMode = useBatchSelect((s) => s.mode);
  const toggleBatchMode = useBatchSelect((s) => s.toggleMode);

  const { data: todosData, isLoading, error } = useTodos();
  const { data: allTags = [] } = useTags();

  const todos = todosData || [];
  const calendarEvents = toCalendarEvents(todos);
  const filteredTodos = filterTodos({
    todos,
    filter: view.filter,
    priorityFilter: view.priorityFilter,
    tagFilters: view.tagFilters,
    searchQuery: view.searchQuery,
  });

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            variant={batchMode ? "primary" : "secondary"}
            size="sm"
            onClick={toggleBatchMode}
          >
            {batchMode ? "退出多选" : "多选"}
          </Button>
          <Button onClick={view.openCreateForm}>+ 新建</Button>
        </div>
      </div>

      <TodoFilters
        filter={view.filter}
        priorityFilter={view.priorityFilter}
        tagFilters={view.tagFilters}
        searchQuery={view.searchQuery}
        viewMode={view.viewMode}
        allTags={allTags}
        showPriorityDropdown={view.showPriorityDropdown}
        showTagDropdown={view.showTagDropdown}
        onFilterChange={view.setFilter}
        onPriorityFilterChange={view.setPriorityFilter}
        onTagFilterChange={view.setTagFilters}
        onSearchChange={view.setSearchQuery}
        onViewModeChange={view.setViewMode}
        onPriorityDropdownToggle={view.togglePriorityDropdown}
        onTagDropdownToggle={view.toggleTagDropdown}
      />

      {(view.showPriorityDropdown || view.showTagDropdown) && (
        <div className="fixed inset-0 z-0" onClick={view.closeDropdowns} />
      )}

      <TodoForm
        open={view.showForm}
        editingTodo={view.editingTodo}
        allTags={allTags}
        onClose={view.closeForm}
        onSave={handleSave}
      />
    </div>
  );
}
```

- [ ] **Step 6: Leave `src/hooks/useEntityFilter.ts` with only the generic plan/target helpers**

```ts
export { useFilteredPlans, useFilteredTargets };
```

Remove `useFilteredTodos` and `useCalendarEvents` from that file once `TodosView.tsx` no longer imports them.

- [ ] **Step 7: Run focused verification**

Run: `npm run test -- src/domain/todo/__tests__/todoFilters.test.ts src/domain/todo/__tests__/todoViewState.test.ts`
Expected: PASS.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/domain/todo/todoViewState.ts src/domain/todo/todoFilters.ts src/domain/todo/__tests__/todoViewState.test.ts src/domain/todo/__tests__/todoFilters.test.ts src/hooks/useEntityFilter.ts src/app/views/TodosView.tsx
git commit -m "refactor(todo): extract todo view state and selectors from todos view"
```

---

### Task 8: Unify Rust validation constants and add backend validation coverage

**Files:**

- Modify: `src-tauri/src/commands/validation.rs`
- Modify: `src-tauri/src/tests.rs`

- [ ] **Step 1: Write the failing Rust validation tests**

Add these tests to `src-tauri/src/tests.rs`:

```rust
    #[test]
    fn test_validate_priority_rejects_unknown_value() {
        let result = crate::commands::validation::validate_priority("PX");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid priority"));
    }

    #[test]
    fn test_validate_target_status_accepts_archived() {
        let result = crate::commands::validation::validate_target_status("archived");
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_milestone_status_rejects_cancelled() {
        let result = crate::commands::validation::validate_milestone_status("cancelled");
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_circulation_status_rejects_paused() {
        let result = crate::commands::validation::validate_circulation_status("paused");
        assert!(result.is_err());
    }
```

- [ ] **Step 2: Run the Rust tests to verify they fail**

Run: `cargo test test_validate_target_status_accepts_archived test_validate_milestone_status_rejects_cancelled test_validate_circulation_status_rejects_paused`
Expected: FAIL because the current status arrays still allow incorrect values and reject the DDD-aligned values.

- [ ] **Step 3: Replace duplicated inline arrays in `validation.rs` with named constants aligned to the frontend domain types**

```rust
pub const VALID_PRIORITIES: [&str; 4] = ["P0", "P1", "P2", "P3"];
pub const VALID_TODO_STATUSES: [&str; 4] = ["pending", "in-progress", "completed", "cancelled"];
pub const VALID_PLAN_STATUSES: [&str; 3] = ["active", "completed", "archived"];
pub const VALID_TARGET_STATUSES: [&str; 3] = ["active", "completed", "archived"];
pub const VALID_MILESTONE_STATUSES: [&str; 2] = ["pending", "completed"];
pub const VALID_CIRCULATION_STATUSES: [&str; 2] = ["active", "archived"];
pub const VALID_CIRCULATION_TYPES: [&str; 2] = ["periodic", "count"];
pub const VALID_FREQUENCIES: [&str; 3] = ["daily", "weekly", "monthly"];

pub fn validate_target_status(status: &str) -> Result<(), String> {
    if !VALID_TARGET_STATUSES.contains(&status) {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            VALID_TARGET_STATUSES.join(", ")
        ));
    }
    Ok(())
}
```

Use the same constant-based pattern for `validate_priority`, `validate_status`, `validate_plan_status`, `validate_milestone_status`, `validate_circulation_status`, `validate_circulation_type`, and `validate_frequency`, with each function reading from a matching `VALID_*` constant instead of building a local array.

- [ ] **Step 4: Run the focused Rust tests again**

Run: `cargo test test_validate_priority_rejects_unknown_value test_validate_target_status_accepts_archived test_validate_milestone_status_rejects_cancelled test_validate_circulation_status_rejects_paused`
Expected: PASS.

- [ ] **Step 5: Run the full Rust test suite**

Run: `cargo test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/commands/validation.rs src-tauri/src/tests.rs
git commit -m "test(validation): unify backend status constants and add coverage"
```

---

### Task 9: Remove stale `lib/services` usage and finish import cleanup

**Files:**

- Modify: `src/lib/services/todoService.ts`
- Modify: `src/lib/services/planService.ts`
- Modify: `src/lib/services/targetService.ts`
- Modify: `src/app/views/TodosView.tsx`
- Modify: `src/app/views/PlansView.tsx`
- Modify: `src/app/views/TargetsView.tsx`
- Modify: any files still importing `@/hooks/useTodos`, `@/hooks/usePlans`, `@/hooks/useTargets`, `@/hooks/useMilestones`, `@/hooks/useCirculations`, or `@/hooks/useTags`

- [ ] **Step 1: Search for stale imports before editing**

Run: `rg '@/hooks/use(Todos|Plans|Targets|Milestones|Circulations|Tags)|@/lib/services/' src`
Expected: a concrete list of remaining compatibility imports.

- [ ] **Step 2: Replace view-level imports with direct domain imports**

```tsx
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
} from "@/domain/todo/todoQueries";
import { useTags } from "@/domain/tag/tagQueries";
```

Apply the same direct-domain import pattern to every view or feature component still importing entity hooks from `@/hooks/*`. The intended end state is:

- todo UI imports from `@/domain/todo/todoQueries`
- plan UI imports from `@/domain/plan/planQueries`
- target UI imports from `@/domain/target/targetQueries`
- milestone UI imports from `@/domain/milestone/milestoneQueries`
- circulation UI imports from `@/domain/circulation/circulationQueries`
- tag UI imports from `@/domain/tag/tagQueries`

- [ ] **Step 3: Reduce `src/lib/services/*` files to explicit compatibility wrappers only**

```ts
/**
 * Backward-compatible re-exports from domain layer.
 * New code should import from @/domain/todo/todoService directly.
 */
export { todoDomainService } from "@/domain/todo/todoService";
```

If `rg '@/lib/services/' src` shows no remaining consumers for the old named aliases, remove those aliases and keep only the direct domain re-export. If consumers still exist, keep the aliases in this task and remove them in a later cleanup commit after the imports are migrated.

- [ ] **Step 4: Run targeted verification**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run lint`
Expected: PASS or no new lint errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/todoService.ts src/lib/services/planService.ts src/lib/services/targetService.ts src/app/views/TodosView.tsx src/app/views/PlansView.tsx src/app/views/TargetsView.tsx src/hooks/useTodos.ts src/hooks/usePlans.ts src/hooks/useTargets.ts src/hooks/useMilestones.ts src/hooks/useCirculations.ts src/hooks/useTags.ts
git commit -m "refactor(imports): switch feature views to domain-owned hooks and services"
```

---

### Task 10: Run full verification and capture the final architecture check

**Files:**

- Modify: `docs/specs/architecture-upgrade-design.md`
- Modify: `docs/specs/ddd-frontend-upgrade.md`

- [ ] **Step 1: Run all frontend tests**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 2: Run frontend coverage**

Run: `npm run test:coverage`
Expected: PASS and coverage report generated.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Run the Rust suite one more time from the Tauri crate root**

Run: `cargo test`
Expected: PASS.

- [ ] **Step 7: Update spec status checklists if implementation status changed during execution**

```md
- [x] 创建 unified Service 接口模式
- [x] 更新 Hooks 使用 Service
- [x] 创建 src/stores/navigation.ts
- [x] TodosView 业务逻辑抽离
```

Check only the items that were actually completed during execution. Leave every unfinished spec checkbox untouched.

- [ ] **Step 8: Commit**

```bash
git add docs/specs/architecture-upgrade-design.md docs/specs/ddd-frontend-upgrade.md
git commit -m "docs(architecture): update upgrade progress after ddd migration verification"
```

If neither spec file changes after the status review, do not create a docs-only commit in this task. Instead, record in the task notes that verification passed and that both spec files already matched the implementation status.

---

## Dependency summary for subagents

- Task 1 should land before any work that assumes navigation state is shared.
- Task 2 should land before any entity query migration, because later tasks import `@/domain/shared/entityQueries`.
- Task 3 should land before Task 7, because `TodosView` will import from `@/domain/todo/todoQueries` and use helpers added to `todoService.ts`.
- Task 4 should land before Task 9, because import cleanup should target the final domain module paths.
- Task 5 should land before Task 9 for the same reason.
- Task 6 can land after Tasks 3-5, when the domain query modules already exist.
- Task 8 can run independently from the frontend migration, but must finish before Task 10.
- Task 10 must be last.

## Execution guidance

- Keep the compatibility shims in `src/hooks/*.ts` until all imports are migrated and verification passes.
- Do not mix multiple entity migrations into one commit unless the task explicitly says so.
- Prefer moving existing code with minimal semantic change first; then simplify once tests are green.
- For each task, run only the narrowest test first, then typecheck, then move on.
- If a task exposes a status mismatch between frontend and backend (`done` vs `completed`, `archived` vs `cancelled`), fix the mismatch in the task that owns the type definition and update its tests immediately.
