# Hotkey System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement application-wide keyboard shortcuts with customizable key mappings and conflict detection.

**Architecture:** Global HotkeyProvider wraps app, Zustand store manages hotkey bindings, useHotkey hook for component registration.

**Tech Stack:** React, Zustand, TypeScript

---

## Files to Create/Modify

| File                                    | Action | Description              |
| --------------------------------------- | ------ | ------------------------ |
| `src/lib/HotkeyProvider.tsx`            | Create | Global hotkey provider   |
| `src/lib/useHotkeyStore.ts`             | Create | Hotkey state store       |
| `src/hooks/useHotkey.ts`                | Create | Hotkey registration hook |
| `src/app/layout.tsx`                    | Modify | Wrap with HotkeyProvider |
| `src/app/views/SettingsGeneralView.tsx` | Modify | Add hotkey settings UI   |

---

## Task 1: Hotkey State Store

**Files:**

- Create: `src/lib/useHotkeyStore.ts`

- [ ] **Step 1: Create hotkey store**

```typescript
// src/lib/useHotkeyStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HotkeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

interface HotkeyStore {
  // Registered hotkeys (action -> binding)
  hotkeys: Record<string, HotkeyBinding>;

  // User customization (action -> config)
  customConfigs: Record<string, HotkeyConfig>;

  // Actions
  register: (
    action: string,
    binding: Omit<HotkeyBinding, "action">,
    callback: () => void,
  ) => void;
  unregister: (action: string) => void;
  updateConfig: (action: string, config: HotkeyConfig) => void;
  resetConfig: (action: string) => void;
  resetAll: () => void;

  // Helpers
  getConfig: (action: string) => HotkeyConfig;
  getAllConfigs: () => Record<string, HotkeyConfig>;
  detectConflict: (
    config: HotkeyConfig,
    excludeAction?: string,
  ) => string | null;
}

// Default hotkey configurations
export const DEFAULT_HOTKEYS: Record<
  string,
  Omit<HotkeyConfig, "key"> & { key: string; description: string }
> = {
  "new-todo": { key: "n", ctrl: true, description: "新建 Todo" },
  search: { key: "k", ctrl: true, description: "打开搜索" },
  "view-dashboard": { key: "1", ctrl: true, description: "切换到概览" },
  "view-todos": { key: "2", ctrl: true, description: "切换到待办" },
  "view-plans": { key: "3", ctrl: true, description: "切换到计划" },
  "view-targets": { key: "4", ctrl: true, description: "切换到目标" },
  "view-circulations": { key: "5", ctrl: true, description: "切换到打卡" },
  "view-statistics": { key: "6", ctrl: true, description: "切换到统计" },
  settings: { key: ",", ctrl: true, description: "打开设置" },
  escape: { key: "Escape", description: "关闭弹窗/取消选择" },
  confirm: { key: "Enter", description: "确认/提交" },
  delete: { key: "Delete", description: "删除选中项" },
  "select-all": { key: "a", ctrl: true, description: "全选" },
};

function configToString(config: HotkeyConfig): string {
  const parts: string[] = [];
  if (config.ctrl) parts.push("Ctrl");
  if (config.shift) parts.push("Shift");
  if (config.alt) parts.push("Alt");
  parts.push(config.key.toUpperCase());
  return parts.join(" + ");
}

export const useHotkeyStore = create<HotkeyStore>()(
  persist(
    (set, get) => ({
      hotkeys: {},
      customConfigs: {},

      register: (action, binding, callback) => {
        const config = get().customConfigs[action] || {
          key: binding.key,
          ctrl: binding.ctrl,
          shift: binding.shift,
          alt: binding.alt,
        };

        set((state) => ({
          hotkeys: {
            ...state.hotkeys,
            [action]: {
              ...binding,
              key: config.key,
              ctrl: config.ctrl,
              shift: config.shift,
              alt: config.alt,
              action: callback,
            },
          },
        }));
      },

      unregister: (action) => {
        set((state) => {
          const { [action]: _, ...rest } = state.hotkeys;
          return { hotkeys: rest };
        });
      },

      updateConfig: (action, config) => {
        // Check for conflicts
        const conflict = get().detectConflict(config, action);
        if (conflict) {
          console.warn(
            `Hotkey conflict: ${configToString(config)} is already used by "${conflict}"`,
          );
          return;
        }

        set((state) => ({
          customConfigs: {
            ...state.customConfigs,
            [action]: config,
          },
        }));
      },

      resetConfig: (action) => {
        set((state) => {
          const { [action]: _, ...rest } = state.customConfigs;
          return { customConfigs: rest };
        });
      },

      resetAll: () => {
        set({ customConfigs: {} });
      },

      getConfig: (action) => {
        const custom = get().customConfigs[action];
        if (custom) return custom;

        const def = DEFAULT_HOTKEYS[action];
        return {
          key: def.key,
          ctrl: def.ctrl,
          shift: def.shift,
          alt: def.alt,
        };
      },

      getAllConfigs: () => get().customConfigs,

      detectConflict: (config, excludeAction) => {
        const { hotkeys } = get();
        for (const [action, binding] of Object.entries(hotkeys)) {
          if (action === excludeAction) continue;

          if (
            binding.key.toLowerCase() === config.key.toLowerCase() &&
            !!binding.ctrl === !!config.ctrl &&
            !!binding.shift === !!config.shift &&
            !!binding.alt === !!config.alt
          ) {
            return action;
          }
        }
        return null;
      },
    }),
    {
      name: "plan-todos-hotkeys",
      partialize: (state) => ({ customConfigs: state.customConfigs }),
    },
  ),
);

// Export helper
export { configToString };
```

