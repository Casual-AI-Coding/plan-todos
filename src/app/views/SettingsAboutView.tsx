"use client";

import { useEffect } from "react";
import { Card, Button } from "@/components/ui";
import { useAutoUpdate } from "@/hooks/useAutoUpdate";
import { useToast } from "@/components/ui/Toast";
import packageJson from "../../../package.json";

export function SettingsAboutView() {
  const { checking, updateInfo, error, checkUpdate, handleSkip } =
    useAutoUpdate();
  const toast = useToast();

  // Listen for update available event and show toast
  useEffect(() => {
    const handleUpdateAvailable = (e: CustomEvent) => {
      const info = e.detail;
      if (info?.has_update) {
        toast.info(`发现新版本 ${info.latest_version}，请前往设置 > 关于下载`);
      }
    };

    window.addEventListener(
      "app:update-available",
      handleUpdateAvailable as EventListener,
    );
    return () => {
      window.removeEventListener(
        "app:update-available",
        handleUpdateAvailable as EventListener,
      );
    };
  }, [toast]);

  const handleManualCheck = async () => {
    await checkUpdate(false);
    if (updateInfo?.has_update) {
      toast.info(`发现新版本 ${updateInfo.latest_version}`);
    } else if (!error) {
      toast.success("当前已是最新版本");
    }
  };

  const handleDownload = () => {
    if (updateInfo?.release_url) {
      window.open(updateInfo.release_url, "_blank");
    }
  };

  const techStack = [
    { icon: "📘", name: "TypeScript", desc: "类型安全" },
    { icon: "⚡", name: "Tauri", desc: "Rust 桌面框架" },
    { icon: "⚛️", name: "Next.js", desc: "React 全栈框架" },
    { icon: "🗄️", name: "SQLite", desc: "本地数据库" },
    { icon: "🎨", name: "Tailwind CSS", desc: "样式框架" },
    { icon: "🎯", name: "dnd-kit", desc: "拖拽交互" },
    { icon: "✨", name: "Framer Motion", desc: "动画效果" },
    { icon: "🔄", name: "TanStack Query", desc: "数据获取" },
    { icon: "🕐", name: "date-fns", desc: "日期处理" },
  ];

  return (
    <div className="p-6">
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "var(--color-text)" }}
      >
        设置 &gt; 关于
      </h2>

      {/* Error Message */}
      {error && (
        <Card className="mb-6">
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: "var(--color-error-bg)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-error)" }}>
              {error}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={handleManualCheck}
            >
              重试
            </Button>
          </div>
        </Card>
      )}

      {/* Project Info & Tech Stack - 2 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Project Info */}
        <Card>
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📱</div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              Plan Todos
            </h3>
            <p className="text-base text-gray-600 mb-3">
              v{packageJson.version}
            </p>
            <p className="text-gray-500 text-sm">
              本地优先的跨平台任务管理应用
            </p>
          </div>
          <div className="space-y-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleManualCheck}
              loading={checking}
              disabled={checking}
            >
              {checking ? "检查中..." : "检查更新"}
            </Button>
            {updateInfo?.has_update && (
              <Button
                variant="primary"
                className="w-full"
                onClick={handleDownload}
              >
                下载新版本 {updateInfo.latest_version}
              </Button>
            )}
          </div>
        </Card>

        {/* Tech Stack */}
        <Card>
          <h3
            className="font-medium mb-3"
            style={{ color: "var(--color-text)" }}
          >
            技术栈
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {techStack.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg min-h-[80px]"
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <div className="text-center">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Links */}
      <Card>
        <h3 className="font-medium mb-3" style={{ color: "var(--color-text)" }}>
          链接
        </h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/oGsLP/plan-todos"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: "var(--color-bg-hover)",
              color: "var(--color-text)",
            }}
          >
            GitHub 仓库
          </a>
          <a
            href="https://github.com/oGsLP/plan-todos/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: "var(--color-bg-hover)",
              color: "var(--color-text)",
            }}
          >
            更新日志
          </a>
        </div>
      </Card>
    </div>
  );
}
