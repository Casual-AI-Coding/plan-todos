"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface UseListNavigationOptions<T> {
  items: T[];
  getItemId: (item: T) => string;
  onSelect?: (item: T) => void;
  onActivate?: (item: T) => void;
  enabled?: boolean;
}

export interface ListNavigationState<T> {
  focusedIndex: number;
  focusedItem: T | null;
  setFocusedIndex: (index: number) => void;
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: () => void;
  focusPrev: () => void;
  selectFocused: () => void;
  activateFocused: () => void;
  resetFocus: () => void;
}

/**
 * Hook for keyboard navigation in lists
 *
 * Supports:
 * - Arrow Up/Down or j/k for navigation
 * - Enter to select/activate
 * - Escape to reset focus
 * - Home/End for first/last item
 */
export function useListNavigation<T>({
  items,
  getItemId,
  onSelect,
  onActivate,
  enabled = true,
}: UseListNavigationOptions<T>): ListNavigationState<T> {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLElement | null>(null);

  const focusedItem =
    focusedIndex >= 0 && focusedIndex < items.length
      ? items[focusedIndex]
      : null;

  const focusFirst = useCallback(() => {
    if (items.length > 0) {
      setFocusedIndex(0);
    }
  }, [items.length]);

  const focusLast = useCallback(() => {
    if (items.length > 0) {
      setFocusedIndex(items.length - 1);
    }
  }, [items.length]);

  const focusNext = useCallback(() => {
    if (items.length === 0) return;
    setFocusedIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const focusPrev = useCallback(() => {
    if (items.length === 0) return;
    setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const selectFocused = useCallback(() => {
    if (focusedItem && onSelect) {
      onSelect(focusedItem);
    }
  }, [focusedItem, onSelect]);

  const activateFocused = useCallback(() => {
    if (focusedItem && onActivate) {
      onActivate(focusedItem);
    }
  }, [focusedItem, onActivate]);

  const resetFocus = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  // Reset focus when items change
  useEffect(() => {
    if (focusedIndex >= items.length) {
      setFocusedIndex(items.length > 0 ? items.length - 1 : -1);
    }
  }, [items, focusedIndex]);

  // Keyboard event handler
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
        case "j":
          e.preventDefault();
          focusNext();
          break;
        case "ArrowUp":
        case "k":
          e.preventDefault();
          focusPrev();
          break;
        case "Home":
          e.preventDefault();
          focusFirst();
          break;
        case "End":
          e.preventDefault();
          focusLast();
          break;
        case "Enter":
          e.preventDefault();
          if (e.shiftKey) {
            activateFocused();
          } else {
            selectFocused();
          }
          break;
        case "Escape":
          e.preventDefault();
          resetFocus();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    focusFirst,
    focusLast,
    focusNext,
    focusPrev,
    selectFocused,
    activateFocused,
    resetFocus,
  ]);

  return {
    focusedIndex,
    focusedItem,
    setFocusedIndex,
    focusFirst,
    focusLast,
    focusNext,
    focusPrev,
    selectFocused,
    activateFocused,
    resetFocus,
  };
}

/**
 * Props to spread on list items for keyboard navigation
 */
export interface ListItemNavigationProps {
  tabIndex: number;
  "data-focused": boolean;
  role: string;
}

/**
 * Get props for a list item at a specific index
 */
export function getListItemProps(
  index: number,
  focusedIndex: number,
): ListItemNavigationProps {
  return {
    tabIndex: index === focusedIndex ? 0 : -1,
    "data-focused": index === focusedIndex,
    role: "listitem",
  };
}
