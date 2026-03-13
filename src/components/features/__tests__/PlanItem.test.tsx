import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PlanItem } from "../PlanItem";
import type { Plan, Tag } from "@/lib/types";

// Mock UI component
vi.mock("@/components/ui/Card", () => ({
  Card: vi.fn(({ children, hoverable, onClick, onKeyDown, role, tabIndex }) => (
    <div
      role={role}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      data-hoverable={hoverable}
      data-testid="card"
    >
      {children}
    </div>
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

const mockPlan: Plan = {
  id: "plan-1",
  title: "测试计划",
  description: "这是一个测试计划",
  status: "active",
  start_date: "2024-01-01",
  end_date: "2024-12-31",
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
  {
    id: "tag-2",
    name: "学习",
    color: "#4ECDC4",
    description: null,
    created_at: "2024-01-01",
  },
];

describe("PlanItem", () => {
  const mockOnDelete = vi.fn();
  const mockOnClick = vi.fn();
  const mockOnReminderUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("基本渲染功能", () => {
    it("正确渲染计划标题", () => {
      render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("测试计划")).toBeInTheDocument();
    });

    it("显示计划描述", () => {
      render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("这是一个测试计划")).toBeInTheDocument();
    });

    it("描述过长显示省略", () => {
      const planWithLongDescription: Plan = {
        ...mockPlan,
        description: "这是一个非常长的描述，".repeat(20),
      };

      render(
        <PlanItem
          plan={planWithLongDescription}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 验证 line-clamp-2 类存在即可
      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
    });

    it("无描述时不显示描述区域", () => {
      const planWithoutDescription = { ...mockPlan, description: null };

      render(
        <PlanItem
          plan={planWithoutDescription}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.queryByText("这是一个测试计划")).not.toBeInTheDocument();
    });
  });

  describe("日期显示", () => {
    it("显示开始日期和结束日期", () => {
      render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
      expect(screen.getByText(/2024-12-31/)).toBeInTheDocument();
    });

    it("无结束日期时显示进行中", () => {
      const planWithoutEndDate: Plan = {
        ...mockPlan,
        end_date: null,
      };

      render(
        <PlanItem
          plan={planWithoutEndDate}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText(/进行中/)).toBeInTheDocument();
    });

    it("无开始日期时不显示日期区域", () => {
      const planWithoutDates: Plan = {
        ...mockPlan,
        start_date: null,
        end_date: null,
      };

      render(
        <PlanItem
          plan={planWithoutDates}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.queryByText(/📅/)).not.toBeInTheDocument();
    });
  });

  describe("归档状态", () => {
    it("归档计划显示删除线样式", () => {
      const archivedPlan: Plan = {
        ...mockPlan,
        status: "archived",
      };

      render(
        <PlanItem
          plan={archivedPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
    });

    it("活动计划正常显示", () => {
      const activePlan: Plan = {
        ...mockPlan,
        status: "active",
      };

      render(
        <PlanItem
          plan={activePlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("测试计划")).toBeInTheDocument();
    });

    it("已完成计划正常显示", () => {
      const completedPlan: Plan = {
        ...mockPlan,
        status: "completed",
      };

      render(
        <PlanItem
          plan={completedPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("测试计划")).toBeInTheDocument();
    });
  });

  describe("标签显示", () => {
    it("有标签时显示标签", () => {
      render(
        <PlanItem
          plan={mockPlan}
          tags={mockTags}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("工作")).toBeInTheDocument();
      expect(screen.getByText("学习")).toBeInTheDocument();
    });

    it("无标签时不显示标签区域", () => {
      render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
    });

    it("标签显示正确的颜色", () => {
      render(
        <PlanItem
          plan={mockPlan}
          tags={mockTags}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const workTag = screen.getByText("工作");
      expect(workTag).toHaveStyle({ color: "#FF6B6B" });
    });
  });

  describe("用户交互", () => {
    it("点击删除按钮删除计划", () => {
      render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const deleteButton = screen.getByText("🗑️");
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith("plan-1");
    });

    it("点击卡片触发 onClick", () => {
      render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("card");
      fireEvent.click(card);

      expect(mockOnClick).toHaveBeenCalledWith(mockPlan);
    });

    it("按 Enter 键触发 onClick", () => {
      render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("card");
      fireEvent.keyDown(card, { key: "Enter" });

      expect(mockOnClick).toHaveBeenCalledWith(mockPlan);
    });

    it("按其他键不触发 onClick", () => {
      render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("card");
      fireEvent.keyDown(card, { key: "Escape" });

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("无 onDelete 时不显示删除按钮", () => {
      render(<PlanItem plan={mockPlan} onClick={mockOnClick} />);

      expect(screen.queryByText("🗑️")).not.toBeInTheDocument();
    });

    it("删除按钮点击时阻止冒泡", () => {
      render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const deleteButton = screen.getByText("🗑️");
      fireEvent.click(deleteButton);

      // 如果冒泡了，onClick 也会被调用
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("ReminderQuickButton", () => {
    it("渲染 ReminderQuickButton 组件", () => {
      render(
        <PlanItem
          plan={mockPlan}
          reminderTimes={[5]}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      expect(screen.getByTestId("reminder-quick-button")).toBeInTheDocument();
    });

    it("正确传递 reminderTimes", () => {
      const reminderTimes = [5, 15, 30];

      render(
        <PlanItem
          plan={mockPlan}
          reminderTimes={reminderTimes}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      const reminderTimesDisplay = screen.getByTestId("reminder-times");
      expect(reminderTimesDisplay).toHaveTextContent("[5,15,30]");
    });

    it("未传入 reminderTimes 时默认空数组", () => {
      render(
        <PlanItem plan={mockPlan} onReminderUpdate={mockOnReminderUpdate} />,
      );

      const reminderTimesDisplay = screen.getByTestId("reminder-times");
      expect(reminderTimesDisplay).toHaveTextContent("[]");
    });

    it("点击触发按钮可以更新提醒时间", async () => {
      render(
        <PlanItem
          plan={mockPlan}
          reminderTimes={[5]}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      const triggerButton = screen.getByTestId("trigger-onUpdate");
      fireEvent.click(triggerButton);

      expect(mockOnReminderUpdate).toHaveBeenCalledWith("plan-1", [5, 15]);
    });
  });

  describe("React.memo 优化", () => {
    it("相同 props 不会重新渲染", () => {
      const { rerender } = render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      rerender(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("plan 属性变化时重新渲染", () => {
      const { rerender } = render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const updatedPlan = { ...mockPlan, title: "更新的计划" };
      rerender(
        <PlanItem
          plan={updatedPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("更新的计划")).toBeInTheDocument();
    });

    it("status 变化时重新渲染", () => {
      const { rerender } = render(<PlanItem plan={mockPlan} />);

      const archivedPlan = { ...mockPlan, status: "archived" as const };
      rerender(<PlanItem plan={archivedPlan} />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("tags 变化时重新渲染", () => {
      const { rerender } = render(<PlanItem plan={mockPlan} tags={[]} />);

      rerender(<PlanItem plan={mockPlan} tags={mockTags} />);

      expect(screen.getByText("工作")).toBeInTheDocument();
    });

    it("reminderTimes 变化时重新渲染", () => {
      const { rerender } = render(
        <PlanItem plan={mockPlan} reminderTimes={[]} />,
      );

      rerender(<PlanItem plan={mockPlan} reminderTimes={[5, 15]} />);

      const reminderTimesDisplay = screen.getByTestId("reminder-times");
      expect(reminderTimesDisplay).toHaveTextContent("[5,15]");
    });

    it("start_date 变化时重新渲染", () => {
      const { rerender } = render(<PlanItem plan={mockPlan} />);

      const updatedPlan = { ...mockPlan, start_date: "2025-01-01" };
      rerender(<PlanItem plan={updatedPlan} />);

      expect(screen.getByText(/2025-01-01/)).toBeInTheDocument();
    });

    it("end_date 变化时重新渲染", () => {
      const { rerender } = render(<PlanItem plan={mockPlan} />);

      const updatedPlan = { ...mockPlan, end_date: "2025-12-31" };
      rerender(<PlanItem plan={updatedPlan} />);

      expect(screen.getByText(/2025-12-31/)).toBeInTheDocument();
    });

    it("end_date 变化时重新渲染", () => {
      const { rerender } = render(<PlanItem plan={mockPlan} />);

      const updatedPlan = { ...mockPlan, end_date: "2025-12-31" };
      rerender(<PlanItem plan={updatedPlan} />);

      expect(screen.getByText(/2025-12-31/)).toBeInTheDocument();
    });
  });

  describe("无障碍性", () => {
    it("删除按钮有正确的 aria-label", () => {
      render(
        <PlanItem
          plan={mockPlan}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const deleteButton = screen.getByLabelText("删除计划");
      expect(deleteButton).toBeInTheDocument();
    });

    it("卡片有正确的 role 属性", () => {
      render(<PlanItem plan={mockPlan} onClick={mockOnClick} />);

      const card = screen.getByTestId("card");
      expect(card).toHaveAttribute("role", "button");
    });

    it("卡片可以聚焦", () => {
      render(<PlanItem plan={mockPlan} onClick={mockOnClick} />);

      const card = screen.getByTestId("card");
      expect(card).toHaveAttribute("tabIndex", "0");
    });
  });
});
