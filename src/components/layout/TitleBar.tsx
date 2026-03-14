"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { NotificationBell } from "@/components/features/NotificationBell";
import {
  minimizeWindow,
  toggleMaximize,
  closeWindow,
  isMaximized,
} from "@/lib/api";

interface TitleBarProps {
  /**
   * Title to display in the title bar
   * @default "Plan Todos"
   */
  title?: string;
  /**
   * Show window controls (minimize, maximize, close)
   * @default true
   */
  showControls?: boolean;
}

/**
 * Custom window title bar for Tauri desktop application
 * Provides window dragging and control buttons
 */
export function TitleBar({
  title = "Plan Todos",
  showControls = true,
}: TitleBarProps) {
  const { theme } = useTheme();
  const [maximized, setMaximized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  // Check initial maximized state
  useEffect(() => {
    if (!isClient) return;

    const checkMaximized = async () => {
      try {
        const max = await isMaximized();
        setMaximized(max);
      } catch (e) {
        // Ignore errors - not in Tauri
      }
    };

    checkMaximized();
  }, [isClient]);

  // Handle minimize
  const handleMinimize = async () => {
    try {
      await minimizeWindow();
    } catch (e) {
      // Ignore errors
    }
  };

  // Handle maximize/restore toggle
  const handleMaximize = async () => {
    try {
      await toggleMaximize();
      setMaximized(!maximized);
    } catch (e) {
      // Ignore errors
    }
  };

  // Handle close
  const handleClose = async () => {
    try {
      await closeWindow();
    } catch (e) {
      // Ignore errors
    }
  };

  // Handle double-click to toggle maximize
  const handleDoubleClick = () => {
    handleMaximize();
  };

  // Only render on client to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div
      className="title-bar"
      data-tauri-drag-region
      style={{
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 8px",
        backgroundColor: "var(--color-bg)",
        userSelect: "none",
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Left section: App icon and title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* App icon */}
        <div
          style={{
            width: "16px",
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
          }}
        >
          📋
        </div>
        {/* Title */}
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-text)",
          }}
        >
          {title}
        </span>
      </div>

      {/* Right section: Notification bell + Window controls */}
      {showControls && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {/* Notification Bell */}
          <NotificationBell />

          {/* Window controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            {/* Minimize button */}
            <WindowControlButton
              onClick={handleMinimize}
              title="Minimize"
              icon={
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="currentColor"
                >
                  <rect x="0" y="4" width="10" height="1" />
                </svg>
              }
            />
            {/* Maximize/Restore button */}
            <WindowControlButton
              onClick={handleMaximize}
              title={maximized ? "Restore" : "Maximize"}
              icon={
                maximized ? (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <rect x="2" y="0" width="8" height="8" />
                    <rect
                      x="0"
                      y="2"
                      width="8"
                      height="8"
                      fill="var(--color-bg)"
                    />
                    <rect x="0" y="2" width="8" height="8" />
                  </svg>
                ) : (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <rect x="0" y="0" width="10" height="10" />
                  </svg>
                )
              }
            />
            {/* Close button */}
            <WindowControlButton
              onClick={handleClose}
              title="Close"
              icon={
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="currentColor"
                >
                  <path
                    d="M1 1L9 9M9 1L1 9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              }
              isClose
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual window control button (minimize, maximize, close)
 */
interface WindowControlButtonProps {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  isClose?: boolean;
}

function WindowControlButton({
  onClick,
  title,
  icon,
  isClose = false,
}: WindowControlButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "32px",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        backgroundColor: isHovered
          ? isClose
            ? "#e81123" // Windows close button red
            : "var(--color-bg-hover)"
          : "transparent",
        color: isHovered && isClose ? "#ffffff" : "var(--color-text)",
        cursor: "pointer",
        borderRadius: "4px",
        transition: "background-color 0.15s ease",
      }}
      aria-label={title}
    >
      {icon}
    </button>
  );
}

export type { TitleBarProps };
