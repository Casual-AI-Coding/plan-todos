"use client";

import { useState, useEffect, useCallback } from "react";
import { checkForUpdates, UpdateInfo, skipVersion } from "@/lib/api/update";

// Global state to prevent multiple toasts
let hasShownUpdateToast = false;

export function useAutoUpdate() {
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkUpdate = useCallback(async (showToast = true) => {
    setChecking(true);
    setError(null);
    try {
      const info = await checkForUpdates();
      setUpdateInfo(info);

      // Show toast notification if update available and not already shown
      if (info && info.has_update && showToast && !hasShownUpdateToast) {
        hasShownUpdateToast = true;
        // Use custom event to trigger toast from anywhere
        window.dispatchEvent(
          new CustomEvent("app:update-available", {
            detail: info,
          }),
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "检查更新失败");
    } finally {
      setChecking(false);
    }
  }, []);

  const handleSkip = async () => {
    if (updateInfo) {
      await skipVersion(updateInfo.latest_version);
      setUpdateInfo(null);
      hasShownUpdateToast = false;
    }
  };

  // Auto-check on mount (throttle handled by backend)
  useEffect(() => {
    checkUpdate();
  }, [checkUpdate]);

  return {
    checking,
    updateInfo,
    error,
    checkUpdate,
    handleSkip,
  };
}

// Export for manual check (e.g., from settings)
export function resetUpdateToastFlag() {
  hasShownUpdateToast = false;
}
