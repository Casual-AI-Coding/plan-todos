"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";
import {
  DailySummarySettings,
  NotificationPlugin,
  getDailySummarySettings,
  updateDailySummarySettings,
  getNotificationPlugins,
} from "@/lib/api";

export function SettingsDailySummaryView() {
  const [_settings, setSettings] = useState<DailySummarySettings | null>(null);
  const [plugins, setPlugins] = useState<NotificationPlugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [includePending, setIncludePending] = useState(true);
  const [includeOverdue, setIncludeOverdue] = useState(true);
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsResult, pluginsResult] = await Promise.all([
        getDailySummarySettings(),
        getNotificationPlugins(),
      ]);
      setSettings(settingsResult);
      setPlugins(pluginsResult.filter((p) => p.enabled));

      // Initialize form state
      setEnabled(settingsResult.enabled);
      setTime(settingsResult.time);
      setIncludePending(settingsResult.include_pending);
      setIncludeOverdue(settingsResult.include_overdue);
      setIncludeCompleted(settingsResult.include_completed);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDailySummarySettings(
        enabled,
        time,
        includePending,
        includeOverdue,
        includeCompleted,
      );
      alert("设置已保存");
      fetchData();
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("保存失败: " + error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      // TODO: Implement test send
      alert("测试功能开发中");
    } catch (error) {
      console.error("Failed to send test:", error);
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
          设置 &gt; 通知 &gt; 每日汇总
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
        设置 &gt; 通知 &gt; 每日汇总
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
                checked={enabled}
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
              value={time}
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
                  checked={includePending}
                  onChange={(e) => setIncludePending(e.target.checked)}
                  className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                />
                <span>包含待办事项</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOverdue}
                  onChange={(e) => setIncludeOverdue(e.target.checked)}
                  className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
                />
                <span>包含已过期事项</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCompleted}
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
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "保存中..." : "保存设置"}
        </Button>
        <Button variant="secondary" onClick={handleTest}>
          发送测试
        </Button>
      </div>
    </div>
  );
}
