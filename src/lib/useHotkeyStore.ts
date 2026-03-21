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
  hotkeys: Record<string, HotkeyBinding>;
  customConfigs: Record<string, HotkeyConfig>;
  register: (
    action: string,
    binding: Omit<HotkeyBinding, "action">,
    callback: () => void,
  ) => void;
  unregister: (action: string) => void;
  updateConfig: (action: string, config: HotkeyConfig) => void;
  resetConfig: (action: string) => void;
  resetAll: () => void;
  getConfig: (action: string) => HotkeyConfig;
  detectConflict: (
    config: HotkeyConfig,
    excludeAction?: string,
  ) => string | null;
}

export const DEFAULT_HOTKEYS: Record<
  string,
  {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    description: string;
  }
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

export function configToString(config: HotkeyConfig): string {
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
        const conflict = get().detectConflict(config, action);
        if (conflict) {
          console.warn(
            `Hotkey conflict: ${configToString(config)} is already used by "${conflict}"`,
          );
          return;
        }
        set((state) => ({
          customConfigs: { ...state.customConfigs, [action]: config },
        }));
      },

      resetConfig: (action) => {
        set((state) => {
          const { [action]: _, ...rest } = state.customConfigs;
          return { customConfigs: rest };
        });
      },

      resetAll: () => set({ customConfigs: {} }),

      getConfig: (action) => {
        const custom = get().customConfigs[action];
        if (custom) return custom;
        const def = DEFAULT_HOTKEYS[action];
        return { key: def.key, ctrl: def.ctrl, shift: def.shift, alt: def.alt };
      },

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
