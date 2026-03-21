"use client";

import { useState, useRef } from "react";
import { useTheme, ThemeId } from "@/hooks/useTheme";
import {
  themeListWithSystem,
  lightThemes,
  darkThemes,
  systemThemeDisplay,
  Theme,
} from "@/lib/themes/registry";
import { useGlassSettings } from "@/hooks/useGlassSettings";
import { Modal, Button } from "@/components/ui";

type ThemeTab = "default" | "light" | "dark";

// Default themes: system, light, dark
const defaultThemes = [
  systemThemeDisplay,
  lightThemes[0],
  darkThemes[0],
].filter(Boolean);

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
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15"
            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
        }
      `}
      style={{
        background: isActive ? undefined : t.colors.bg,
      }}
    >
      <div
        className="w-10 h-10 rounded mb-2 flex items-center justify-center text-lg border"
        style={{
          background: t.colors.bg,
          borderColor: t.colors.border,
        }}
      >
        {t.icon}
      </div>
      <span
        className="text-xs font-medium truncate w-full text-center"
        style={{
          color: isActive ? "var(--color-primary)" : "var(--color-text)",
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
        relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        flex items-center gap-2
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
  useGlassSettings();
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Get themes based on active tab
  const getThemes = (): Theme[] => {
    switch (activeTab) {
      case "default":
        return defaultThemes;
      case "light":
        return lightThemes;
      case "dark":
        return darkThemes;
      default:
        return defaultThemes;
    }
  };

  const displayedThemes = getThemes();

  return (
    <div data-theme-selector ref={containerRef} className="space-y-4">
      {/* Tabs */}
      <div
        className="flex gap-2 p-2 rounded-xl mb-6 border"
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
      </div>

      {/* Theme Grid */}
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

      {/* Glass Theme Settings Modal */}
      <GlassSettingsModal
        key={showGlassModal ? "modal-open" : "modal-closed"}
        open={showGlassModal}
        onClose={() => setShowGlassModal(false)}
      />
    </div>
  );
}