- [ ] **Step 2: Commit hotkey store**

```bash
git add src/lib/useHotkeyStore.ts
git commit -m "feat(hotkey): add hotkey state store"
```

---

## Task 2: Hotkey Provider

**Files:**

- Create: `src/lib/HotkeyProvider.tsx`

- [ ] **Step 1: Create HotkeyProvider**

```typescript
// src/lib/HotkeyProvider.tsx
import { useEffect, useCallback, useRef } from "react";
import { useHotkeyStore } from "./useHotkeyStore";

interface HotkeyProviderProps {
  children: React.ReactNode;
}

export function HotkeyProvider({ children }: HotkeyProviderProps) {
  const hotkeys = useHotkeyStore((s) => s.hotkeys);
  const hotkeysRef = useRef(hotkeys);

  // Keep ref updated
  useEffect(() => {
    hotkeysRef.current = hotkeys;
  }, [hotkeys]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in input/textarea
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      // Allow Escape even in inputs
      if (e.key !== "Escape") {
        return;
      }
    }

    const key = e.key;
    const ctrl = e.ctrlKey || e.metaKey; // Meta for Mac
    const shift = e.shiftKey;
    const alt = e.altKey;

    // Find matching hotkey
    for (const [actionName, binding] of Object.entries(hotkeysRef.current)) {
      if (
        binding.key.toLowerCase() === key.toLowerCase() &&
        !!binding.ctrl === ctrl &&
        !!binding.shift === shift &&
        !!binding.alt === alt
      ) {
        e.preventDefault();
        binding.action();
        return;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Commit HotkeyProvider**

```bash
git add src/lib/HotkeyProvider.tsx
git commit -m "feat(hotkey): add global HotkeyProvider"
```

---

## Task 3: useHotkey Hook

**Files:**

- Create: `src/hooks/useHotkey.ts`

- [ ] **Step 1: Create useHotkey hook**

```typescript
// src/hooks/useHotkey.ts
import { useEffect, useCallback } from "react";
import { useHotkeyStore, DEFAULT_HOTKEYS } from "@/lib/useHotkeyStore";

/**
 * Register a hotkey action
 * @param action The action name (must match DEFAULT_HOTKEYS key)
 * @param callback The callback to execute when hotkey is pressed
 * @param deps Dependencies array for callback
 */
export function useHotkey(
  action: keyof typeof DEFAULT_HOTKEYS,
  callback: () => void,
  deps: React.DependencyList = [],
) {
  const register = useHotkeyStore((s) => s.register);
  const unregister = useHotkeyStore((s) => s.unregister);

  // Memoize callback
  const memoizedCallback = useCallback(callback, deps);

  useEffect(() => {
    const defaultBinding = DEFAULT_HOTKEYS[action];
    if (!defaultBinding) {
      console.warn(`Unknown hotkey action: ${action}`);
      return;
    }

    register(
      action,
      {
        key: defaultBinding.key,
        ctrl: defaultBinding.ctrl,
        shift: defaultBinding.shift,
        alt: defaultBinding.alt,
        description: defaultBinding.description,
      },
      memoizedCallback,
    );

    return () => {
      unregister(action);
    };
  }, [action, memoizedCallback, register, unregister]);
}

/**
 * Register multiple hotkeys at once
 */
