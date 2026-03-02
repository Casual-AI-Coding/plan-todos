import { Button } from "@/components/ui/Button";

type ViewMode = "list" | "board" | "calendar" | "gantt";

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({
  viewMode,
  onViewModeChange,
}: ViewModeSelectorProps) {
  const modes: { value: ViewMode; label: string }[] = [
    { value: "list", label: "列表" },
    { value: "board", label: "看板" },
    { value: "calendar", label: "日历" },
    { value: "gantt", label: "甘特图" },
  ];

  return (
    <div className="flex gap-2">
      {modes.map((mode) => (
        <Button
          key={mode.value}
          variant={viewMode === mode.value ? "primary" : "secondary"}
          onClick={() => onViewModeChange(mode.value)}
        >
          {mode.label}
        </Button>
      ))}
    </div>
  );
}
