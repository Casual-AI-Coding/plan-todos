"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { ThemeSelector } from "@/components/features";

export function SettingsGeneralView() {
  const [language, setLanguage] = useState<"zh" | "en">("zh");

  return (
    <div className="p-6">
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "var(--color-text)" }}
      >
        设置 &gt; 通用
      </h2>

      {/* Appearance */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          外观
        </h3>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              主题
            </label>
            <ThemeSelector />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              语言
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}
