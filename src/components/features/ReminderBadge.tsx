import { Bell } from "lucide-react";

export interface ReminderBadgeProps {
  /** 提醒数量 */
  count: number;
  /** 是否已发送（用于区分样式） */
  sent?: boolean;
  /** 大小 */
  size?: "sm" | "md";
}

/**
 * 提醒状态徽章组件
 * - count=0: 不显示
 * - count>0, sent=false: 正常颜色
 * - count>0, sent=true: 淡色 (opacity: 0.6)
 */
export function ReminderBadge({
  count,
  sent = false,
  size = "md",
}: ReminderBadgeProps) {
  if (count === 0) {
    return null;
  }

  const sizeClasses =
    size === "sm"
      ? { icon: "w-3 h-3", badge: "min-w-[12px] h-3 px-0.5 text-[8px]" }
      : { icon: "w-4 h-4", badge: "min-w-[16px] h-4 px-1 text-[10px]" };

  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ opacity: sent ? 0.6 : 1 }}
    >
      <Bell data-testid="bell-icon" className={sizeClasses.icon} />
      <span
        className={`absolute -top-1 -right-1 flex items-center justify-center font-medium rounded-full ${sizeClasses.badge}`}
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-text-inverse)",
        }}
      >
        {count}
      </span>
    </span>
  );
}
