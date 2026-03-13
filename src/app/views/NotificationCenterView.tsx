"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Icons } from "@/components/ui/Icons";
import { useNotificationPolling } from "@/lib/hooks/useNotificationPolling";
import { getNotificationHistory } from "@/lib/api/notifications";
import type { NotificationHistory } from "@/lib/types/notification";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="success">
            <Icons.CheckCircle className="w-3 h-3 mr-1" />
            已发送
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <Icons.AlertCircle className="w-3 h-3 mr-1" />
            失败
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Icons.Clock className="w-3 h-3 mr-1" />
            待发送
          </Badge>
        );
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case "todo":
        return "待办";
      case "plan":
        return "计划";
      case "target":
        return "目标";
      default:
        return entityType;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Icons.Bell className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">通知中心</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "pending" | "history")}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">
            待处理{" "}
            {dueReminders.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {dueReminders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">待处理提醒</CardTitle>
            </CardHeader>
            <CardContent>
              {remindersLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  加载中...
                </div>
              ) : dueReminders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icons.Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无待处理提醒</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {dueReminders.map((reminder) => (
                      <div
                        key={`${reminder.entity_type}-${reminder.entity_id}`}
                        className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{reminder.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {getEntityTypeLabel(reminder.entity_type)} • 还有{" "}
                              {reminder.minutes_until_due} 分钟到期
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            查看
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">历史记录</CardTitle>
            </CardHeader>
            <CardContent>
              {isHistoryLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  加载中...
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icons.CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无历史记录</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {getEntityTypeLabel(item.entity_type)} •{" "}
                              {item.scheduled_at &&
                                new Date(item.scheduled_at).toLocaleString(
                                  "zh-CN",
                                )}
                            </p>
                            {item.error_message && (
                              <p className="text-sm text-destructive mt-1">
                                {item.error_message}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
