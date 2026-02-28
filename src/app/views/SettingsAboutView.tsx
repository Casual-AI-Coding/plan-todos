"use client";

import { Card, Button } from "@/components/ui";
import packageJson from "../../../package.json";

export function SettingsAboutView() {
  const handleCheckUpdate = () => {
    // TODO: Implement update check
    alert("检查更新功能开发中");
  };

  const techStack = [
    { icon: "⚡", name: "Tauri", desc: "Rust 桌面框架" },
    { icon: "⚛️", name: "Next.js", desc: "React 全栈框架" },
    { icon: "🗄️", name: "SQLite", desc: "本地数据库" },
    { icon: "📘", name: "TypeScript", desc: "类型安全" },
    { icon: "🗂️", name: "Zustand", desc: "状态管理" },
    { icon: "🎯", name: "dnd-kit", desc: "拖拽交互" },
    { icon: "✨", name: "Framer Motion", desc: "动画效果" },
    { icon: "🔄", name: "TanStack Query", desc: "数据获取" },
    { icon: "🕐", name: "date-fns", desc: "日期处理" },
    { icon: "🎨", name: "Tailwind CSS", desc: "样式框架" },
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
        </Card>

        {/* Tech Stack */}
        <Card>
          <h3
            className="font-medium mb-3"
            style={{ color: "var(--color-text)" }}
          >
            技术栈
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {techStack.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-lg">{item.icon}</span>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Other */}
      <Card>
        <h3 className="font-medium mb-3" style={{ color: "var(--color-text)" }}>
          其他
        </h3>
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleCheckUpdate}
        >
          检查更新
        </Button>
      </Card>
    </div>
  );
}
