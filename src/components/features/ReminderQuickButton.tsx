"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { ReminderSettings } from "./ReminderSettings";

export interface ReminderQuickButtonProps {
  entityType: "todo" | "plan" | "target";
  entityId: string;
  reminderTimes: number[];
  onUpdate: (times: number[]) => void;
}

export function ReminderQuickButton({
  entityType,
  entityId,
  reminderTimes,
  onUpdate,
}: ReminderQuickButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCount = reminderTimes.length;

  // 图标显示状态
  // - 无提醒: opacity 0.3
  // - 有提醒: 正常颜色，显示数量徽章
  // - 已发送: opacity 0.6 (暂未实现，保留扩展)

  const handleSave = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
        style={{
          color:
            selectedCount > 0
              ? "var(--color-primary)"
              : "var(--color-text-muted)",
          opacity: selectedCount === 0 ? 0.3 : 1,
        }}
        aria-label={
          selectedCount > 0 ? `提醒设置: ${selectedCount}个` : "设置提醒"
        }
      >
        <Bell className="w-4 h-4" />
        {selectedCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-medium rounded-full"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text-inverse)",
            }}
          >
            {selectedCount}
          </span>
        )}
      </button>

      <Modal
        open={isOpen}
        title="提醒设置"
        width="sm"
        onClose={() => setIsOpen(false)}
        footer={<Button onClick={handleSave}>保存</Button>}
      >
        <ReminderSettings value={reminderTimes} onChange={onUpdate} compact />
      </Modal>
    </>
  );
}
