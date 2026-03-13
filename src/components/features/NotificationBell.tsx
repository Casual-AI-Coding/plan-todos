import { Bell } from "lucide-react";
import { useNotificationPolling } from "@/lib/hooks/useNotificationPolling";

interface NotificationBellProps {
  onClick?: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { pendingCount } = useNotificationPolling();

  return (
    <button
      onClick={onClick}
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
  );
}
