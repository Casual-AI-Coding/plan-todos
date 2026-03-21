"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { checkForUpdates, type UpdateInfo } from "@/lib/api/update";
import packageJson from "../../../package.json";

export function SettingsAboutView() {
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const toast = useToast();

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const info = await checkForUpdates();
      setUpdateInfo(info);
      if (info?.has_update) {
        toast.info(`发现新版本 ${info.latest_version}`);
      } else {
        toast.success("当前已是最新版本");
      }
    } catch {
      toast.error("检查更新失败");
    } finally {
      setChecking(false);
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
