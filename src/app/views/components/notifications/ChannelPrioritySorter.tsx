"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CHANNEL_TYPES } from "@/lib/types";

interface ChannelPrioritySorterProps {
  priority: string[];
  onChange: (priority: string[]) => void;
  disabled?: boolean;
}

export function ChannelPrioritySorter({
  priority,
  onChange,
  disabled = false,
}: ChannelPrioritySorterProps) {
  const moveChannel = (index: number, direction: "up" | "down") => {
    if (disabled) return;

    const newPriority = [...priority];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newPriority.length) return;

    [newPriority[index], newPriority[targetIndex]] = [
      newPriority[targetIndex],
      newPriority[index],
    ];
    onChange(newPriority);
  };

  const toggleChannel = (channelValue: string) => {
    if (disabled) return;

    const newPriority = priority.includes(channelValue)
      ? priority.filter((c) => c !== channelValue)
      : [...priority, channelValue];
    onChange(newPriority);
  };

  const isChannelEnabled = (channelValue: string) =>
    priority.includes(channelValue);

  const getChannelLabel = (value: string) => {
    const channel = CHANNEL_TYPES.find((c) => c.value === value);
    return channel ? `${channel.icon} ${channel.label}` : value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>通知渠道优先级</CardTitle>
        <p className="text-sm text-gray-500">
          启用通知渠道并调整优先级顺序（拖动手柄或使用箭头按钮）
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {priority.map((channelValue, index) => (
            <div
              key={channelValue}
              className={`
                flex items-center gap-3 p-3 rounded-lg border
                ${disabled ? "bg-gray-50" : "bg-white border-gray-200"}
              `}
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveChannel(index, "up")}
                  disabled={disabled || index === 0}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveChannel(index, "down")}
                  disabled={disabled || index === priority.length - 1}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <span className="flex-1 font-medium">
                {getChannelLabel(channelValue)}
              </span>
              <button
                onClick={() => toggleChannel(channelValue)}
                disabled={disabled}
                className={`
                  px-3 py-1 rounded-full text-sm
                  ${
                    isChannelEnabled(channelValue)
                      ? "bg-teal-100 text-teal-700"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >
                {isChannelEnabled(channelValue) ? "启用" : "禁用"}
              </button>
            </div>
          ))}

          {/* Show disabled channels */}
          {CHANNEL_TYPES.filter((c) => !priority.includes(c.value)).map(
            (channel) => (
              <div
                key={channel.value}
                className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200 opacity-60"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-gray-300">↑</span>
                  <span className="text-gray-300">↓</span>
                </div>
                <span className="flex-1 font-medium">
                  {channel.icon} {channel.label}
                </span>
                <button
                  onClick={() => toggleChannel(channel.value)}
                  disabled={disabled}
                  className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-500"
                >
                  禁用
                </button>
              </div>
            ),
          )}
        </div>

        {priority.length === 0 && (
          <p className="text-sm text-amber-600 mt-4">请至少启用一个通知渠道</p>
        )}
      </CardContent>
    </Card>
  );
}
