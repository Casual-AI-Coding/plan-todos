// src/hooks/useBatchSelect.ts
import { create } from "zustand";

interface BatchSelectState {
  mode: boolean;
  selectedIds: Set<string>;
  toggleMode: () => void;
  enterMode: () => void;
  exitMode: () => void;
  toggle: (id: string) => void;
  select: (id: string) => void;
  deselect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  selectedCount: () => number;
  hasSelection: () => boolean;
}

export const useBatchSelect = create<BatchSelectState>((set, get) => ({
  mode: false,
  selectedIds: new Set<string>(),

  toggleMode: () => {
    const newMode = !get().mode;
    set({
      mode: newMode,
      selectedIds: newMode ? get().selectedIds : new Set(),
    });
  },

  enterMode: () => set({ mode: true }),

  exitMode: () => set({ mode: false, selectedIds: new Set() }),

  toggle: (id) => {
    const newIds = new Set(get().selectedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    set({ selectedIds: newIds });
  },

  select: (id) => {
    const newIds = new Set(get().selectedIds);
    newIds.add(id);
    set({ selectedIds: newIds });
  },

  deselect: (id) => {
    const newIds = new Set(get().selectedIds);
    newIds.delete(id);
    set({ selectedIds: newIds });
  },

  selectAll: (ids) => {
    set({ selectedIds: new Set(ids) });
  },

  deselectAll: () => {
    set({ selectedIds: new Set() });
  },

  clear: () => {
    set({ mode: false, selectedIds: new Set() });
  },

  isSelected: (id) => get().selectedIds.has(id),

  selectedCount: () => get().selectedIds.size,

  hasSelection: () => get().selectedIds.size > 0,
}));
