import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TargetForm } from "../TargetForm";
import type { Target, Tag } from "@/lib/types";

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

const mockTarget: Target = {
  id: "target-1",
  title: "测试目标",
  description: "测试描述",
  due_date: "2024-12-31",
  status: "active",
  progress: 0,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

describe("TargetForm", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("新建时 reminder_times 默认行为", () => {
    it("新建时 reminder_times 默认为空数组", () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[]");
    });

    it("新建时打开表单，标题显示为新建 Target", () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "新建 Target",
      );
    });
  });

  describe("选择提醒时间", () => {
    it("可以选择提醒时间", () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[5,15]");
    });

    it("ReminderSettings 组件正确渲染", () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("reminder-settings")).toBeInTheDocument();
    });
  });

  describe("保存时 reminder_times 包含在数据中", () => {
    it("保存时 reminder_times 包含在 TargetFormData 中", async () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText("目标标题...");
      fireEvent.change(titleInput, { target: { value: "新目标" } });

      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      const createButton = screen.getByText("创建");
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "新目标",
            reminder_times: [5, 15],
          }),
          expect.any(Array),
        );
      });
    });

    it("未设置提醒时间时，保存不包含 reminder_times 字段", async () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText("目标标题...");
      fireEvent.change(titleInput, { target: { value: "无提醒目标" } });

      const createButton = screen.getByText("创建");
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "无提醒目标",
          }),
          expect.any(Array),
        );
      });
    });

    it("reminder_times 为空数组时保存为 undefined", async () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText("目标标题...");
      fireEvent.change(titleInput, { target: { value: "测试目标" } });

      const createButton = screen.getByText("创建");
      fireEvent.click(createButton);

      await waitFor(() => {
        const savedData = mockOnSave.mock.calls[0][0];
        expect(savedData.reminder_times).toBeUndefined();
      });
    });
  });

  describe("编辑时显示已有的 reminder_times", () => {
    it("编辑时显示已有的提醒时间", () => {
      const existingReminderTimes = [5, 30];

      render(
        <TargetForm
          open={true}
          editingTarget={mockTarget}
          allTags={mockTags}
          selectedTags={["tag-1"]}
          editingReminderTimes={existingReminderTimes}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "编辑 Target",
      );

      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[5,30]");
    });

    it("编辑时可以修改提醒时间", () => {
      const existingReminderTimes = [5];

      render(
        <TargetForm
          open={true}
          editingTarget={mockTarget}
          allTags={mockTags}
          selectedTags={[]}
          editingReminderTimes={existingReminderTimes}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[5,15]");
    });

    it("编辑时保存包含更新后的 reminder_times", async () => {
      const existingReminderTimes = [5];

      render(
        <TargetForm
          open={true}
          editingTarget={mockTarget}
          allTags={mockTags}
          selectedTags={[]}
          editingReminderTimes={existingReminderTimes}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            title: mockTarget.title,
            reminder_times: [5, 15],
          }),
          expect.any(Array),
        );
      });
    });

    it("编辑时无提醒时间，显示空数组", () => {
      render(
        <TargetForm
          open={true}
          editingTarget={mockTarget}
          allTags={mockTags}
          selectedTags={[]}
          editingReminderTimes={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[]");
    });
  });

  describe("表单基本功能", () => {
    it("正确渲染表单", () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("目标标题...")).toBeInTheDocument();
      expect(screen.getByText("描述")).toBeInTheDocument();
      expect(screen.getByText("截止日期")).toBeInTheDocument();
      expect(screen.getByText("标签")).toBeInTheDocument();
      expect(screen.getByText("提醒设置")).toBeInTheDocument();
    });

    it("点击取消按钮关闭表单", () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const cancelButton = screen.getByText("取消");
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("未填写标题时无法保存", async () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const createButton = screen.getByText("创建");
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnSave).not.toHaveBeenCalled();
      });
    });

    it("关闭表单后重新打开，重置提醒时间", () => {
      const { rerender } = render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      const closeButton = screen.getByTestId("modal-close");
      fireEvent.click(closeButton);

      rerender(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const reminderValue = screen.getByTestId("reminder-value");
      expect(reminderValue).toHaveTextContent("[]");
    });
  });

  describe("标签选择", () => {
    it("可以选择标签", () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const tagButtons = screen.getAllByRole("button");
      const workTagButton = tagButtons.find(
        (btn) => btn.textContent === "工作",
      );
      expect(workTagButton).toBeInTheDocument();
    });

    it("保存时包含选中的标签", async () => {
      render(
        <TargetForm
          open={true}
          allTags={mockTags}
          selectedTags={[]}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText("目标标题...");
      fireEvent.change(titleInput, { target: { value: "带标签目标" } });

      const tagButtons = screen.getAllByRole("button");
      const workTagButton = tagButtons.find(
        (btn) => btn.textContent === "工作",
      );
      fireEvent.click(workTagButton!);

      const createButton = screen.getByText("创建");
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.any(Object),
          expect.arrayContaining(["tag-1"]),
        );
      });
    });
  });
});