export function useHotkeys(
  hotkeys: Array<{
    action: keyof typeof DEFAULT_HOTKEYS;
    callback: () => void;
  }>,
) {
  const register = useHotkeyStore((s) => s.register);
  const unregister = useHotkeyStore((s) => s.unregister);

  useEffect(() => {
    for (const { action, callback } of hotkeys) {
      const defaultBinding = DEFAULT_HOTKEYS[action];
      if (!defaultBinding) continue;

      register(
        action,
        {
          key: defaultBinding.key,
          ctrl: defaultBinding.ctrl,
          shift: defaultBinding.shift,
          alt: defaultBinding.alt,
          description: defaultBinding.description,
        },
        callback,
      );
    }

    return () => {
      for (const { action } of hotkeys) {
        unregister(action);
      }
    };
  }, [hotkeys, register, unregister]);
}
```

- [ ] **Step 2: Commit useHotkey hook**

```bash
git add src/hooks/useHotkey.ts
git commit -m "feat(hotkey): add useHotkey hook"
```

---

## Task 4: Integrate HotkeyProvider

**Files:**

- Modify: `src/app/layout.tsx` (or appropriate root layout file)

- [ ] **Step 1: Find the root layout file**

Use glob/read to find the correct layout file.

- [ ] **Step 2: Wrap app with HotkeyProvider**

```typescript
// In root layout file
import { HotkeyProvider } from "@/lib/HotkeyProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <HotkeyProvider>
      {/* existing content */}
      {children}
    </HotkeyProvider>
  );
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 4: Commit layout changes**

```bash
git add src/app/layout.tsx
git commit -m "feat(hotkey): wrap app with HotkeyProvider"
```

---

## Task 5: Implement Core Hotkeys

**Files:**

- Modify: `src/app/views/TodosView.tsx`
- Modify: `src/components/layout/Sidebar.tsx` (for navigation)

- [ ] **Step 1: Add navigation hotkeys in Sidebar**

```typescript
// In Sidebar component or a dedicated hook
import { useHotkeys } from "@/hooks/useHotkey";
import { useRouter } from "next/router"; // or use navigation from your router

function useNavigationHotkeys() {
  const router = useRouter();

  useHotkeys([
    { action: "view-dashboard", callback: () => router.push("/") },
    { action: "view-todos", callback: () => router.push("/todos") },
    { action: "view-plans", callback: () => router.push("/plans") },
    { action: "view-targets", callback: () => router.push("/targets") },
    {
      action: "view-circulations",
      callback: () => router.push("/circulations"),
    },
    { action: "view-statistics", callback: () => router.push("/statistics") },
    { action: "settings", callback: () => router.push("/settings") },
  ]);
}
```

- [ ] **Step 2: Add new todo hotkey in TodosView**

```typescript
// In TodosView
import { useHotkey } from "@/hooks/useHotkey";

function TodosView() {
  const [showForm, setShowForm] = useState(false);

  useHotkey("new-todo", () => setShowForm(true));

  // ...
}
```

- [ ] **Step 3: Add search hotkey in Sidebar**

```typescript
// In Sidebar or SearchBar component
import { useHotkey } from "@/hooks/useHotkey";

function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkey("search", () => {
    inputRef.current?.focus();
  });

  // ...
}
```

- [ ] **Step 4: Add Escape hotkey for modal close**

```typescript
// In Modal component or a modal context
import { useHotkey } from "@/hooks/useHotkey";

function Modal({ open, onOpenChange, children }) {
  useHotkey("escape", () => {
    if (open) onOpenChange(false);
  });

  // ...
}
```

- [ ] **Step 5: Commit hotkey implementations**

```bash
git add src/components/layout/Sidebar.tsx src/app/views/TodosView.tsx
git commit -m "feat(hotkey): implement navigation and action hotkeys"
```

---

## Task 6: Hotkey Settings UI

**Files:**

- Modify: `src/app/views/SettingsGeneralView.tsx`

- [ ] **Step 1: Read current SettingsGeneralView.tsx**

Understand current structure.

- [ ] **Step 2: Add hotkey settings section**

