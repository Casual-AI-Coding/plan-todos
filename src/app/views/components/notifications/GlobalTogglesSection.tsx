"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";

interface GlobalTogglesSectionProps {
  masterEnabled: boolean;
  desktopEnabled: boolean;
  soundEnabled: boolean;
  onMasterChange: (enabled: boolean) => void;
  onDesktopChange: (enabled: boolean) => void;
  onSoundChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export function GlobalTogglesSection({
  masterEnabled,
  desktopEnabled,
  soundEnabled,
  onMasterChange,
  onDesktopChange,
  onSoundChange,
  disabled = false,
}: GlobalTogglesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>全局开关</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">总开关</label>
            <p className="text-sm text-gray-500">启用或禁用所有通知</p>
          </div>
          <Checkbox
            checked={masterEnabled}
            onChange={(e) => onMasterChange(e.target.checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">桌面通知</label>
            <p className="text-sm text-gray-500">在桌面显示通知弹窗</p>
          </div>
          <Checkbox
            checked={desktopEnabled}
            onChange={(e) => onDesktopChange(e.target.checked)}
            disabled={disabled || !masterEnabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">提示音</label>
            <p className="text-sm text-gray-500">通知时播放提示音</p>
          </div>
          <Checkbox
            checked={soundEnabled}
            onChange={(e) => onSoundChange(e.target.checked)}
            disabled={disabled || !masterEnabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
