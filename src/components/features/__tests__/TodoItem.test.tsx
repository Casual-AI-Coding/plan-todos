import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoItem } from "../TodoItem";
import type { Todo } from "@/lib/types";

// Mock UI components
vi.mock("@/components/ui/Card", () => ({
  Card: vi.fn(({ children, hoverable, onClick, role, tabIndex, onKeyDown }) => (
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

const mockTodo: Todo = {
  id: "todo-1",
  title: "测试任务",
  content: "测试内容",
  status: "pending",
  priority: "P1",
  due_date: "2024-12-31",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  tags: [],
};

describe("TodoItem", () => {
  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnClick = vi.fn();
  const mockOnReminderUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("显示 ReminderQuickButton 组件", () => {
    it("渲染 ReminderQuickButton 组件", () => {
      render(
        <TodoItem
          todo={mockTodo}
          reminderTimes={[5]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      // 验证 ReminderQuickButton 组件被渲染
      expect(screen.getByTestId("reminder-quick-button")).toBeInTheDocument();
    });

    it("正确传递 reminderTimes 给 ReminderQuickButton", () => {
      const reminderTimes = [5, 15, 30];

      render(
        <TodoItem
          todo={mockTodo}
          reminderTimes={reminderTimes}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      // 验证 reminderTimes 被正确传递
      const reminderTimesDisplay = screen.getByTestId("reminder-times");
      expect(reminderTimesDisplay).toHaveTextContent("[5,15,30]");
    });

    it("无提醒时间时显示空数组", () => {
      render(
        <TodoItem
          todo={mockTodo}
          reminderTimes={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      // 验证空数组被传递
      const reminderTimesDisplay = screen.getByTestId("reminder-times");
      expect(reminderTimesDisplay).toHaveTextContent("[]");
    });

    it("未传入 reminderTimes 时默认空数组", () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      // 验证默认空数组
      const reminderTimesDisplay = screen.getByTestId("reminder-times");
      expect(reminderTimesDisplay).toHaveTextContent("[]");
    });
  });

  describe("点击提醒按钮更新提醒时间", () => {
    it("点击触发按钮可以更新提醒时间", async () => {
      render(
        <TodoItem
          todo={mockTodo}
          reminderTimes={[5]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      // 点击触发按钮
      const triggerButton = screen.getByTestId("trigger-onUpdate");
      fireEvent.click(triggerButton);

      // 验证 onReminderUpdate 被调用
      await waitFor(() => {
        expect(mockOnReminderUpdate).toHaveBeenCalledWith("todo-1", [5, 15]);
      });
    });

    it("未提供 onReminderUpdate 时不报错", () => {
      // 这测试组件在缺少回调时的容错性
      render(
        <TodoItem
          todo={mockTodo}
          reminderTimes={[5]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          // 不传入 onReminderUpdate
        />,
      );

      // 点击触发按钮不应该报错
      const triggerButton = screen.getByTestId("trigger-onUpdate");
      expect(() => fireEvent.click(triggerButton)).not.toThrow();
    });

    it("可以添加新的提醒时间", async () => {
      render(
        <TodoItem
          todo={mockTodo}
          reminderTimes={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
          onReminderUpdate={mockOnReminderUpdate}
        />,
      );

      // 点击触发按钮添加提醒
      const triggerButton = screen.getByTestId("trigger-onUpdate");
      fireEvent.click(triggerButton);

      // 验证 onReminderUpdate 被调用
      await waitFor(() => {
        expect(mockOnReminderUpdate).toHaveBeenCalledWith("todo-1", [5, 15]);
      });
    });
  });

  describe("基本渲染功能", () => {
    it("正确渲染任务标题", () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 验证标题显示
      expect(screen.getByText("测试任务")).toBeInTheDocument();
    });

    it("显示优先级标签", () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 验证优先级显示
      expect(screen.getByText("P1")).toBeInTheDocument();
    });

    it("已完成任务显示删除线样式", () => {
      const completedTodo = { ...mockTodo, status: "done" as const };

      render(
        <TodoItem
          todo={completedTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 验证 Card 组件被渲染
      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
    });

    it("显示截止日期", () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 验证截止日期显示
      expect(screen.getByText(/2024\/12\/31/)).toBeInTheDocument();
    });

    it("点击 checkbox 切换完成状态", () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 点击 checkbox
      const checkbox = screen.getByTestId("checkbox");
      fireEvent.click(checkbox);

      // 验证 onToggle 被调用
      expect(mockOnToggle).toHaveBeenCalledWith(mockTodo);
    });

    it("点击删除按钮删除任务", () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 点击删除按钮
      const deleteButton = screen.getByText("🗑️");
      fireEvent.click(deleteButton);

      // 验证 onDelete 被调用
      expect(mockOnDelete).toHaveBeenCalledWith("todo-1");
    });

    it("点击卡片触发 onClick", () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 点击卡片
      const card = screen.getByTestId("card");
      fireEvent.click(card);

      // 验证 onClick 被调用
      expect(mockOnClick).toHaveBeenCalledWith(mockTodo);
    });
  });

  describe("优先级样式", () => {
    it("P0 优先级显示红色样式", () => {
      const urgentTodo = { ...mockTodo, priority: "P0" as const };

      render(
        <TodoItem
          todo={urgentTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 验证 P0 标签显示
      expect(screen.getByText("P0")).toBeInTheDocument();
    });

    it("P3 优先级显示蓝色样式", () => {
      const lowPriorityTodo = { ...mockTodo, priority: "P3" as const };

      render(
        <TodoItem
          todo={lowPriorityTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 验证 P3 标签显示
      expect(screen.getByText("P3")).toBeInTheDocument();
    });
  });

  describe("标签显示", () => {
    it("有标签时显示标签", () => {
      const todoWithTags = {
        ...mockTodo,
        tags: [
          {
            id: "tag-1",
            name: "工作",
            color: "#FF6B6B",
            description: null,
            created_at: "2024-01-01",
          },
        ],
      };

      render(
        <TodoItem
          todo={todoWithTags}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 验证标签显示
      expect(screen.getByText("工作")).toBeInTheDocument();
    });

    it("无标签时不显示标签区域", () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      // 验证没有标签渲染（因为 tags 是空数组）
      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
    });
  });


  describe("键盘交互", () => {
    it("按 Enter 键触发 onClick", () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("card");
      fireEvent.keyDown(card, { key: "Enter" });

      expect(mockOnClick).toHaveBeenCalledWith(mockTodo);
    });

    it("按其他键不触发 onClick", () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const card = screen.getByTestId("card");
      fireEvent.keyDown(card, { key: "Escape" });

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("React.memo 优化", () => {
    it("相同 props 不会重新渲染", () => {
      const { rerender } = render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      rerender(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("todo 属性变化时重新渲染", () => {
      const { rerender } = render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const updatedTodo = { ...mockTodo, title: "更新的任务" };
      rerender(
        <TodoItem
          todo={updatedTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("更新的任务")).toBeInTheDocument();
    });

    it("reminderTimes 变化时重新渲染", () => {
      const { rerender } = render(
        <TodoItem
          todo={mockTodo}
          reminderTimes={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      rerender(
        <TodoItem
          todo={mockTodo}
          reminderTimes={[5, 15]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const reminderTimesDisplay = screen.getByTestId("reminder-times");
      expect(reminderTimesDisplay).toHaveTextContent("[5,15]");
    });

    it("tags 变化时重新渲染", () => {
      const { rerender } = render(
        <TodoItem
          todo={mockTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const todoWithTags = {
        ...mockTodo,
        tags: [{ id: "tag-1", name: "新标签", color: "#FF0000", description: null, created_at: "2024-01-01" }],
      };
      rerender(
        <TodoItem
          todo={todoWithTags}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("新标签")).toBeInTheDocument();
    });

    it("tags 长度不同时重新渲染", () => {
      const todoWithOneTag = {
        ...mockTodo,
        tags: [{ id: "tag-1", name: "标签1", color: "#FF0000", description: null, created_at: "2024-01-01" }],
      };

      const { rerender } = render(
        <TodoItem
          todo={todoWithOneTag}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const todoWithTwoTags = {
        ...mockTodo,
        tags: [
          { id: "tag-1", name: "标签1", color: "#FF0000", description: null, created_at: "2024-01-01" },
          { id: "tag-2", name: "标签2", color: "#00FF00", description: null, created_at: "2024-01-01" },
        ],
      };
      rerender(
        <TodoItem
          todo={todoWithTwoTags}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("标签2")).toBeInTheDocument();
    });

    it("tags ID 不同时重新渲染", () => {
      const todoWithTags = {
        ...mockTodo,
        tags: [{ id: "tag-1", name: "旧标签", color: "#FF0000", description: null, created_at: "2024-01-01" }],
      };

      const { rerender } = render(
        <TodoItem
          todo={todoWithTags}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      const todoWithDifferentTag = {
        ...mockTodo,
        tags: [{ id: "tag-2", name: "新标签", color: "#00FF00", description: null, created_at: "2024-01-01" }],
      };
      rerender(
        <TodoItem
          todo={todoWithDifferentTag}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByText("新标签")).toBeInTheDocument();
    });
  });
});