```typescript
// Add to SettingsGeneralView.tsx
import { useHotkeyStore, DEFAULT_HOTKEYS, configToString } from "@/lib/useHotkeyStore";

function HotkeySettings() {
  const getConfig = useHotkeyStore((s) => s.getConfig);
  const updateConfig = useHotkeyStore((s) => s.updateConfig);
  const resetConfig = useHotkeyStore((s) => s.resetConfig);
  const resetAll = useHotkeyStore((s) => s.resetAll);
  const detectConflict = useHotkeyStore((s) => s.detectConflict);

  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [tempKey, setTempKey] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();

    const config: HotkeyConfig = {
      key: e.key,
      ctrl: e.ctrlKey || e.metaKey,
      shift: e.shiftKey,
      alt: e.altKey,
    };

    const conflict = detectConflict(config, action);
    if (conflict) {
      toast.error(`快捷键冲突: ${configToString(config)} 已被 "${DEFAULT_HOTKEYS[conflict]?.description}" 使用`);
      return;
    }

    updateConfig(action, config);
    setEditingAction(null);
    toast.success(`快捷键已更新`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">快捷键设置</h3>
        <Button variant="outline" size="sm" onClick={resetAll}>
          恢复默认
        </Button>
      </div>

      <div className="space-y-2">
        {Object.entries(DEFAULT_HOTKEYS).map(([action, def]) => {
          const config = getConfig(action);
          const isEditing = editingAction === action;

          return (
            <div
              key={action}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)]"
            >
              <span className="text-sm">{def.description}</span>

              {isEditing ? (
                <div
                  className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-primary)] rounded text-sm"
                  onKeyDown={(e) => handleKeyDown(e, action)}
                  tabIndex={0}
                  autoFocus
                >
                  按下新的快捷键...
                </div>
              ) : (
                <button
                  onClick={() => setEditingAction(action)}
                  className="px-3 py-1.5 bg-[var(--color-surface)] rounded text-sm font-mono hover:bg-[var(--color-surface-hover)]"
                >
                  {configToString(config)}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 4: Test manually**

1. Open Settings > General
2. Verify hotkey list shows
3. Click a hotkey, press new combination
4. Verify hotkey updates
5. Click "恢复默认"
6. Verify all hotkeys reset
7. Test conflict detection by setting same key twice

- [ ] **Step 5: Commit settings UI**

```bash
git add src/app/views/SettingsGeneralView.tsx
git commit -m "feat(hotkey): add hotkey settings UI"
```

---

## Task 7: Testing

**Files:**

- Create: `src/lib/__tests__/useHotkeyStore.test.ts`
- Create: `src/hooks/__tests__/useHotkey.test.ts`

- [ ] **Step 1: Write store tests**

```typescript
// src/lib/__tests__/useHotkeyStore.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useHotkeyStore, DEFAULT_HOTKEYS } from "../useHotkeyStore";

describe("useHotkeyStore", () => {
  beforeEach(() => {
    useHotkeyStore.setState({ hotkeys: {}, customConfigs: {} });
  });

  it("should register a hotkey", () => {
    const callback = vi.fn();
    useHotkeyStore.getState().register(
      "new-todo",
      {
        key: "n",
        ctrl: true,
        description: "新建 Todo",
      },
      callback,
    );

    expect(useHotkeyStore.getState().hotkeys["new-todo"]).toBeDefined();
    expect(useHotkeyStore.getState().hotkeys["new-todo"].key).toBe("n");
  });

  it("should unregister a hotkey", () => {
    useHotkeyStore.getState().register(
      "new-todo",
      {
        key: "n",
        ctrl: true,
        description: "新建 Todo",
      },
      () => {},
    );

    useHotkeyStore.getState().unregister("new-todo");

    expect(useHotkeyStore.getState().hotkeys["new-todo"]).toBeUndefined();
  });

  it("should update custom config", () => {
    useHotkeyStore
      .getState()
      .updateConfig("new-todo", { key: "m", ctrl: true });

    const config = useHotkeyStore.getState().getConfig("new-todo");
    expect(config.key).toBe("m");
  });

  it("should detect conflicts", () => {
    useHotkeyStore.getState().register(
      "new-todo",
      {
        key: "n",
        ctrl: true,
        description: "新建 Todo",
      },
      () => {},
    );

    const conflict = useHotkeyStore
      .getState()
      .detectConflict({ key: "n", ctrl: true });
    expect(conflict).toBe("new-todo");

    const noConflict = useHotkeyStore
      .getState()
      .detectConflict({ key: "m", ctrl: true });
    expect(noConflict).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test src/lib/__tests__/useHotkeyStore.test.ts
```

Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add src/lib/__tests__/useHotkeyStore.test.ts
git commit -m "test(hotkey): add useHotkeyStore tests"
```

---

## Verification Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] Manual test: Ctrl+N opens new todo form
- [ ] Manual test: Ctrl+K focuses search
- [ ] Manual test: Ctrl+1-6 switches views
- [ ] Manual test: Escape closes modals
- [ ] Manual test: Hotkey settings UI works
- [ ] Manual test: Custom hotkeys persist after reload
- [ ] Manual test: Conflict detection works

---

## Notes

- Meta key (Cmd on Mac) is treated same as Ctrl
- Escape works even when focus is in input field
- Hotkeys don't trigger when typing in input/textarea (except Escape)
- Custom hotkeys are persisted in localStorage via Zustand persist
