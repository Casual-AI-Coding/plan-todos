import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TargetItem } from "../TargetItem";
import type { Target, Tag, Step } from "@/lib/types";

// Mock UI components
vi.mock("@/components/ui/Card", () => ({
  Card: vi.fn(({ children, hoverable, onClick }) => (
    <div data-testid="card" onClick={onClick} data-hoverable={hoverable}>
      {children}
    </div>
  )),
}));

vi.mock("@/components/ui/ProgressBar", () => ({
  ProgressBar: vi.fn(({ value, color }) => (
    <div data-testid="progress-bar" data-value={value} data-color={color}>
      Progress: {value}%
    </div>
  )),
}));

vi.mock("@/components/ui/Checkbox", () => ({
  Checkbox: vi.fn(({ checked, onChange, onClick }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={onClick}
      data-testid="checkbox"
    />
  )),
}));

// Mock ReminderQuickButton component
vi.mock("../ReminderQuickButton", () => ({
  ReminderQuickButton: vi.fn(({ reminderTimes, onUpdate }) => (
    <div data-testid="reminder-quick-button">
      <span data-testid="reminder-times">{JSON.stringify(reminderTimes)}</span>
      <button
        data-testid="trigger-onUpdate"
        onClick={() => onUpdate?.([5, 15])}
      >
        Trigger onUpdate
      </button>
    </div>
  )),
}));

