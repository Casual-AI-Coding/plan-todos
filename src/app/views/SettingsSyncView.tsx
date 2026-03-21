"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input, Modal, Checkbox } from "@/components/ui";
import {
  useSyncConfig,
  useSyncStatus,
  useSyncLogs,
  useSyncUsername,
  useHasSyncCredentials,
  useUpdateSyncConfig,
  useTestSyncConnection,
  useSaveSyncCredentials,
  useDeleteSyncCredentials,
  useTriggerSync,
  useConflicts,
  useResolveConflict,
  useDevices,
  useUnregisterDevice,
  // Scheduler hooks (Phase 6 - Wave 7)
  useSchedulerStatus,
  useStartScheduler,
  useStopScheduler,
  useSetSyncInterval,
  useResetCircuitBreaker,
} from "@/hooks/useSync";
import {
  useGoogleDriveStatus,
  useGoogleDriveAuthUrl,
  useGoogleDriveDisconnect,
  useGoogleDriveSync,
  useGoogleDriveBackups,
  useGoogleDriveRestore,
} from "@/hooks/useGoogleDrive";
import type { SyncConflict, DeviceInfo } from "@/lib/api/sync";
import type { DriveFile } from "@/lib/api/googleDrive";

export function SettingsSyncView() {
  // Data hooks
  const { data: config, isLoading: configLoading } = useSyncConfig();
  const { data: status } = useSyncStatus();
  const { data: logs } = useSyncLogs({ limit: 10 });
  const { data: username } = useSyncUsername();
  const { data: hasCredentials } = useHasSyncCredentials();
  const { data: conflicts } = useConflicts();
  const { data: devices } = useDevices();

  // Scheduler hooks (Phase 6 - Wave 7)
  const { data: schedulerStatus } = useSchedulerStatus();
  const startScheduler = useStartScheduler();
  const stopScheduler = useStopScheduler();
  const setSyncIntervalMutation = useSetSyncInterval();
  const resetCircuitBreaker = useResetCircuitBreaker();

  // Mutation hooks
  const updateConfig = useUpdateSyncConfig();
  const testConnection = useTestSyncConnection();
  const saveCredentials = useSaveSyncCredentials();
  const deleteCredentials = useDeleteSyncCredentials();
  const triggerSync = useTriggerSync();
  const resolveConflict = useResolveConflict();
  const unregisterDevice = useUnregisterDevice();

  // Google Drive hooks
  const { data: driveStatus } = useGoogleDriveStatus();
  const { data: backups } = useGoogleDriveBackups();
  const getAuthUrl = useGoogleDriveAuthUrl();
  const disconnectDrive = useGoogleDriveDisconnect();
  const syncToDrive = useGoogleDriveSync();
  const restoreFromDrive = useGoogleDriveRestore();

  // Form state
  const [serverUrl, setServerUrl] = useState("");
  const [remotePath, setRemotePath] = useState("/plan-todos-sync");
  const [formUsername, setFormUsername] = useState("");
  const [password, setPassword] = useState("");
  const [syncInterval, setSyncInterval] = useState(30);
  const [conflictStrategy, setConflictStrategy] = useState("timestamp");

  // UI state
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(
    null,
  );
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync form state with config when loaded
  useEffect(() => {
    if (config) {
      setServerUrl(config.server_url || "");
      setRemotePath(config.remote_path);
      setFormUsername(config.username || "");
      setSyncInterval(config.sync_interval_minutes);
      setConflictStrategy(config.conflict_strategy);
    }
  }, [config]);

  const handleTestConnection = async () => {
    if (!serverUrl || !formUsername || !password) {
      setMessage({ type: "error", text: "请填写服务器地址、用户名和密码" });
      return;
    }

    setIsTesting(true);
    setMessage(null);

    try {
      const result = await testConnection.mutateAsync({
        serverUrl,
        username: formUsername,
        password,
      });

      if (result) {
        setMessage({ type: "success", text: "连接测试成功！" });
      } else {
        setMessage({ type: "error", text: "连接测试失败，请检查配置" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "连接失败: " + (error as Error).message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!formUsername || !password) {
      setMessage({ type: "error", text: "请填写用户名和密码" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await saveCredentials.mutateAsync({
        username: formUsername,
        password,
      });

      // Also update config
      await updateConfig.mutateAsync({
        server_url: serverUrl,
        remote_path: remotePath,
        sync_interval_minutes: syncInterval,
        conflict_strategy: conflictStrategy,
        enabled: true,
      });

      setMessage({ type: "success", text: "凭据保存成功！" });
      setShowCredentialModal(false);
      setPassword(""); // Clear password for security
    } catch (error) {
      setMessage({
        type: "error",
        text: "保存失败: " + (error as Error).message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableSync = async (enabled: boolean) => {
    try {
      await updateConfig.mutateAsync({ enabled });
      setMessage({
        type: "success",
        text: enabled ? "同步已启用" : "同步已禁用",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "操作失败: " + (error as Error).message,
      });
    }
  };

  const handleTriggerSync = async () => {
    try {
      await triggerSync.mutateAsync();
      setMessage({ type: "success", text: "同步已触发" });
    } catch (error) {
      setMessage({
        type: "error",
        text: "同步失败: " + (error as Error).message,
      });
    }
  };

  const handleDeleteCredentials = async () => {
    try {
      await deleteCredentials.mutateAsync();
      await updateConfig.mutateAsync({ enabled: false });
      setMessage({ type: "success", text: "凭据已删除" });
    } catch (error) {
      setMessage({
        type: "error",
        text: "删除失败: " + (error as Error).message,
      });
    }
  };

  const handleResolveConflict = async (
    conflictId: number,
    resolution: "local" | "remote",
  ) => {
    try {
      await resolveConflict.mutateAsync({ conflictId, resolution });
      setMessage({ type: "success", text: "冲突已解决" });
      setShowConflictModal(false);
      setSelectedConflict(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: "解决冲突失败: " + (error as Error).message,
      });
    }
  };

  const handleUnregisterDevice = async (deviceId: string) => {
    try {
      await unregisterDevice.mutateAsync(deviceId);
      setMessage({ type: "success", text: "设备已注销" });
    } catch (error) {
      setMessage({
        type: "error",
        text: "注销设备失败: " + (error as Error).message,
      });
    }
  };

  if (configLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "var(--color-text)" }}
      >
        设置 &gt; 云同步
      </h2>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        </div>
      )}

      {/* Sync Status */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          同步状态
        </h3>

        <div className="space-y-3">
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: "var(--color-bg-hover)" }}
          >
            <div>
              <div
                className="font-medium"
                style={{ color: "var(--color-text)" }}
              >
                云同步
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                {hasCredentials ? "已配置凭据" : "未配置凭据"}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={status?.enabled ?? false}
                onChange={(e) => handleEnableSync(e.target.checked)}
                disabled={!hasCredentials}
              />
              <div
                className="w-11 h-6 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                style={{
                  backgroundColor: status?.enabled
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                }}
              ></div>
            </label>
          </div>

          {status && (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-bg-hover)" }}
                >
                  <div style={{ color: "var(--color-text-muted)" }}>
                    上次同步
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {status.last_sync_at
                      ? new Date(status.last_sync_at).toLocaleString("zh-CN")
                      : "从未同步"}
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-bg-hover)" }}
                >
                  <div style={{ color: "var(--color-text-muted)" }}>
                    同步状态
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {status.last_sync_status || "未知"}
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-bg-hover)" }}
                >
                  <div style={{ color: "var(--color-text-muted)" }}>
                    待同步更改
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {status.pending_changes}
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-bg-hover)" }}
                >
                  <div style={{ color: "var(--color-text-muted)" }}>
                    冲突数量
                  </div>
                  <div
                    className="font-medium"
                    style={{
                      color:
                        status.conflicts_count > 0
                          ? "#EF4444"
                          : "var(--color-text)",
                    }}
                  >
                    {status.conflicts_count}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTriggerSync}
                  disabled={!status.enabled || status.is_syncing}
                  variant="primary"
                >
                  {status.is_syncing ? "同步中..." : "立即同步"}
                </Button>
                {status.conflicts_count > 0 && (
                  <Button
                    onClick={() => setShowConflictModal(true)}
                    variant="secondary"
                  >
                    解决冲突 ({status.conflicts_count})
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Google Drive Sync */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          Google Drive 同步
        </h3>

        <div className="space-y-3">
          {driveStatus?.connected ? (
            <>
              {/* Connected status */}
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: "var(--color-bg-hover)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className="font-medium"
                      style={{ color: "var(--color-text)" }}
                    >
                      已连接到 Google Drive
                    </div>
                    {driveStatus.email && (
                      <div
                        className="text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {driveStatus.email}
                      </div>
                    )}
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: "#D1FAE5",
                      color: "#065F46",
                    }}
                  >
                    已连接
                  </span>
                </div>
              </div>

              {/* Sync actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => syncToDrive.mutate()}
                  disabled={syncToDrive.isPending}
                  variant="primary"
                >
                  {syncToDrive.isPending ? "同步中..." : "立即同步"}
                </Button>
                <Button
                  onClick={() => disconnectDrive.mutate()}
                  disabled={disconnectDrive.isPending}
                  variant="danger"
                >
                  断开连接
                </Button>
              </div>

              {/* Backup files list */}
              {backups && backups.length > 0 && (
                <div className="mt-4">
                  <h4
                    className="text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    备份文件 ({backups.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {backups.map((file: DriveFile) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 rounded"
                        style={{ backgroundColor: "var(--color-bg-hover)" }}
                      >
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-sm font-medium truncate"
                            style={{ color: "var(--color-text)" }}
                          >
                            {file.name}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {new Date(file.modified_at).toLocaleString("zh-CN")}
                            {file.size &&
                              ` · ${(file.size / 1024).toFixed(1)} KB`}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => restoreFromDrive.mutate(file.id)}
                          disabled={restoreFromDrive.isPending}
                        >
                          恢复
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Not connected */}
              <div
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: "var(--color-bg-hover)" }}
              >
                <div
                  className="mb-3"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  连接到 Google Drive 以备份和同步您的数据
                </div>
                <Button
                  onClick={async () => {
                    try {
                      const url = await getAuthUrl.mutateAsync();
                      // Open URL in browser
                      window.open(url, "_blank");
                    } catch (error) {
                      setMessage({
                        type: "error",
                        text: "获取授权 URL 失败",
                      });
                    }
                  }}
                  disabled={getAuthUrl.isPending}
                  variant="primary"
                >
                  {getAuthUrl.isPending ? "获取中..." : "连接 Google Drive"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Background Scheduler Controls (Phase 6 - Wave 7) */}
      {hasCredentials && schedulerStatus && (
        <Card className="mb-6">
          <h3
            className="font-medium mb-4"
            style={{ color: "var(--color-text)" }}
          >
            后台同步调度器
          </h3>

          <div className="space-y-3">
            {/* Scheduler toggle */}
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-bg-hover)" }}
            >
              <div>
                <div
                  className="font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  自动同步
                </div>
                <div
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {schedulerStatus.is_running
                    ? `每 ${schedulerStatus.interval_minutes} 分钟自动同步`
                    : "已暂停自动同步"}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={schedulerStatus.is_running}
                  onChange={(e) => {
                    if (e.target.checked) {
                      startScheduler.mutate();
                    } else {
                      stopScheduler.mutate();
                    }
                  }}
                />
                <div
                  className="w-11 h-6 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                  style={{
                    backgroundColor: schedulerStatus.is_running
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                  }}
                ></div>
              </label>
            </div>

            {/* Interval selector */}
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-bg-hover)" }}
            >
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                同步间隔
              </label>
              <select
                value={schedulerStatus.interval_minutes}
                onChange={(e) =>
                  setSyncIntervalMutation.mutate(Number(e.target.value))
                }
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                <option value={1}>1 分钟</option>
                <option value={5}>5 分钟</option>
                <option value={15}>15 分钟</option>
                <option value={30}>30 分钟</option>
                <option value={60}>1 小时</option>
                <option value={120}>2 小时</option>
              </select>
            </div>

            {/* Circuit breaker status */}
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-bg-hover)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ color: "var(--color-text-muted)" }}>
                  断路器状态
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: schedulerStatus.circuit_breaker_closed
                      ? "#D1FAE5"
                      : "#FEE2E2",
                    color: schedulerStatus.circuit_breaker_closed
                      ? "#065F46"
                      : "#991B1B",
                  }}
                >
                  {schedulerStatus.circuit_breaker_closed ? "正常" : "已断开"}
                </span>
              </div>
              {!schedulerStatus.circuit_breaker_closed && (
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#991B1B" }}>
                    连续失败次数: {schedulerStatus.failure_count}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => resetCircuitBreaker.mutate()}
                  >
                    重置断路器
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* WebDAV Configuration */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          WebDAV 配置
        </h3>

        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              服务器地址
            </label>
            <Input
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://example.com/webdav"
              className="w-full"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              远程路径
            </label>
            <Input
              value={remotePath}
              onChange={(e) => setRemotePath(e.target.value)}
              placeholder="/plan-todos-sync"
              className="w-full"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              用户名
            </label>
            <div className="flex gap-2">
              <Input
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="输入用户名"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              密码
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hasCredentials ? "••••••••" : "输入密码"}
                className="flex-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                同步间隔（分钟）
              </label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                <option value={5}>5 分钟</option>
                <option value={15}>15 分钟</option>
                <option value={30}>30 分钟</option>
                <option value={60}>1 小时</option>
                <option value={120}>2 小时</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                冲突策略
              </label>
              <select
                value={conflictStrategy}
                onChange={(e) => setConflictStrategy(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                <option value="timestamp">时间戳优先</option>
                <option value="local-wins">本地优先</option>
                <option value="remote-wins">远程优先</option>
                <option value="manual-merge">手动合并</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={isTesting}
              variant="secondary"
            >
              {isTesting ? "测试中..." : "测试连接"}
            </Button>
            <Button
              onClick={handleSaveCredentials}
              disabled={isSaving}
              variant="primary"
            >
              {isSaving ? "保存中..." : "保存配置"}
            </Button>
            {hasCredentials && (
              <Button onClick={handleDeleteCredentials} variant="danger">
                删除凭据
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Sync Logs */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          同步日志
        </h3>

        {logs && logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg flex justify-between items-center"
                style={{ backgroundColor: "var(--color-bg-hover)" }}
              >
                <div>
                  <div
                    className="font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {log.status === "completed"
                      ? "同步完成"
                      : log.status === "failed"
                        ? "同步失败"
                        : "同步中"}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {new Date(log.started_at).toLocaleString("zh-CN")}
                    {log.duration_ms && ` · ${log.duration_ms}ms`}
                  </div>
                </div>
                <div
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ↑ {log.entities_uploaded} · ↓ {log.entities_downloaded}
                  {log.conflicts_count > 0 && (
                    <span className="ml-2" style={{ color: "#EF4444" }}>
                      ⚠ {log.conflicts_count} 冲突
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-8"
            style={{ color: "var(--color-text-muted)" }}
          >
            暂无同步日志
          </div>
        )}
      </Card>

      {/* Devices */}
      {devices && devices.length > 0 && (
        <Card className="mb-6">
          <h3
            className="font-medium mb-4"
            style={{ color: "var(--color-text)" }}
          >
            已同步设备
          </h3>

          <div className="space-y-2">
            {devices.map((device) => (
              <DeviceItem
                key={device.device_id}
                device={device}
                onUnregister={handleUnregisterDevice}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Conflict Resolution Modal */}
      <Modal
        open={showConflictModal}
        title="解决冲突"
        onClose={() => {
          setShowConflictModal(false);
          setSelectedConflict(null);
        }}
        width="md"
        footer={
          selectedConflict ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowConflictModal(false)}
              >
                取消
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  handleResolveConflict(selectedConflict.id, "local")
                }
              >
                使用本地版本
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  handleResolveConflict(selectedConflict.id, "remote")
                }
              >
                使用远程版本
              </Button>
            </>
          ) : null
        }
      >
        {conflicts && conflicts.length > 0 ? (
          <div className="space-y-3">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="p-3 rounded-lg cursor-pointer hover:opacity-80"
                style={{ backgroundColor: "var(--color-bg-hover)" }}
                onClick={() => setSelectedConflict(conflict)}
              >
                <div
                  className="font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {conflict.entity_type} - {conflict.entity_id}
                </div>
                <div
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  本地修改:{" "}
                  {new Date(conflict.local_modified_at).toLocaleString("zh-CN")}
                  {conflict.remote_modified_at && (
                    <>
                      {" "}
                      · 远程修改:{" "}
                      {new Date(conflict.remote_modified_at).toLocaleString(
                        "zh-CN",
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-8"
            style={{ color: "var(--color-text-muted)" }}
          >
            暂无冲突
          </div>
        )}
      </Modal>
    </div>
  );
}

// Device Item Component
function DeviceItem({
  device,
  onUnregister,
}: {
  device: DeviceInfo;
  onUnregister: (deviceId: string) => void;
}) {
  return (
    <div
      className="p-3 rounded-lg flex justify-between items-center"
      style={{ backgroundColor: "var(--color-bg-hover)" }}
    >
      <div>
        <div className="font-medium" style={{ color: "var(--color-text)" }}>
          {device.device_name}
          {device.is_current_device && (
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
              }}
            >
              当前设备
            </span>
          )}
        </div>
        <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          最后活跃: {new Date(device.last_seen_at).toLocaleString("zh-CN")}
        </div>
      </div>
      {!device.is_current_device && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onUnregister(device.device_id)}
        >
          注销
        </Button>
      )}
    </div>
  );
}
