"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { ThemeSelector } from "@/components/features";
import { useFontSettings } from "@/hooks/useFontSettings";

export function SettingsGeneralView() {
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const {
    fontSize,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    minSize,
    maxSize,
    defaultSize,
  } = useFontSettings();

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
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              主题
            </label>
            <ThemeSelector />
          </div>

          {/* Font Size */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: "var(--color-text-muted)" }}
            >
              字体大小
            </label>
            <div
              className="p-4 rounded-xl border"
              style={{
                background: "var(--color-bg-hover)",
                borderColor: "var(--color-border)",
              }}
            >
              {/* Preview Text */}
              <div
                className="mb-4 p-3 rounded-lg text-center"
                style={{
                  background: "var(--color-bg-card)",
                  fontSize: `${fontSize}px`,
                  color: "var(--color-text)",
                }}
              >
                这是一段示例文字
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  小
                </span>
                <div className="flex-1">
                  <input
                    type="range"
                    min={minSize}
                    max={maxSize}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="w-full h-2 rounded-lg cursor-pointer"
                    style={{
                      background: "var(--color-border)",
                      accentColor: "var(--color-primary)",
                    }}
                  />
                </div>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  大
                </span>
              </div>

              {/* Current Size & Actions */}
              <div className="flex items-center justify-between mt-4">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-primary)" }}
                >
                  {fontSize}px
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={decreaseFontSize}
                    disabled={fontSize <= minSize}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{
                      background: "var(--color-bg-card)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    A-
                  </button>
                  <button
                    onClick={increaseFontSize}
                    disabled={fontSize >= maxSize}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{
                      background: "var(--color-bg-card)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    A+
                  </button>
                  {fontSize !== defaultSize && (
                    <button
                      onClick={resetFontSize}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        background: "var(--color-bg-card)",
                        color: "var(--color-text-muted)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      重置
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Language */}
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
