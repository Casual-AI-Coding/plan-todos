"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  { label: string; icon: keyof typeof Icons; color: string; bgColor: string }
> = {
  todo: {
    label: "待办",
    icon: "CheckSquare",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  plan: {
    label: "计划",
    icon: "Calendar",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  target: {
    label: "目标",
    icon: "Target",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
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

// Empty state component
const EmptyState = ({
  icon: IconName,
  title,
  description,
}: {
  icon: keyof typeof Icons;
  title: string;
  description: string;
}) => {
  const Icon = Icons[IconName];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-2xl" />
        <div className="relative w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center border border-slate-200">
          <Icon className="w-10 h-10 text-slate-400" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 text-center max-w-xs">
        {description}
      </p>
    </motion.div>
  );
};

// Reminder card component
const ReminderCard = ({ reminder }: { reminder: DueReminder }) => {
  const config = entityConfig[reminder.entity_type] || entityConfig.todo;
  const EntityIcon = Icons[config.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}
        >
          <EntityIcon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 truncate group-hover:text-primary transition-colors">
            {reminder.title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">
              {formatRelativeTime(reminder.minutes_until_due)}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          查看
        </Button>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

// History item card component
const HistoryCard = ({ item }: { item: NotificationHistory }) => {
  const config = entityConfig[item.entity_type] || entityConfig.todo;
  const status = statusConfig[item.status] || statusConfig.pending;
  const StatusIcon = Icons[status.icon];
  const EntityIcon = Icons[config.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      className="group flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white/50 hover:bg-white hover:shadow-sm transition-all"
    >
      <div
        className={`flex-shrink-0 w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center`}
      >
        <EntityIcon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-slate-900 truncate">{item.title}</h4>
          <Badge variant={status.variant} className="flex-shrink-0 text-xs">
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
          <span className={config.color}>{config.label}</span>
          <span className="text-slate-300">•</span>
          <span>{formatDateTime(item.scheduled_at)}</span>
          {item.channel && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">{item.channel}</span>
            </>
          )}
        </div>
        {item.error_message && (
          <p className="mt-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
            {item.error_message}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="space-y-3 p-2">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex items-start gap-4 p-4 rounded-xl border border-slate-100"
      >
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Main component
export function NotificationCenterView() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const { dueReminders, isLoading: remindersLoading } =
    useNotificationPolling();
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "history") {
      setIsHistoryLoading(true);
      getNotificationHistory()
        .then(setHistory)
        .catch((error) => {
          console.error("Failed to fetch notification history:", error);
          setHistory([]);
        })
        .finally(() => setIsHistoryLoading(false));
    }
  }, [activeTab]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Icons.Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">通知中心</h1>
                <p className="text-xs text-slate-500">管理您的提醒和通知</p>
              </div>
            </div>
            {dueReminders.length > 0 && (
              <Badge variant="destructive" className="px-3 py-1">
                {dueReminders.length} 个待处理
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "pending" | "history")}
          className="w-full"
        >
          {/* Custom Tab Design */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-1 mb-6">
            <TabsList className="w-full grid grid-cols-2 bg-transparent p-0 gap-1">
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl py-3 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Icons.Clock className="w-4 h-4" />
                  <span>待处理</span>
                  {dueReminders.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {dueReminders.length}
                    </span>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl py-3 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Icons.History className="w-4 h-4" />
                  <span>历史记录</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Pending Tab Content */}
          <TabsContent value="pending" className="mt-0 space-y-4">
            <AnimatePresence mode="wait">
              {remindersLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingSkeleton />
                </motion.div>
              ) : dueReminders.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EmptyState
                    icon="Bell"
                    title="暂无待处理提醒"
                    description="您的待办事项都很准时！当事项即将到期时，我们会在这里提醒您。"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-slate-600">
                      共 {dueReminders.length} 个待处理提醒
                    </span>
                    <span className="text-xs text-slate-400">
                      按到期时间排序
                    </span>
                  </div>
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="space-y-3 pr-4">
                      {dueReminders.map((reminder) => (
                        <ReminderCard
                          key={`${reminder.entity_type}-${reminder.entity_id}`}
                          reminder={reminder}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* History Tab Content */}
          <TabsContent value="history" className="mt-0">
            <AnimatePresence mode="wait">
              {isHistoryLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingSkeleton />
                </motion.div>
              ) : history.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EmptyState
                    icon="CheckCircle"
                    title="暂无历史记录"
                    description="您的通知历史为空。当提醒发送后，它们会出现在这里。"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="space-y-6 pr-4">
                      {groupOrder.map((groupName) => {
                        const items = groupedHistory[groupName];
                        if (!items || items.length === 0) return null;
                        return (
                          <div key={groupName}>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                              {groupName}
                              <span className="ml-2 text-xs text-slate-400">
                                ({items.length})
                              </span>
                            </h3>
                            <div className="space-y-2">
                              {items.map((item) => (
                                <HistoryCard key={item.id} item={item} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
