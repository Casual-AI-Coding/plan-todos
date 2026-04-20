"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseFormStateOptions<T extends Record<string, unknown>> {
  initialValues: T;
  onSave?: (data: T) => void;
  onClose?: () => void;
}

export interface UseFormStateReturn<T extends Record<string, unknown>> {
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  handleSave: () => void;
  handleClose: () => void;
  reset: () => void;
  isDirty: boolean;
}

export function useFormState<T extends Record<string, unknown>>(
  open: boolean,
  editingItem: unknown,
  options: UseFormStateOptions<T>,
): UseFormStateReturn<T> {
  const { initialValues, onSave, onClose } = options;
  const [values, setValues] = useState<T>(initialValues);
  const [isDirty, setIsDirty] = useState(false);
  const isInitialized = useRef(false);
  const initialValuesRef = useRef(initialValues);

  useEffect(() => {
    if (!open) return;

    if (isInitialized.current && !editingItem) {
      setValues(initialValuesRef.current);
      setIsDirty(false);
    } else if (editingItem) {
      setValues(editingItem as T);
      setIsDirty(false);
    }
    isInitialized.current = true;
  }, [open, editingItem]);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => {
      const newValues = { ...prev, [key]: value };
      setIsDirty(true);
      return newValues;
    });
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(values);
    setIsDirty(false);
  }, [values, onSave]);

  const handleClose = useCallback(() => {
    setValues(initialValuesRef.current);
    setIsDirty(false);
    onClose?.();
  }, [onClose]);

  const reset = useCallback(() => {
    setValues(initialValuesRef.current);
    setIsDirty(false);
  }, []);

  return { values, setValue, handleSave, handleClose, reset, isDirty };
}
