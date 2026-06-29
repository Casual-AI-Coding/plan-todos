export type BatchEntityType = "todo" | "plan" | "target";

export type BatchActionOption = {
  readonly value: string;
  readonly label: string;
};

export const STATUS_OPTIONS: Record<BatchEntityType, readonly BatchActionOption[]> = {
  todo: [
    { value: "pending", label: "待处理" },
    { value: "in-progress", label: "进行中" },
    { value: "done", label: "已完成" },
  ],
  plan: [
    { value: "draft", label: "草稿" },
    { value: "active", label: "进行中" },
    { value: "completed", label: "已完成" },
  ],
  target: [
    { value: "active", label: "进行中" },
    { value: "completed", label: "已完成" },
    { value: "abandoned", label: "已放弃" },
  ],
};

export const PRIORITY_OPTIONS: readonly BatchActionOption[] = [
  { value: "P0", label: "P0 紧急" },
  { value: "P1", label: "P1 重要" },
  { value: "P2", label: "P2 普通" },
  { value: "P3", label: "P3 低优" },
];
