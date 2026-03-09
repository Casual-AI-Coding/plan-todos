import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReminderQuickButton } from "../ReminderQuickButton";

// Mock Modal component
vi.mock("@/components/ui/Modal", () => ({
  Modal: vi.fn(({ open, title, children, footer }) =>
    open ? (
      <div data-testid="modal" role="dialog" aria-modal="true">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    ) : null,
  ),
}));

// Mock Button component
vi.mock("@/components/ui/Button", () => ({
  Button: vi.fn(({ children, onClick, variant, ...props }) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  )),
}));

// Mock ReminderSettings component
vi.mock("../ReminderSettings", () => ({
  ReminderSettings: vi.fn(({ value, onChange }) => (
    <div data-testid="reminder-settings">
      <span data-testid="reminder-value">{JSON.stringify(value)}</span>
      <button data-testid="trigger-onChange" onClick={() => onChange([10])}>
        Trigger onChange
      </button>
    </div>
  )),
}));

describe("ReminderQuickButton", () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[5, 15]}
          onUpdate={mockOnUpdate}
        />,
      );

      // 应该有铃铛图标
      const bellButton = screen.getByRole("button", { name: /提醒设置/i });
      expect(bellButton).toBeInTheDocument();
    });

    it("渲染按钮元素", () => {
      render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[]}
          onUpdate={mockOnUpdate}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("无提醒状态", () => {
    it("count=0 时图标半透明", () => {
      const { container } = render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[]}
          onUpdate={mockOnUpdate}
        />,
      );

      const button = container.querySelector("button");
      // count=0 时 opacity 为 0.3
      expect(button).toHaveStyle({ opacity: 0.3 });
    });

    it("count=0 时无徽章显示", () => {
      render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[]}
          onUpdate={mockOnUpdate}
        />,
      );

      // 不应该有徽章数字显示
      const bellButton = screen.getByRole("button", { name: /设置提醒/i });
      expect(bellButton).toBeInTheDocument();
    });
  });

  describe("有提醒状态", () => {
    it("count>0 时显示徽章", () => {
      render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[5, 15]}
          onUpdate={mockOnUpdate}
        />,
      );

      // 应该显示数量徽章
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("count>0 时图标正常颜色", () => {
      const { container } = render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[5]}
          onUpdate={mockOnUpdate}
        />,
      );

      const button = container.querySelector("button");
      // count>0 时 opacity 为 1
      expect(button).toHaveStyle({ opacity: 1 });
    });

    it("count>0 时 aria-label 包含数量信息", () => {
      render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[5]}
          onUpdate={mockOnUpdate}
        />,
      );

      const bellButton = screen.getByRole("button", {
        name: /提醒设置: 1个/i,
      });
      expect(bellButton).toBeInTheDocument();
    });
  });

  describe("点击弹窗", () => {
    it("点击后显示设置弹窗", () => {
      render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[]}
          onUpdate={mockOnUpdate}
        />,
      );

      // 点击按钮
      const bellButton = screen.getByRole("button", { name: /设置提醒/i });
      fireEvent.click(bellButton);

      // 弹窗应该打开
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-title")).toHaveTextContent("提醒设置");
    });

    it("弹窗内包含 ReminderSettings 组件", () => {
      render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[5]}
          onUpdate={mockOnUpdate}
        />,
      );

      // 点击按钮打开弹窗
      const bellButton = screen.getByRole("button");
      fireEvent.click(bellButton);

      // 弹窗内应该包含 ReminderSettings
      expect(screen.getByTestId("reminder-settings")).toBeInTheDocument();
    });

    it("点击保存按钮关闭弹窗", () => {
      render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[]}
          onUpdate={mockOnUpdate}
        />,
      );

      // 点击按钮打开弹窗
      const bellButton = screen.getByRole("button");
      fireEvent.click(bellButton);

      // 点击保存按钮
      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      // 弹窗应该关闭
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  describe("保存回调", () => {
    it("选择时间后保存触发 onUpdate", async () => {
      render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[]}
          onUpdate={mockOnUpdate}
        />,
      );

      // 打开弹窗
      const bellButton = screen.getByRole("button");
      fireEvent.click(bellButton);

      // 触发 ReminderSettings 的 onChange
      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      // 点击保存按钮
      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      // 弹窗关闭
      await waitFor(() => {
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
      });
    });

    it("onUpdate 接收到更新后的值", async () => {
      render(
        <ReminderQuickButton
          entityType="todo"
          entityId="test-id"
          reminderTimes={[]}
          onUpdate={mockOnUpdate}
        />,
      );

      // 打开弹窗
      const bellButton = screen.getByRole("button");
      fireEvent.click(bellButton);

      // 触发 ReminderSettings 的 onChange
      const triggerButton = screen.getByTestId("trigger-onChange");
      fireEvent.click(triggerButton);

      // 点击保存按钮
      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      // 验证 onUpdate 被调用
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith([10]);
      });
    });
  });
});
