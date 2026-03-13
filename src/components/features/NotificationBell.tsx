"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotificationPolling } from "@/lib/hooks/useNotificationPolling";
import { NotificationModal } from "./NotificationModal";

export function NotificationBell() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { pendingCount } = useNotificationPolling();

  const handleBellClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={`${pendingCount} 条未读通知`}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {pendingCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]"
            aria-hidden="true"
          >
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
