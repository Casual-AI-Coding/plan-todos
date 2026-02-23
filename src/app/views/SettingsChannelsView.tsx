"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input, Modal } from "@/components/ui";
import {
  useNotificationPlugins,
  useCreateNotificationPlugin,
  useUpdateNotificationPlugin,
  useDeleteNotificationPlugin,
} from "@/hooks/useNotificationPlugins";
import { sendNotification, type NotificationPlugin } from "@/lib/api";

const PLUGIN_TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  feishu: { icon: "🔔", label: "飞书/Lark" },
  dingtalk: { icon: "💬", label: "钉钉" },
  email: { icon: "📧", label: "邮件" },
  webhook: { icon: "🔗", label: "Webhook" },
};

export function SettingsChannelsView() {
  // React Query for data fetching
  const { data: plugins = [], isLoading } = useNotificationPlugins();
  const createPlugin = useCreateNotificationPlugin();
  const updatePlugin = useUpdateNotificationPlugin();
  const deletePlugin = useDeleteNotificationPlugin();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState<NotificationPlugin | null>(
    null,
  );

  const handleToggleEnabled = async (plugin: NotificationPlugin) => {
    try {
      await updatePlugin.mutateAsync({
        id: plugin.id,
        name: plugin.name,
        enabled: !plugin.enabled,
        config: plugin.config,
      });
    } catch (error) {
      console.error("Failed to toggle plugin:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个通知渠道吗？")) return;
    try {
      await deletePlugin.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete plugin:", error);
    }
  };

  const handleTest = async (plugin: NotificationPlugin) => {
    try {
      await sendNotification(plugin.id, "测试通知", "这是一条测试通知");
      alert("测试通知已发送");
    } catch (error) {
      console.error("Failed to send test:", error);
      alert("发送失败: " + error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          设置 &gt; 通知 &gt; 通知渠道
        </h2>
        <Button onClick={() => setShowAddModal(true)}>+ 添加通知渠道</Button>
      </div>

      {/* Channels List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  渠道名称
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  类型
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  状态
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : plugins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    暂无通知渠道，点击&quot;添加通知渠道&quot;开始配置
                  </td>
                </tr>
              ) : (
                plugins.map((plugin) => (
                  <tr
                    key={plugin.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium">{plugin.name}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-2">
                        <span>
                          {PLUGIN_TYPE_LABELS[plugin.plugin_type]?.icon}
                        </span>
                        <span>
                          {PLUGIN_TYPE_LABELS[plugin.plugin_type]?.label ||
                            plugin.plugin_type}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleEnabled(plugin)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          plugin.enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {plugin.enabled ? "✅ 开启" : "❌ 关闭"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="text-sm py-1 px-3"
                          onClick={() => setEditingPlugin(plugin)}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-sm py-1 px-3"
                          onClick={() => handleTest(plugin)}
                        >
                          测试
                        </Button>
                        <Button
                          variant="danger"
                          className="text-sm py-1 px-3"
                          onClick={() => handleDelete(plugin.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <PluginModal
        open={showAddModal || !!editingPlugin}
        onClose={() => {
          setShowAddModal(false);
          setEditingPlugin(null);
        }}
        onSave={() => {
          setShowAddModal(false);
          setEditingPlugin(null);
        }}
        editingPlugin={editingPlugin}
        createPlugin={createPlugin}
        updatePlugin={updatePlugin}
      />
    </div>
  );
}

// Plugin Modal Component
interface PluginModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editingPlugin: NotificationPlugin | null;
  createPlugin: ReturnType<typeof useCreateNotificationPlugin>;
  updatePlugin: ReturnType<typeof useUpdateNotificationPlugin>;
}

function PluginModal({
  open,
  onClose,
  onSave,
  editingPlugin,
  createPlugin,
  updatePlugin,
}: PluginModalProps) {
  const [name, setName] = useState("");
  const [pluginType, setPluginType] = useState("feishu");
  const [config, setConfig] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingPlugin) {
      setName(editingPlugin.name);
      setPluginType(editingPlugin.plugin_type);
      setConfig(editingPlugin.config);
    } else {
      setName("");
      setPluginType("feishu");
      setConfig("");
    }
  }, [editingPlugin, open]);

  const handleSubmit = async () => {
    if (!name.trim() || !config.trim()) {
      alert("请填写所有必填字段");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPlugin) {
        await updatePlugin.mutateAsync({
          id: editingPlugin.id,
          name,
          enabled: editingPlugin.enabled,
          config,
        });
      } else {
        await createPlugin.mutateAsync({
          name,
          plugin_type: pluginType,
          config,
        });
      }
      onSave();
    } catch (error) {
      console.error("Failed to save plugin:", error);
      alert("保存失败: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingPlugin ? "编辑通知渠道" : "添加通知渠道"}
    >
      <div className="space-y-4">
        {!editingPlugin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                渠道类型
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(PLUGIN_TYPE_LABELS).map(
                  ([type, { icon, label }]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPluginType(type)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        pluginType === type
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 hover:border-teal-200"
                      }`}
                    >
                      <div className="text-xl mb-1">{icon}</div>
                      <div className="text-xs font-medium">{label}</div>
                    </button>
                  ),
                )}
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            渠道名称
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入渠道名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            配置{" "}
            {pluginType === "feishu" && "(Webhook URL 或 App ID + App Secret)"}
            {pluginType === "dingtalk" &&
              "(Webhook URL 或 Access Token + Secret)"}
            {pluginType === "email" && "(SMTP 配置 JSON)"}
            {pluginType === "webhook" && "(URL)"}
          </label>
          <textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            placeholder='{"webhook_url": "https://..."}'
            className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
