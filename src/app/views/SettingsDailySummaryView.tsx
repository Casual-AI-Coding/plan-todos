"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import {
  useDailySummarySettings,
  useUpdateDailySummarySettings,
} from "@/hooks/useDailySummarySettings";
import { useNotificationPlugins } from "@/hooks/useNotificationPlugins";
import { sendTestNotification } from "@/lib/api/notifications";
import type { NotificationPlugin } from "@/lib/api";

export function SettingsDailySummaryView() {
  // React Query for data fetching
  const { data: settings, isLoading: settingsLoading } =
    useDailySummarySettings();
  const { data: allPlugins = [], isLoading: pluginsLoading } =
    useNotificationPlugins();
  const updateSettings = useUpdateDailySummarySettings();

  const plugins = allPlugins.filter((p) => p.enabled);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [includePending, setIncludePending] = useState(true);
  const [includeOverdue, setIncludeOverdue] = useState(true);
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  // Use settings directly when available
  const displayEnabled = settings?.enabled ?? enabled;
  const displayTime = settings?.time ?? time;
  const displayIncludePending = settings?.include_pending ?? includePending;
  const displayIncludeOverdue = settings?.include_overdue ?? includeOverdue;
  const displayIncludeCompleted =
    settings?.include_completed ?? includeCompleted;

  const isLoading = settingsLoading || pluginsLoading;

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        enabled,
        time,
        includePending,
        includeOverdue,
        includeCompleted,
      });
      alert("设置已保存");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("保存失败: " + error);
    }
  };

  const handleTest = async () => {
    try {
      await sendTestNotification();
      alert("测试通知已发送");
    } catch (error) {
      console.error("Failed to send test:", error);
      alert("发送失败: " + error);
    }
  };

  const togglePlugin = (pluginId: string) => {
    setSelectedPlugins((prev) =>
      prev.includes(pluginId)
        ? prev.filter((id) => id !== pluginId)
        : [...prev, pluginId],
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ color: "var(--color-text)" }}
        >
          通知 &gt; 每日汇总
        </h2>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "var(--color-text)" }}
      >
        通知 &gt; 每日汇总
      </h2>

      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          每日汇总设置
        </h3>
        <div className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">开启每日汇总</div>
              <div className="text-sm text-gray-500">每天定时发送汇总通知</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={displayEnabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              汇总时间
            </label>
            <input
              type="time"
              value={displayTime}
              onChange={(e) => setTime(e.target.value)}
              className="px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Content Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              汇总内容
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={displayIncludePending}
                  onChange={(e) => setIncludePending(e.target.checked)}
                  className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                />
                <span>包含待办事项</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={displayIncludeOverdue}
                  onChange={(e) => setIncludeOverdue(e.target.checked)}
                  className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                />
                <span>包含已过期事项</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={displayIncludeCompleted}
                  onChange={(e) => setIncludeCompleted(e.target.checked)}
                  className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                />
                <span>包含已完成事项</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Send Channels */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          发送渠道
        </h3>
        <div className="space-y-2">
          {plugins.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              暂无启用的通知渠道，请在&quot;通知渠道&quot;页面添加
            </div>
          ) : (
            plugins.map((plugin) => (
              <label
                key={plugin.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPlugins.includes(plugin.id)}
                  onChange={() => togglePlugin(plugin.id)}
                  className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                />
                <span className="font-medium">{plugin.name}</span>
                <span className="text-gray-500 text-sm">
                  {plugin.plugin_type === "feishu" && "🔔 飞书/Lark"}
                  {plugin.plugin_type === "dingtalk" && "💬 钉钉"}
                  {plugin.plugin_type === "email" && "📧 邮件"}
                  {plugin.plugin_type === "webhook" && "🔗 Webhook"}
                </span>
              </label>
            ))
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "保存中..." : "保存设置"}
        </Button>
        <Button variant="secondary" onClick={handleTest}>
          发送测试
        </Button>
      </div>
    </div>
  );
}
