"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { ThemeSelector, DataBackupSettings } from "@/components/features";
import { useFontSettings } from "@/hooks/useFontSettings";
import { exportData, importData, type ExportData, type ImportResult } from "@/lib/api";
import {
  useHotkeyStore,
  DEFAULT_HOTKEYS,
  configToString,
  type HotkeyConfig,
} from "@/lib/useHotkeyStore";
import { useToast } from "@/components/ui/Toast";

// Category definitions with icons
const HOTKEY_CATEGORIES = {
  navigation: {
    title: "导航",
    icon: (
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
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"
        />
      </svg>
    ),
    actions: [
      "view-dashboard",
      "view-todos",
      "view-plans",
      "view-targets",
      "view-circulations",
      "view-statistics",
    ],
  },
  actions: {
    title: "操作",
    icon: (
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
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    actions: ["new-todo", "search", "confirm", "delete", "select-all"],
  },
  system: {
    title: "系统",
    icon: (
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
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    actions: ["settings", "escape"],
  },
};

// Keyboard key component with 3D styling
interface KeyboardKeyProps {
  children: React.ReactNode;
  isEditing?: boolean;
  onClick?: () => void;
}

function KeyboardKey({ children, isEditing, onClick }: KeyboardKeyProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center
        px-3 py-1.5 min-w-[48px]
        font-mono text-sm font-semibold
        rounded-lg
        transition-all duration-150 ease-out
        ${isEditing ? "scale-105" : "hover:scale-105 active:scale-95"}
      `}
      style={{
        background: isEditing
          ? "var(--color-bg-card)"
          : "linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg-hover) 100%)",
        color: "var(--color-text)",
        border: `1px solid var(--color-border)`,
        borderBottom: isEditing
          ? "1px solid var(--color-primary)"
          : "3px solid var(--color-border)",
        boxShadow: isEditing
          ? "0 0 0 2px var(--color-primary), var(--shadow-sm)"
          : "0 2px 0 var(--color-border), var(--shadow-sm)",
        textShadow: "0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      {children}
    </button>
  );
}

// Shortcut row component
interface ShortcutRowProps {
  action: string;
  description: string;
  config: HotkeyConfig;
  isEditing: boolean;
  onEdit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function ShortcutRow({
  action,
  description,
  config,
  isEditing,
  onEdit,
  onKeyDown,
}: ShortcutRowProps) {
  return (
    <div
      className="group flex items-center justify-between p-3 rounded-xl transition-all duration-200"
      style={{
        background: "var(--color-bg-hover)",
        border: "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.background = "var(--color-bg-card)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.background = "var(--color-bg-hover)";
      }}
    >
      <span
        className="text-sm font-medium transition-colors"
        style={{ color: "var(--color-text)" }}
      >
        {description}
      </span>

      {isEditing ? (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm animate-pulse"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-primary)",
            color: "var(--color-primary)",
          }}
          onKeyDown={onKeyDown}
          tabIndex={0}
          autoFocus
        >
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          按下新的快捷键...
        </div>
      ) : (
        <KeyboardKey onClick={onEdit}>{configToString(config)}</KeyboardKey>
      )}
    </div>
  );
}

// Category section component
interface CategorySectionProps {
  category: typeof HOTKEY_CATEGORIES.navigation;
  getConfig: (action: string) => HotkeyConfig;
  editingAction: string | null;
  setEditingAction: (action: string | null) => void;
  handleKeyDown: (e: React.KeyboardEvent, action: string) => void;
}

function CategorySection({
  category,
  getConfig,
  editingAction,
  setEditingAction,
  handleKeyDown,
}: CategorySectionProps) {
  return (
    <div className="space-y-3">
      {/* Category Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <span style={{ color: "var(--color-primary)" }}>{category.icon}</span>
        <h4
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-text)" }}
        >
          {category.title}
        </h4>
        <div
          className="flex-1 h-px ml-2"
          style={{ background: "var(--color-border)" }}
        />
      </div>

      {/* Shortcut Items */}
      <div className="space-y-2 pl-2">
        {category.actions.map((action) => {
          const def = DEFAULT_HOTKEYS[action];
          if (!def) return null;

          const config = getConfig(action);
          const isEditing = editingAction === action;

          return (
            <ShortcutRow
              key={action}
              action={action}
              description={def.description}
              config={config}
              isEditing={isEditing}
              onEdit={() => setEditingAction(action)}
              onKeyDown={(e) => handleKeyDown(e, action)}
            />
          );
        })}
      </div>
    </div>
  );
}

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

  // Hotkey settings
  const toast = useToast();
  const getConfig = useHotkeyStore((s) => s.getConfig);
  const updateConfig = useHotkeyStore((s) => s.updateConfig);
  const resetAll = useHotkeyStore((s) => s.resetAll);
  const detectConflict = useHotkeyStore((s) => s.detectConflict);
  const [editingAction, setEditingAction] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();

    const config: HotkeyConfig = {
      key: e.key,
      ctrl: e.ctrlKey || e.metaKey,
      shift: e.shiftKey,
      alt: e.altKey,
    };

    const conflict = detectConflict(config, action);
    if (conflict) {
      toast.error(
        `快捷键冲突: ${configToString(config)} 已被 "${DEFAULT_HOTKEYS[conflict]?.description}" 使用`,
      );
      return;
    }

    updateConfig(action, config);
    setEditingAction(null);
    toast.success("快捷键已更新");
  };

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

      {/* Data Backup */}
      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
          数据备份
        </h3>
        <DataBackupSettings
          onExport={async () => {
            const data = await exportData();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `plan-todos-backup-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          onImport={async (file: File) => {
            const text = await file.text();
            const data = JSON.parse(text) as ExportData;
            const result = (await importData(data, "update")) as ImportResult;
            if (result.imported > 0) {
              setTimeout(() => window.location.reload(), 1500);
            }
          }}
        />
      </Card>

      {/* Hotkeys */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: "var(--color-bg-hover)",
                color: "var(--color-primary)",
              }}
            >
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <div>
              <h3
                className="font-medium"
                style={{ color: "var(--color-text)" }}
              >
                快捷键
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                点击快捷键进行自定义设置
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetAll();
              toast.success("已恢复默认快捷键");
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "var(--color-bg-hover)",
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-bg-card)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-bg-hover)";
              e.currentTarget.style.color = "var(--color-text-muted)";
            }}
          >
            恢复默认
          </button>
        </div>

        {/* Categorized Shortcuts */}
        <div className="space-y-6">
          {(
            Object.keys(HOTKEY_CATEGORIES) as Array<
              keyof typeof HOTKEY_CATEGORIES
            >
          ).map((categoryKey) => (
            <CategorySection
              key={categoryKey}
              category={HOTKEY_CATEGORIES[categoryKey]}
              getConfig={getConfig}
              editingAction={editingAction}
              setEditingAction={setEditingAction}
              handleKeyDown={handleKeyDown}
            />
          ))}
        </div>

        {/* Hint */}
        <div
          className="mt-6 p-3 rounded-lg text-xs flex items-start gap-2"
          style={{
            background: "var(--color-bg-hover)",
            color: "var(--color-text-muted)",
            border: "1px solid var(--color-border)",
          }}
        >
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            提示：点击任意快捷键按钮即可进入编辑模式，按下新的组合键即可修改。支持
            Ctrl、Shift、Alt 组合键。
          </span>
        </div>
      </Card>
    </div>
  );
}
