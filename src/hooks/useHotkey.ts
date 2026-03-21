import { useEffect, useCallback } from "react";
import { useHotkeyStore, DEFAULT_HOTKEYS } from "@/lib/useHotkeyStore";

export function useHotkey(
  action: keyof typeof DEFAULT_HOTKEYS,
  callback: () => void,
  deps: React.DependencyList = [],
) {
  const register = useHotkeyStore((s) => s.register);
  const unregister = useHotkeyStore((s) => s.unregister);
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
    return () => unregister(action);
  }, [action, memoizedCallback, register, unregister]);
}

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
      for (const { action } of hotkeys) unregister(action);
    };
  }, [hotkeys, register, unregister]);
}
