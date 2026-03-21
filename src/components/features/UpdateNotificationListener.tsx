"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { checkForUpdates } from "@/lib/api/update";

// Global state to prevent multiple checks/toasts
let hasCheckedForUpdate = false;

export function UpdateNotificationListener() {
  const toast = useToast();

  useEffect(() => {
    // Check for updates on mount (only once per app session)
    if (hasCheckedForUpdate) return;
    hasCheckedForUpdate = true;

    const doCheck = async () => {
      try {
        const info = await checkForUpdates();
        if (info?.has_update) {
          toast.info(`发现新版本 ${info.latest_version}，前往设置 > 关于下载`);
        }
      } catch {
        // Silently fail - user can manually check in settings
      }
    };

    doCheck();
  }, [toast]);

  return null;
}
