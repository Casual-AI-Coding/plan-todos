"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/config/constants";

export type ListDensity = "compact" | "standard" | "comfortable";

interface ListDensityState {
  density: ListDensity;
  setDensity: (density: ListDensity) => void;
}

export const useListDensity = create<ListDensityState>()(
  persist(
    (set) => ({
      density: "standard",
      setDensity: (density) => set({ density }),
    }),
    {
      name: STORAGE_KEYS.LIST_DENSITY,
    },
  ),
);

// CSS variable values for each density
export const DENSITY_VALUES = {
  compact: {
    "--list-gap": "8px",
    "--list-padding": "8px",
    "--item-padding": "8px 12px",
    "--item-font-size": "14px",
  },
  standard: {
    "--list-gap": "12px",
    "--list-padding": "12px",
    "--item-padding": "12px 16px",
    "--item-font-size": "14px",
  },
  comfortable: {
    "--list-gap": "16px",
    "--list-padding": "16px",
    "--item-padding": "16px 20px",
    "--item-font-size": "15px",
  },
} as const;

/**
 * Apply density CSS variables to an element
 */
export function applyDensity(
  element: HTMLElement | null,
  density: ListDensity,
) {
  if (!element) return;

  const values = DENSITY_VALUES[density];
  Object.entries(values).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}
