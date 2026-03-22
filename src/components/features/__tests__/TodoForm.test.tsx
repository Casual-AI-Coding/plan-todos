import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoForm } from "../TodoForm";
import type { Todo, Tag } from "@/lib/types";

// Mock UI components
vi.mock("@/components/ui/Modal", () => ({
  Modal: vi.fn(({ open, title, children, footer, onClose }) =>
    open ? (
      <div data-testid="modal" role="dialog" aria-modal="true">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
  ),
}));

vi.mock("@/components/ui/Button", () => ({
  Button: vi.fn(({ children, onClick, variant, ...props }) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  )),
}));

vi.mock("@/components/ui/Input", () => ({
  Input: vi.fn(
    ({ value, onChange, label, type, placeholder, autoFocus, ...props }) => (
      <div>
        {label && <label data-testid="input-label">{label}</label>}
        <input
          data-testid="input"
          type={type || "text"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          {...props}
        />
      </div>
    ),
  ),
}));

// Mock ReminderSettings component
vi.mock("../ReminderSettings", () => ({
  ReminderSettings: vi.fn(({ value, onChange }) => (
    <div data-testid="reminder-settings">
      <span data-testid="reminder-label">提醒设置</span>
      <span data-testid="reminder-value">{JSON.stringify(value)}</span>
      <button data-testid="trigger-onChange" onClick={() => onChange([5, 15])}>
        Trigger onChange
      </button>
    </div>
  )),
}));

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
    name: "个人",
    color: "#4ECDC4",
    description: null,
    created_at: "2024-01-01",
  },
];

const mockTodo: Todo = {
  id: "todo-1",
  title: "测试任务",
  content: "测试内容",
  status: "pending",
  priority: "P1",
  sort_order: 0,
  due_date: "2024-12-31",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  tags: [mockTags[0]],
};

describe("TodoForm", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("新建时 reminder_times 默认行为", () => {
    it("新建时 reminder_times 默认为空数组", () => {
      render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 验证 ReminderSettings 组件被渲染，且值为空数组
      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[]");
    });

    it("新建时打开表单，ReminderSettings 默认显示空值", () => {
      render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 表单标题应该是 "新建 Todo"
      expect(screen.getByTestId("modal-title")).toHaveTextContent("新建 Todo");
    });
  });

  describe("选择提醒时间", () => {
    it("可以选择提醒时间", () => {
      render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 触发 ReminderSettings 的 onChange 来模拟选择提醒时间
      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      // 验证值已更新
      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[5,15]");
    });

    it("ReminderSettings 组件正确渲染", () => {
      render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 验证 ReminderSettings 组件存在
      expect(screen.getByTestId("reminder-settings")).toBeInTheDocument();
    });
  });

  describe("保存时 reminder_times 包含在数据中", () => {
    it("保存时 reminder_times 包含在 TodoFormData 中", async () => {
      render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 填写标题（必填字段）
      const titleInput = screen.getByPlaceholderText("输入任务标题...");
      fireEvent.change(titleInput, { target: { value: "新任务" } });

      // 触发提醒时间选择
      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      // 点击创建按钮
      const createButton = screen.getByText("创建");
      fireEvent.click(createButton);

      // 验证 onSave 被调用，且 reminder_times 包含在数据中
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "新任务",
            reminder_times: [5, 15],
          }),
          expect.any(Array),
        );
      });
    });

    it("未设置提醒时间时，保存不包含 reminder_times 字段", async () => {
      render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 只填写标题
      const titleInput = screen.getByPlaceholderText("输入任务标题...");
      fireEvent.change(titleInput, { target: { value: "无提醒任务" } });

      // 点击创建按钮
      const createButton = screen.getByText("创建");
      fireEvent.click(createButton);

      // 验证 onSave 被调用，reminder_times 为 undefined（空数组时不包含此字段）
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "无提醒任务",
          }),
          expect.any(Array),
        );
      });
    });

    it("reminder_times 为空数组时保存为 undefined", async () => {
      render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 填写标题
      const titleInput = screen.getByPlaceholderText("输入任务标题...");
      fireEvent.change(titleInput, { target: { value: "测试任务" } });

      // 点击创建按钮
      const createButton = screen.getByText("创建");
      fireEvent.click(createButton);

      // 验证保存的数据
      await waitFor(() => {
        const savedData = mockOnSave.mock.calls[0][0];
        // reminder_times 应该是 undefined（因为空数组会被过滤）
        expect(savedData.reminder_times).toBeUndefined();
      });
    });
  });

  describe("编辑时显示已有的 reminder_times", () => {
    it("编辑时显示已有的提醒时间", () => {
      const existingReminderTimes = [5, 30];

      render(
        <TodoForm
          open={true}
          editingTodo={mockTodo}
          allTags={mockTags}
          editingReminderTimes={existingReminderTimes}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 验证表单标题是 "编辑 Todo"
      expect(screen.getByTestId("modal-title")).toHaveTextContent("编辑 Todo");

      // 验证已存在的提醒时间被正确传递
      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[5,30]");
    });

    it("编辑时可以修改提醒时间", () => {
      const existingReminderTimes = [5];

      render(
        <TodoForm
          open={true}
          editingTodo={mockTodo}
          allTags={mockTags}
          editingReminderTimes={existingReminderTimes}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 触发提醒时间修改
      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      // 验证值已更新
      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[5,15]");
    });

    it("编辑时保存包含更新后的 reminder_times", async () => {
      const existingReminderTimes = [5];

      render(
        <TodoForm
          open={true}
          editingTodo={mockTodo}
          allTags={mockTags}
          editingReminderTimes={existingReminderTimes}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 触发提醒时间修改
      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      // 点击保存按钮
      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      // 验证 onSave 被调用，包含更新后的 reminder_times
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: mockTodo.title,
            reminder_times: [5, 15],
          }),
          expect.any(Array),
        );
      });
    });

    it("编辑时无提醒时间，显示空数组", () => {
      render(
        <TodoForm
          open={true}
          editingTodo={mockTodo}
          allTags={mockTags}
          editingReminderTimes={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 验证提醒时间为空
      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[]");
    });
  });

  describe("表单基本功能", () => {
    it("正确渲染表单", () => {
      render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 验证表单元素存在
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("输入任务标题..."),
      ).toBeInTheDocument();
      expect(screen.getByText("优先级")).toBeInTheDocument();
      expect(screen.getByText("标签")).toBeInTheDocument();
      expect(screen.getByText("提醒设置")).toBeInTheDocument();
    });

    it("点击取消按钮关闭表单", () => {
      render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 点击取消按钮
      const cancelButton = screen.getByText("取消");
      fireEvent.click(cancelButton);

      // 验证 onClose 被调用
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("未填写标题时无法保存", async () => {
      render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 不填写标题，直接点击创建按钮
      const createButton = screen.getByText("创建");
      fireEvent.click(createButton);

      // 验证 onSave 没有被调用
      await waitFor(() => {
        expect(mockOnSave).not.toHaveBeenCalled();
      });
    });

    it("关闭表单后重新打开，重置提醒时间", () => {
      const { rerender } = render(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 触发提醒时间
      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      // 关闭表单
      const closeButton = screen.getByTestId("modal-close");
      fireEvent.click(closeButton);

      // 重新打开表单
      rerender(
        <TodoForm
          open={true}
          allTags={mockTags}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      // 验证提醒时间被重置
      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[]");
    });
  });
});