const mockTarget: Target = {
  id: "target-1",
  title: "测试目标",
  description: null,
  status: "active",
  progress: 50,
  due_date: "2024-12-31",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

const mockTags: Tag[] = [
  {
    id: "tag-1",
    name: "工作",
    color: "#FF6B6B",
    description: null,
    created_at: "2024-01-01",
  },
];

const mockSteps: Step[] = [
  {
    id: "step-1",
    title: "步骤1",
    status: "pending",
    weight: 30,
    priority: "P2",
    target_id: "target-1",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "step-2",
    title: "步骤2",
    status: "completed",
    weight: 40,
    priority: "P2",
    target_id: "target-1",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

describe("TargetItem", () => {
  const mockOnDelete = vi.fn();
  const mockOnClick = vi.fn();
  const mockOnToggleStep = vi.fn();
  const mockOnDeleteStep = vi.fn();
  const mockOnReminderUpdate = vi.fn();
  const mockOnToggleExpand = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("基本渲染功能", () => {
    it("正确渲染目标标题", () => {
      render(
        <TargetItem
          target={mockTarget}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("测试目标")).toBeInTheDocument();
    });

    it("显示进度百分比", () => {
      render(
        <TargetItem
          target={mockTarget}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("显示截止日期", () => {
      render(
        <TargetItem
          target={mockTarget}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText(/2024-12-31/)).toBeInTheDocument();
    });

    it("显示权重总和", () => {
      render(
        <TargetItem
          target={mockTarget}
          steps={mockSteps}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText(/权重总和: 70\/100/)).toBeInTheDocument();
    });

    it("无截止日期时不显示日期", () => {
      const targetWithoutDueDate: Target = { ...mockTarget, due_date: null };

      render(
        <TargetItem
          target={targetWithoutDueDate}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.queryByText(/📅/)).not.toBeInTheDocument();
    });
  });

  describe("标签显示", () => {
    it("有标签时显示标签", () => {
      render(
        <TargetItem
          target={mockTarget}
          tags={mockTags}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("工作")).toBeInTheDocument();
    });

    it("无标签时不显示标签区域", () => {
      render(
        <TargetItem
          target={mockTarget}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
    });
  });

  describe("用户交互", () => {
    it("点击删除按钮删除目标", () => {
      render(
        <TargetItem
          target={mockTarget}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const deleteButton = screen.getByText("🗑️");
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith("target-1");
    });

    it("点击卡片触发 onClick", () => {
      render(
        <TargetItem
          target={mockTarget}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("card");
      fireEvent.click(card);

      expect(mockOnClick).toHaveBeenCalledWith(mockTarget);
    });

    it("无 onDelete 时不显示删除按钮", () => {
      render(<TargetItem target={mockTarget} onClick={mockOnClick} />);

      expect(screen.queryByText("🗑️")).not.toBeInTheDocument();
    });
  });

  describe("展开/折叠功能", () => {
    it("默认显示折叠状态", () => {
      render(
        <TargetItem
          target={mockTarget}
          steps={mockSteps}
          expanded={false}
          onToggleExpand={mockOnToggleExpand}
        />,
      );

      expect(screen.getByText("▶")).toBeInTheDocument();
    });

    it("展开状态显示 ▶", () => {
      render(
        <TargetItem
          target={mockTarget}
          steps={mockSteps}
          expanded={false}
          onToggleExpand={mockOnToggleExpand}
        />,
      );

      expect(screen.getByText("▶")).toHaveAttribute("aria-label", "展开步骤");
    });

    it("展开状态显示 ▼", () => {
      render(
        <TargetItem
          target={mockTarget}
          steps={mockSteps}
          expanded={true}
          onToggleExpand={mockOnToggleExpand}
        />,
      );

      expect(screen.getByText("▼")).toHaveAttribute("aria-label", "折叠步骤");
    });

    it("点击展开按钮触发 onToggleExpand", () => {
      render(
        <TargetItem
          target={mockTarget}
          steps={mockSteps}
          expanded={false}
          onToggleExpand={mockOnToggleExpand}
        />,
      );

      const expandButton = screen.getByText("▶");
      fireEvent.click(expandButton);

      expect(mockOnToggleExpand).toHaveBeenCalledWith("target-1");
    });

    it("按 Enter 键触发 onToggleExpand", () => {
      render(
        <TargetItem
          target={mockTarget}
          steps={mockSteps}
          expanded={false}
          onToggleExpand={mockOnToggleExpand}
        />,
      );

      const expandButton = screen.getByText("▶");
      fireEvent.keyDown(expandButton, { key: "Enter" });

      expect(mockOnToggleExpand).toHaveBeenCalledWith("target-1");
    });

    it("展开后显示步骤列表", () => {
      render(
        <TargetItem
          target={mockTarget}
          steps={mockSteps}
          expanded={true}
          onToggleStep={mockOnToggleStep}
          onDeleteStep={mockOnDeleteStep}
        />,
      );

      expect(screen.getByText("步骤1")).toBeInTheDocument();
      expect(screen.getByText("步骤2")).toBeInTheDocument();
    });

    it("无步骤时显示暂无步骤", () => {
      render(<TargetItem target={mockTarget} steps={[]} expanded={true} />);

      expect(screen.getByText("暂无步骤")).toBeInTheDocument();
    });

    it("步骤总权重不足100%时显示剩余可用权重", () => {
      render(
        <TargetItem target={mockTarget} steps={mockSteps} expanded={true} />,
      );

      expect(screen.getByText(/剩余可用权重: 30%/)).toBeInTheDocument();
    });
  });

  describe("步骤操作", () => {
    it("点击步骤 checkbox 触发 onToggleStep", () => {
      render(
        <TargetItem
          target={mockTarget}
          steps={mockSteps}
          expanded={true}
          onToggleStep={mockOnToggleStep}
          onDeleteStep={mockOnDeleteStep}
        />,
      );

      const checkbox = screen.getAllByTestId("checkbox")[0];
      fireEvent.click(checkbox);

      expect(mockOnToggleStep).toHaveBeenCalledWith(mockSteps[0]);
    });

    it("点击步骤删除按钮触发 onDeleteStep", () => {
      render(
        <TargetItem
          target={mockTarget}
          steps={mockSteps}
          expanded={true}
          onToggleStep={mockOnToggleStep}
          onDeleteStep={mockOnDeleteStep}
        />,
      );

      // 使用 aria-label 来精确选择步骤删除按钮
      const stepDeleteButton = screen.getAllByLabelText("删除步骤");
      fireEvent.click(stepDeleteButton[0]);

      expect(mockOnDeleteStep).toHaveBeenCalledWith("step-1");
    });
  });

  describe("ReminderQuickButton", () => {
    it("渲染 ReminderQuickButton 组件", () => {
      render(
        <TargetItem
          target={mockTarget}
          reminderTimes={[5]}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      expect(screen.getByTestId("reminder-quick-button")).toBeInTheDocument();
    });

    it("正确传递 reminderTimes", () => {
      const reminderTimes = [5, 15, 30];

      render(
        <TargetItem
          target={mockTarget}
          reminderTimes={reminderTimes}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      const reminderTimesDisplay = screen.getByTestId("reminder-times");
      expect(reminderTimesDisplay).toHaveTextContent("[5,15,30]");
    });

    it("点击触发按钮可以更新提醒时间", async () => {
      render(
        <TargetItem
          target={mockTarget}
          reminderTimes={[5]}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      const triggerButton = screen.getByTestId("trigger-onUpdate");
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(mockOnReminderUpdate).toHaveBeenCalledWith("target-1", [5, 15]);
      });
    });

    it("未传入 reminderTimes 时默认空数组", () => {
      render(
        <TargetItem
          target={mockTarget}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      const reminderTimesDisplay = screen.getByTestId("reminder-times");
      expect(reminderTimesDisplay).toHaveTextContent("[]");
    });
  });

  describe("React.memo 优化", () => {
    it("相同 props 不会重新渲染", () => {
      const { rerender } = render(
        <TargetItem
          target={mockTarget}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      rerender(
        <TargetItem
          target={mockTarget}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("target 属性变化时重新渲染", () => {
      const { rerender } = render(
        <TargetItem
          target={mockTarget}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const updatedTarget = { ...mockTarget, title: "更新的目标" };
      rerender(
        <TargetItem
          target={updatedTarget}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("更新的目标")).toBeInTheDocument();
    });

    it("expanded 变化时重新渲染", () => {
      const { rerender } = render(
        <TargetItem target={mockTarget} steps={mockSteps} expanded={false} />,
      );

      rerender(
        <TargetItem target={mockTarget} steps={mockSteps} expanded={true} />,
      );

      expect(screen.getByText("▼")).toBeInTheDocument();
    });

    it("steps 变化时重新渲染", () => {
      const { rerender } = render(
        <TargetItem target={mockTarget} steps={[]} expanded={true} />,
      );

      const newSteps: Step[] = [
        {
          id: "step-new",
          title: "新步骤",
          status: "pending",
          weight: 50,
          priority: "P2",
          target_id: "target-1",
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
      ];

      rerender(
        <TargetItem target={mockTarget} steps={newSteps} expanded={true} />,
      );

      expect(screen.getByText("新步骤")).toBeInTheDocument();
    });

    it("tags 变化时重新渲染", () => {
      const { rerender } = render(<TargetItem target={mockTarget} tags={[]} />);

      rerender(<TargetItem target={mockTarget} tags={mockTags} />);

      expect(screen.getByText("工作")).toBeInTheDocument();
    });

    it("reminderTimes 变化时重新渲染", () => {
      const { rerender } = render(
        <TargetItem target={mockTarget} reminderTimes={[]} />,
      );

      rerender(<TargetItem target={mockTarget} reminderTimes={[5, 15]} />);

      const reminderTimesDisplay = screen.getByTestId("reminder-times");
      expect(reminderTimesDisplay).toHaveTextContent("[5,15]");
    });
  });
});
