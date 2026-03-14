"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { CHANNEL_TYPES } from "@/lib/types/notification";

interface ChannelPrioritySettingsProps {
  priority: string[];
  onChange: (priority: string[]) => void;
  disabled?: boolean;
}

export function ChannelPrioritySettings({
  priority,
  onChange,
  disabled,
}: ChannelPrioritySettingsProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;

    const newPriority = [...priority];
    const [draggedItem] = newPriority.splice(draggingIndex, 1);
    newPriority.splice(index, 0, draggedItem);

    onChange(newPriority);
    setDraggingIndex(index);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPriority = [...priority];
    [newPriority[index - 1], newPriority[index]] = [
      newPriority[index],
      newPriority[index - 1],
    ];
    onChange(newPriority);
  };

  const moveDown = (index: number) => {
    if (index === priority.length - 1) return;
    const newPriority = [...priority];
    [newPriority[index], newPriority[index + 1]] = [
      newPriority[index + 1],
      newPriority[index],
    ];
    onChange(newPriority);
  };

  const getChannelLabel = (value: string) => {
    const channel = CHANNEL_TYPES.find((c) => c.value === value);
    return channel?.label || value;
  };

  const getChannelIcon = (value: string) => {
    const channel = CHANNEL_TYPES.find((c) => c.value === value);
    return channel?.icon || "📢";
  };

  return (
    <Card className="mb-6">
      <h3 className="font-medium mb-2" style={{ color: "var(--color-text)" }}>
        渠道优先级
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
        拖动或点击箭头调整通知发送顺序，靠前的渠道优先使用
      </p>

      <div className="space-y-2">
        {priority.map((channel, index) => (
          <div
            key={channel}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              draggingIndex === index ? "opacity-50" : ""
            } ${!disabled ? "cursor-move" : ""}`}
            style={{
              backgroundColor: "var(--color-bg-hover)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
              >
                {index + 1}
              </span>
              <span className="text-lg">{getChannelIcon(channel)}</span>
              <span style={{ color: "var(--color-text)" }}>
                {getChannelLabel(channel)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveUp(index)}
                disabled={disabled || index === 0}
                className="p-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveDown(index)}
                disabled={disabled || index === priority.length - 1}
                className="p-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {priority.length === 0 && (
        <div
          className="text-center py-8 rounded-lg border border-dashed"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          暂无通知渠道
        </div>
      )}
    </Card>
  );
}
