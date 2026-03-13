"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { Card, Badge } from "@/components/ui";
import { StaggeredList, StaggeredListItem } from "@/components/ui/animations";
import { EmptyStateCard } from "@/components/features";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icons } from "@/components/ui/Icons";
import { useNotificationPolling } from "@/lib/hooks/useNotificationPolling";
import { getNotificationHistory } from "@/lib/api/notifications";
import type {
  NotificationHistory,
  DueReminder,
} from "@/lib/types/notification";

// Utility functions
const formatRelativeTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} 分钟后`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时后`;
  return `${Math.floor(minutes / 1440)} 天后`;
};

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
};

const getTimeGroup = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const itemDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (itemDate.getTime() === today.getTime()) return "今天";
  if (itemDate.getTime() === yesterday.getTime()) return "昨天";
  if (now.getTime() - date.getTime() < 7 * 86400000) return "本周";
  return "更早";
};

// Entity type configuration
const entityConfig: Record<
  string,
  { label: string; icon: keyof typeof Icons; color: string }
> = {
  todo: {
    label: "待办",
    icon: "CheckSquare",
    color: "var(--color-primary)",
  },
  plan: {
    label: "计划",
    icon: "Calendar",
    color: "var(--color-text-muted)",
  },
  target: {
    label: "目标",
    icon: "Target",
    color: "var(--color-success)",
  },
};

// Status badge configuration
const statusConfig: Record<
  string,
  {
    label: string;
    variant: "success" | "destructive" | "secondary";
    icon: keyof typeof Icons;
  }
> = {
  sent: { label: "已发送", variant: "success", icon: "CheckCircle" },
  failed: { label: "发送失败", variant: "destructive", icon: "AlertCircle" },
  pending: { label: "待发送", variant: "secondary", icon: "Clock" },
};

// Reminder card component
const ReminderCard = ({ reminder }: { reminder: DueReminder }) => {
  const config = entityConfig[reminder.entity_type] || entityConfig.todo;
  const EntityIcon = Icons[config.icon];

  return (
    <Card
      hoverable
      className="group"
      style={{
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--color-bg-hover)" }}
        >
          <EntityIcon className="w-4 h-4" style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-medium truncate"
            style={{ color: "var(--color-text)" }}
          >
            {reminder.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs font-medium"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
            <span style={{ color: "var(--color-text-muted)" }}>•</span>
            <span
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {formatRelativeTime(reminder.minutes_until_due)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// History item card component
const HistoryCard = ({ item }: { item: NotificationHistory }) => {
  const config = entityConfig[item.entity_type] || entityConfig.todo;
  const status = statusConfig[item.status] || statusConfig.pending;
  const StatusIcon = Icons[status.icon];
  const EntityIcon = Icons[config.icon];

  return (
    <Card
      hoverable
      className="group"
      style={{
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--color-bg-hover)" }}
        >
          <EntityIcon className="w-4 h-4" style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className="font-medium truncate"
              style={{ color: "var(--color-text)" }}
            >
              {item.title}
            </h4>
            <Badge variant={status.variant} className="flex-shrink-0 text-xs">
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <div
            className="flex items-center gap-2 mt-1 text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span style={{ color: config.color }}>{config.label}</span>
            <span>•</span>
            <span>{formatDateTime(item.scheduled_at)}</span>
            {item.channel && (
              <>
                <span>•</span>
                <span>{item.channel}</span>
              </>
            )}
          </div>
          {item.error_message && (
            <p
              className="mt-2 text-xs px-2 py-1 rounded"
              style={{
                color: "var(--color-error)",
                backgroundColor: "var(--color-bg-error)",
              }}
            >
              {item.error_message}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <Card key={i}>
        <div className="flex items-start gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

// Tab button component
const TabButton = ({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "text-white"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`}
    style={{
      backgroundColor: active ? "var(--color-primary)" : "transparent",
    }}
  >
    {children}
    {count !== undefined && count > 0 && (
      <span
        className="px-1.5 py-0.5 rounded-full text-xs"
        style={{
          backgroundColor: active
            ? "rgba(255,255,255,0.3)"
            : "var(--color-bg-hover)",
          color: active ? "white" : "var(--color-text-muted)",
        }}
      >
        {count}
      </span>
    )}
  </button>
);

// Main component
export function NotificationCenterView() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const { dueReminders, isLoading: remindersLoading } =
    useNotificationPolling();
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (activeTab === "history") {
      startTransition(() => {
        setIsHistoryLoading(true);
      });
      getNotificationHistory()
        .then((data) => {
          startTransition(() => {
            setHistory(data);
          });
        })
        .catch((error) => {
          console.error("Failed to fetch notification history:", error);
          startTransition(() => {
            setHistory([]);
          });
        })
        .finally(() => {
          startTransition(() => {
            setIsHistoryLoading(false);
          });
        });
    }
  }, [activeTab, startTransition]);

  // Group history by time
  const groupedHistory = useMemo(() => {
    const groups: Record<string, NotificationHistory[]> = {};
    history.forEach((item) => {
      const group = getTimeGroup(item.scheduled_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });
    return groups;
  }, [history]);

  const groupOrder = ["今天", "昨天", "本周", "更早"];

  return (
    <div className="p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          NOTIFICATIONS
        </h2>
        {dueReminders.length > 0 && (
          <Badge variant="destructive" className="px-3 py-1">
            {dueReminders.length} 个待处理
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex gap-2 mb-4 p-2 rounded-lg"
        style={{ backgroundColor: "var(--color-bg-card)" }}
      >
        <TabButton
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
          count={dueReminders.length}
        >
          <Icons.Clock className="w-4 h-4" />
          <span>待处理</span>
        </TabButton>
        <TabButton
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          <Icons.History className="w-4 h-4" />
          <span>历史记录</span>
        </TabButton>
      </div>

      {/* Content */}
      {activeTab === "pending" ? (
        remindersLoading ? (
          <LoadingSkeleton />
        ) : dueReminders.length === 0 ? (
          <EmptyStateCard
            icon="🔔"
            title="暂无待处理提醒"
            description="您的待办事项都很准时！当事项即将到期时，我们会在这里提醒您。"
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                共 {dueReminders.length} 个待处理提醒
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                按到期时间排序
              </span>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <StaggeredList className="space-y-2" staggerDelay={50}>
                {dueReminders.map((reminder) => (
                  <StaggeredListItem
                    key={`${reminder.entity_type}-${reminder.entity_id}`}
                  >
                    <ReminderCard reminder={reminder} />
                  </StaggeredListItem>
                ))}
              </StaggeredList>
            </ScrollArea>
          </>
        )
      ) : isHistoryLoading ? (
        <LoadingSkeleton />
      ) : history.length === 0 ? (
        <EmptyStateCard
          icon="✅"
          title="暂无历史记录"
          description="您的通知历史为空。当提醒发送后，它们会出现在这里。"
        />
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-6">
            {groupOrder.map((groupName) => {
              const items = groupedHistory[groupName];
              if (!items || items.length === 0) return null;
              return (
                <div key={groupName}>
                  <h3
                    className="text-sm font-semibold mb-3 px-2"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {groupName}
                    <span
                      className="ml-2 text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      ({items.length})
                    </span>
                  </h3>
                  <StaggeredList className="space-y-2" staggerDelay={30}>
                    {items.map((item) => (
                      <StaggeredListItem key={item.id}>
                        <HistoryCard item={item} />
                      </StaggeredListItem>
                    ))}
                  </StaggeredList>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
