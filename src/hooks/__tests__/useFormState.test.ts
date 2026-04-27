import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useFormState } from "../useFormState";

interface FormValues extends Record<string, unknown> {
  [key: string]: unknown;
  title: string;
  count: number;
}

describe("useFormState", () => {
  const initialValues: FormValues = {
    title: "Initial title",
    count: 1,
  };

  it("returns initial values and a clean state", () => {
    const { result } = renderHook(() =>
      useFormState(true, null, { initialValues }),
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
  });

  it("updates a field and marks the form as dirty", () => {
    const { result } = renderHook(() =>
      useFormState(true, null, { initialValues }),
    );

    act(() => {
      result.current.setValue("title", "Updated title");
    });

    expect(result.current.values).toEqual({
      title: "Updated title",
      count: 1,
    });
    expect(result.current.isDirty).toBe(true);
  });

  it("calls onSave with the current values and clears dirty state", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFormState(true, null, { initialValues, onSave }),
    );

    act(() => {
      result.current.setValue("count", 2);
    });

    act(() => {
      result.current.handleSave();
    });

    expect(onSave).toHaveBeenCalledWith({
      title: "Initial title",
      count: 2,
    });
    expect(result.current.isDirty).toBe(false);
  });

  it("keeps dirty state when onSave throws", () => {
    const onSave = vi.fn(() => {
      throw new Error("save failed");
    });
    const { result } = renderHook(() =>
      useFormState(true, null, { initialValues, onSave }),
    );

    act(() => {
      result.current.setValue("title", "Broken save");
    });

    expect(() => {
      act(() => {
        result.current.handleSave();
      });
    }).toThrow("save failed");
    expect(result.current.isDirty).toBe(true);
  });

  it("resets values and calls onClose when handleClose runs", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useFormState(true, null, { initialValues, onClose }),
    );

    act(() => {
      result.current.setValue("title", "Changed before close");
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("resets back to initial values without closing", () => {
    const { result } = renderHook(() =>
      useFormState(true, null, { initialValues }),
    );

    act(() => {
      result.current.setValue("title", "Changed before reset");
      result.current.setValue("count", 9);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
  });

  it("loads editing item values when one is provided", () => {
    const editingItem: FormValues = {
      title: "Editing title",
      count: 5,
    };

    const { result } = renderHook(() =>
      useFormState(true, editingItem, { initialValues }),
    );

    expect(result.current.values).toEqual(editingItem);
    expect(result.current.isDirty).toBe(false);
  });

  it("restores initial values when the form reopens without an editing item", () => {
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) =>
        useFormState(open, null, { initialValues }),
      {
        initialProps: { open: true },
      },
    );

    act(() => {
      result.current.setValue("title", "Unsaved change");
    });

    rerender({ open: false });
    rerender({ open: true });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
  });
});
