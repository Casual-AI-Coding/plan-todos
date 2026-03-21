"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme, ThemeId } from "@/hooks/useTheme";
import {
  lightThemes,
  darkThemes,
  styleThemes,
  systemThemeDisplay,
  Theme,
} from "@/lib/themes/registry";
import { useGlassSettings } from "@/hooks/useGlassSettings";
import { Modal, Button } from "@/components/ui";

type ThemeTab = "default" | "light" | "dark" | "style" | "customized";

// Default themes: system, light, dark
const defaultThemes = [
  systemThemeDisplay,
  lightThemes[0],
  darkThemes[0],
].filter(Boolean);

// Custom theme colors interface
interface CustomThemeColors {
  primary: string;
  secondary: string;
  bg: string;
  bgCard: string;
  text: string;
  textMuted: string;
}

const CUSTOM_THEME_KEY = "plan-todos-custom-theme-colors";

// Default custom theme colors
const defaultCustomColors: CustomThemeColors = {
  primary: "#14B8A6",
  secondary: "#2DD4BF",
  bg: "#0F172A",
  bgCard: "#1E293B",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
};

// Load custom colors from localStorage
function loadCustomColors(): CustomThemeColors {
  if (typeof window === "undefined") return defaultCustomColors;
  const stored = localStorage.getItem(CUSTOM_THEME_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultCustomColors;
    }
  }
  return defaultCustomColors;
}

// Save custom colors to localStorage
function saveCustomColors(colors: CustomThemeColors): void {
  localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(colors));
}

// Apply custom colors to CSS variables
function applyCustomColors(colors: CustomThemeColors): void {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", colors.primary);
  root.style.setProperty("--color-secondary", colors.secondary);
  root.style.setProperty("--color-bg", colors.bg);
  root.style.setProperty("--color-bg-card", colors.bgCard);
  root.style.setProperty("--color-text", colors.text);
  root.style.setProperty("--color-text-muted", colors.textMuted);
}

function GlassSettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { glassBlur, glassOpacity, setGlassBlur, setGlassOpacity } =
    useGlassSettings();

  const [tempBlurValue, setTempBlurValue] = useState(glassBlur);
  const [tempOpacityValue, setTempOpacityValue] = useState(glassOpacity);

  const handleConfirm = () => {
    setGlassBlur(tempBlurValue);
    setGlassOpacity(tempOpacityValue);
    onClose();
  };

  const handleCancel = () => {
    document.documentElement.style.setProperty(
      "--glass-blur",
      `${glassBlur}px`,
    );
    document.documentElement.style.setProperty(
      "--glass-opacity",
      `${glassOpacity / 100}`,
    );
    onClose();
  };

  const handleBlurChange = (value: number) => {
    setTempBlurValue(value);
    document.documentElement.style.setProperty("--glass-blur", `${value}px`);
  };

  const handleOpacityChange = (value: number) => {
    setTempOpacityValue(value);
    document.documentElement.style.setProperty(
      "--glass-opacity",
      `${value / 100}`,
    );
  };

  return (
    <Modal
      open={open}
      title="Theme Settings"
      onClose={handleCancel}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Blur Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <span
              className="font-medium"
              style={{ color: "var(--color-text)" }}
            >
              Blur
            </span>
            <span style={{ color: "var(--color-text-muted)" }}>
              {tempBlurValue}px
            </span>
          </div>
          <input
            type="range"
            id="blur-slider"
            min="5"
            max="30"
            value={tempBlurValue}
            onChange={(e) => handleBlurChange(parseInt(e.target.value, 10))}
            aria-label="模糊程度"
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: "var(--color-border)",
              accentColor: "var(--color-primary)",
            }}
          />
          <div
            className="flex justify-between text-xs mt-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span>5px</span>
            <span>30px</span>
          </div>
        </div>

        {/* Opacity Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <span
              className="font-medium"
              style={{ color: "var(--color-text)" }}
            >
              Opacity
            </span>
            <span style={{ color: "var(--color-text-muted)" }}>
              {tempOpacityValue}%
            </span>
          </div>
          <input
            type="range"
            id="opacity-slider"
            min="5"
            max="100"
            value={tempOpacityValue}
            onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
            aria-label="不透明度"
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: "var(--color-border)",
              accentColor: "var(--color-primary)",
            }}
          />
          <div
            className="flex justify-between text-xs mt-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span>5%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Preview Card */}
        <div>
          <span
            className="font-medium mb-2 block"
            style={{ color: "var(--color-text)" }}
          >
            Preview (预览)
          </span>
          <div
            className="p-4 rounded-lg"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, ${tempOpacityValue / 100}) 0%, rgba(255, 255, 255, ${(tempOpacityValue / 100) * 0.5}) 100%)`,
              backdropFilter: `blur(${tempBlurValue}px) saturate(180%)`,
              WebkitBackdropFilter: `blur(${tempBlurValue}px) saturate(180%)`,
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div className="font-semibold mb-1" style={{ color: "#fff" }}>
              Card Title
            </div>
            <div
              className="text-sm"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              This is a preview with blur: {tempBlurValue}px, opacity:{" "}
              {tempOpacityValue}%
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Color Picker Component
function ColorPicker({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 p-3 rounded-lg"
      style={{ background: "var(--color-bg-hover)" }}
    >
      <div className="flex-1">
        <div
          className="font-medium text-sm mb-0.5"
          style={{ color: "var(--color-text)" }}
        >
          {label}
        </div>
        {description && (
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border-2"
          style={{
            borderColor: value,
            background: value,
          }}
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1.5 text-xs font-mono rounded-lg border text-center"
          style={{
            background: "var(--color-bg)",
            color: "var(--color-text)",
            borderColor: "var(--color-border)",
          }}
        />
      </div>
    </div>
  );
}

// Theme Card Component
function ThemeCard({
  theme: t,
  isActive,
  onClick,
}: {
  theme: Theme;
  isActive: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        p-3 rounded-lg border-2 transition-all flex flex-col items-center
        select-none
        ${
          isActive
            ? "border-[var(--color-primary)]"
            : "border-transparent hover:border-[var(--color-primary)]/50"
        }
      `}
      style={{
        background: t.colors.bg,
      }}
    >
      <div
        className="w-10 h-10 rounded mb-2 flex items-center justify-center text-lg border-2"
        style={{
          background: t.colors.bgCard,
          borderColor: t.colors.primary,
          color: t.colors.text,
        }}
      >
        {t.icon}
      </div>
      <span
        className="text-xs font-medium truncate w-full text-center"
        style={{
          color: isActive ? "var(--color-primary)" : t.colors.text,
        }}
      >
        {t.name}
      </span>
    </button>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        flex items-center gap-1.5
        ${
          active
            ? "bg-[var(--color-primary)] text-white"
            : "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]"
        }
      `}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ThemeTab>("default");
  const [showGlassModal, setShowGlassModal] = useState(false);
  const [customColors, setCustomColors] = useState<CustomThemeColors>(() =>
    loadCustomColors(),
  );
  useGlassSettings();
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply custom colors when custom theme is active
  useEffect(() => {
    if (theme === "custom") {
      applyCustomColors(customColors);
    }
  }, [theme, customColors]);

  const handleThemeClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    themeId: ThemeId,
  ) => {
    e.currentTarget.blur();

    if (themeId === theme) {
      setShowGlassModal(true);
    } else {
      setTheme(themeId);
    }
  };

  const handleCustomColorChange = (
    key: keyof CustomThemeColors,
    value: string,
  ) => {
    setCustomColors((prev) => {
      const newColors = { ...prev, [key]: value };
      saveCustomColors(newColors);
      if (theme === "custom") {
        applyCustomColors(newColors);
      }
      return newColors;
    });
  };

  const handleSaveCustomTheme = () => {
    saveCustomColors(customColors);
    setTheme("custom");
    applyCustomColors(customColors);
  };

  const handleResetCustomTheme = () => {
    setCustomColors(defaultCustomColors);
    saveCustomColors(defaultCustomColors);
    if (theme === "custom") {
      applyCustomColors(defaultCustomColors);
    }
  };

  // Get themes based on active tab
  const getThemes = (): Theme[] => {
    switch (activeTab) {
      case "default":
        return defaultThemes;
      case "light":
        return lightThemes;
      case "dark":
        return darkThemes;
      case "style":
        return styleThemes;
      case "customized":
        return []; // Custom theme uses color pickers, not cards
      default:
        return defaultThemes;
    }
  };

  const displayedThemes = getThemes();

  return (
    <div data-theme-selector ref={containerRef} className="space-y-4">
      {/* Tabs */}
      <div
        className="flex flex-wrap gap-1.5 p-2 rounded-xl mb-6 border"
        style={{
          backgroundColor: "var(--color-bg-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <TabButton
          active={activeTab === "default"}
          onClick={() => setActiveTab("default")}
          icon="✨"
        >
          Default
        </TabButton>
        <TabButton
          active={activeTab === "light"}
          onClick={() => setActiveTab("light")}
          icon="☀️"
        >
          Light
        </TabButton>
        <TabButton
          active={activeTab === "dark"}
          onClick={() => setActiveTab("dark")}
          icon="🌙"
        >
          Dark
        </TabButton>
        <TabButton
          active={activeTab === "style"}
          onClick={() => setActiveTab("style")}
          icon="🎨"
        >
          Style
        </TabButton>
        <TabButton
          active={activeTab === "customized"}
          onClick={() => setActiveTab("customized")}
          icon="🖌️"
        >
          Customized
        </TabButton>
      </div>

      {/* Theme Grid or Custom Editor */}
      {activeTab === "customized" ? (
        <div className="space-y-5">
          {/* Header */}
          <div className="text-center">
            <h3
              className="text-lg font-semibold mb-1"
              style={{ color: "var(--color-text)" }}
            >
              🎨 自定义主题
            </h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              调整颜色打造属于你的独特风格
            </p>
          </div>

          {/* Two Column Layout: Color Config | Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Color Pickers */}
            <div
              className="p-5 rounded-2xl border space-y-3"
              style={{
                background: "var(--color-bg-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🎯</span>
                <h4
                  className="font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  颜色配置
                </h4>
              </div>

              <div className="grid gap-2">
                <ColorPicker
                  label="主色调"
                  description="按钮、链接、强调色"
                  value={customColors.primary}
                  onChange={(v) => handleCustomColorChange("primary", v)}
                />
                <ColorPicker
                  label="次色调"
                  description="辅助按钮、标签"
                  value={customColors.secondary}
                  onChange={(v) => handleCustomColorChange("secondary", v)}
                />
                <ColorPicker
                  label="背景色"
                  description="页面背景"
                  value={customColors.bg}
                  onChange={(v) => handleCustomColorChange("bg", v)}
                />
                <ColorPicker
                  label="卡片背景"
                  description="卡片、浮层背景"
                  value={customColors.bgCard}
                  onChange={(v) => handleCustomColorChange("bgCard", v)}
                />
                <ColorPicker
                  label="文字颜色"
                  description="主要文字"
                  value={customColors.text}
                  onChange={(v) => handleCustomColorChange("text", v)}
                />
                <ColorPicker
                  label="次要文字"
                  description="提示、禁用状态"
                  value={customColors.textMuted}
                  onChange={(v) => handleCustomColorChange("textMuted", v)}
                />
              </div>
            </div>

            {/* Right: Live Preview */}
            <div
              className="rounded-2xl border-2 overflow-hidden"
              style={{
                background: customColors.bg,
                borderColor: customColors.primary,
              }}
            >
              {/* Preview Header */}
              <div
                className="px-5 py-4 border-b"
                style={{
                  background: customColors.bgCard,
                  borderColor: customColors.primary + "40",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{
                        background: customColors.primary,
                        color: "#fff",
                      }}
                    >
                      ✨
                    </div>
                    <div>
                      <div
                        className="font-semibold"
                        style={{ color: customColors.text }}
                      >
                        自定义主题
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: customColors.textMuted }}
                      >
                        实时预览效果
                      </div>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: customColors.primary + "20",
                      color: customColors.primary,
                    }}
                  >
                    预览
                  </span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-5 space-y-4">
                {/* Sample Text */}
                <p style={{ color: customColors.text }}>
                  这是一段示例文字，展示你的主题配色效果。
                </p>

                {/* Sample Buttons */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background: customColors.primary,
                      color: "#fff",
                    }}
                  >
                    主按钮
                  </span>
                  <span
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background: customColors.secondary,
                      color: "#fff",
                    }}
                  >
                    次按钮
                  </span>
                  <span
                    className="px-4 py-2 rounded-lg text-sm border"
                    style={{
                      background: customColors.bgCard,
                      color: customColors.text,
                      borderColor: customColors.primary + "40",
                    }}
                  >
                    边框按钮
                  </span>
                </div>

                {/* Sample Card */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: customColors.bgCard,
                    border: `1px solid ${customColors.primary}30`,
                  }}
                >
                  <div
                    className="font-medium mb-1"
                    style={{ color: customColors.text }}
                  >
                    卡片标题
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: customColors.textMuted }}
                  >
                    卡片内容的次要文字颜色效果展示
                  </div>
                </div>

                {/* Sample List Item */}
                <div
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{
                    background: customColors.bgCard,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{
                      background: customColors.primary + "20",
                      color: customColors.primary,
                    }}
                  >
                    ✓
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-sm font-medium"
                      style={{ color: customColors.text }}
                    >
                      列表项标题
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: customColors.textMuted }}
                    >
                      列表项描述文字
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      background: customColors.secondary + "20",
                      color: customColors.secondary,
                    }}
                  >
                    标签
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleResetCustomTheme}
              className="flex-1 py-3"
            >
              <span className="mr-2">↺</span>
              重置
            </Button>
            <Button
              onClick={handleSaveCustomTheme}
              className="flex-1 py-3"
              style={{
                background:
                  theme === "custom" ? "var(--color-primary)" : undefined,
              }}
            >
              <span className="mr-2">{theme === "custom" ? "✓" : "✨"}</span>
              {theme === "custom" ? "已应用" : "应用主题"}
            </Button>
          </div>

          {/* Current Status */}
          {theme === "custom" && (
            <div
              className="p-4 rounded-xl text-sm text-center flex items-center justify-center gap-2"
              style={{
                background: "var(--color-primary) + 10",
                color: "var(--color-primary)",
              }}
            >
              <span>✓</span>
              <span>自定义主题已启用</span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {displayedThemes.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              isActive={theme === t.id}
              onClick={(e) => handleThemeClick(e, t.id)}
            />
          ))}
        </div>
      )}

      {/* Glass Theme Settings Modal */}
      <GlassSettingsModal
        key={showGlassModal ? "modal-open" : "modal-closed"}
        open={showGlassModal}
        onClose={() => setShowGlassModal(false)}
      />
    </div>
  );
}
