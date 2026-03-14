"use client";

import { Card } from "@/components/ui";

interface NotificationChannelsSectionProps {
  desktopEnabled: boolean;
  soundEnabled: boolean;
  onDesktopChange: (enabled: boolean) => void;
  onSoundChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export function NotificationChannelsSection({
  desktopEnabled,
  soundEnabled,
  onDesktopChange,
  onSoundChange,
  disabled,
}: NotificationChannelsSectionProps) {
  return (
    <Card className="mb-6">
      <h3 className="font-medium mb-4" style={{ color: "var(--color-text)" }}>
        通知渠道
      </h3>
      <div className="space-y-3">
        {/* Desktop Notifications */}
        <div
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ backgroundColor: "var(--color-bg-hover)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🖥️</span>
            <div>
              <div
                className="font-medium"
                style={{ color: "var(--color-text)" }}
              >
                桌面通知
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                在桌面上显示系统通知
              </div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={desktopEnabled}
              onChange={(e) => onDesktopChange(e.target.checked)}
              disabled={disabled}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
              style={{
                backgroundColor: desktopEnabled
                  ? "var(--color-primary)"
                  : "var(--color-border)",
              }}
            />
          </label>
        </div>

        {/* Sound */}
        <div
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ backgroundColor: "var(--color-bg-hover)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔊</span>
            <div>
              <div
                className="font-medium"
                style={{ color: "var(--color-text)" }}
              >
                提示音
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                通知到达时播放提示音
              </div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => onSoundChange(e.target.checked)}
              disabled={disabled}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
              style={{
                backgroundColor: soundEnabled
                  ? "var(--color-primary)"
                  : "var(--color-border)",
              }}
            />
          </label>
        </div>
      </div>
    </Card>
  );
}
