"use client";

import { Bell, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useNotificationPolling } from "@/lib/hooks/useNotificationPolling";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { dueReminders } = useNotificationPolling();

  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 60) return `${minutes} 分钟`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时`;
    return `${Math.floor(minutes / 1440)} 天`;
  };

  return (
    <Modal
      open={isOpen}
      title={`待处理提醒 (${dueReminders.length})`}
      onClose={onClose}
      width="sm"
    >
      {dueReminders.length === 0 ? (
        <div className="text-center py-8">
          <Bell
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            style={{ color: "var(--color-text-muted)" }}
          />
          <p style={{ color: "var(--color-text-muted)" }}>暂无待处理提醒</p>
        </div>
      ) : (
        <>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {dueReminders.slice(0, 5).map((reminder) => (
              <div
                key={`${reminder.entity_type}-${reminder.entity_id}`}
                className="p-3 border rounded-lg transition-colors cursor-pointer"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-bg-hover)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium truncate"
                      style={{ color: "var(--color-text)" }}
                    >
                      {reminder.title}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      还有 {formatTimeRemaining(reminder.minutes_until_due)}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "var(--color-text-muted)" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {dueReminders.length > 5 && (
            <p
              className="text-center text-sm py-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              还有 {dueReminders.length - 5} 条提醒...
            </p>
          )}

          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={() => {
              // Navigate to notification center - handled by parent
              onClose();
            }}
          >
            查看全部
          </Button>
        </>
      )}
    </Modal>
  );
}
