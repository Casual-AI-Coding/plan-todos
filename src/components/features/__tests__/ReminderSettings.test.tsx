import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReminderSettings } from "../ReminderSettings";

// Mock UI components
vi.mock("@/components/ui/Checkbox", () => ({
  Checkbox: vi.fn(({ checked, onChange, className, ...props }) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={checked}
      onChange={onChange}
      className={className}
      {...props}
    />
  )),
}));

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
  Input: vi.fn(({ value, onChange, label, ...props }) => (
    <div>
      {label && <label data-testid="input-label">{label}</label>}
      <input data-testid="input" value={value} onChange={onChange} {...props} />
    </div>
  )),
}));

describe("ReminderSettings", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      render(<ReminderSettings value={[]} onChange={mockOnChange} />);

      expect(screen.getByText("提醒设置")).toBeInTheDocument();
      expect(screen.getByText("提前提醒时间")).toBeInTheDocument();
    });

    it("显示所有预设时间选项", () => {
      render(<ReminderSettings value={[]} onChange={mockOnChange} />);

      expect(screen.getByText("5分钟")).toBeInTheDocument();
      expect(screen.getByText("15分钟")).toBeInTheDocument();
      expect(screen.getByText("30分钟")).toBeInTheDocument();
      expect(screen.getByText("1小时")).toBeInTheDocument();
      expect(screen.getByText("1天")).toBeInTheDocument();
      expect(screen.getByText("自定义")).toBeInTheDocument();
    });
  });

  describe("预设时间选择", () => {
    it("点击 checkbox 切换选中状态", () => {
      render(<ReminderSettings value={[]} onChange={mockOnChange} />);

      // 点击 "5分钟" 选项
      const fiveMinButton = screen.getByText("5分钟").closest("button");
      fireEvent.click(fiveMinButton!);

      // onChange 应该被调用，新增 5 分钟
      expect(mockOnChange).toHaveBeenCalledWith([5]);
    });

    it("再次点击取消选中", () => {
      render(<ReminderSettings value={[5]} onChange={mockOnChange} />);

      // 点击已选中的 "5分钟" 选项
      const fiveMinButton = screen.getByText("5分钟").closest("button");
      fireEvent.click(fiveMinButton!);

      // onChange 应该被调用，移除 5 分钟
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it("支持多选", () => {
      render(<ReminderSettings value={[5]} onChange={mockOnChange} />);

      // 点击 "15分钟" 选项
      const fifteenMinButton = screen.getByText("15分钟").closest("button");
      fireEvent.click(fifteenMinButton!);

      // onChange 应该被调用，添加 15 分钟
      expect(mockOnChange).toHaveBeenCalledWith([5, 15]);
    });
  });

  describe("自定义时间", () => {
    it("打开自定义时间弹窗", () => {
      render(<ReminderSettings value={[]} onChange={mockOnChange} />);

      // 点击自定义按钮
      const customButton = screen.getByText("自定义");
      fireEvent.click(customButton);

      // 弹窗应该打开
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "自定义提醒时间",
      );
    });

    it("输入自定义时间并保存", async () => {
      render(<ReminderSettings value={[]} onChange={mockOnChange} />);

      // 打开自定义弹窗
      const customButton = screen.getByText("自定义");
      fireEvent.click(customButton);

      // 输入时间
      const input = screen.getByTestId("input");
      fireEvent.change(input, { target: { value: "45" } });

      // 点击确定按钮
      const confirmButton = screen.getByText("确定");
      fireEvent.click(confirmButton);

      // onChange 应该被调用
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([45]);
      });
    });

    it("输入无效时间不保存", async () => {
      render(<ReminderSettings value={[]} onChange={mockOnChange} />);

      // 打开自定义弹窗
      const customButton = screen.getByText("自定义");
      fireEvent.click(customButton);

      // 输入无效时间（0 或负数）
      const input = screen.getByTestId("input");
      fireEvent.change(input, { target: { value: "0" } });

      // 点击确定按钮
      const confirmButton = screen.getByText("确定");
      fireEvent.click(confirmButton);

      // onChange 不应该被调用
      await waitFor(() => {
        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });

    it("取消按钮关闭弹窗", () => {
      render(<ReminderSettings value={[]} onChange={mockOnChange} />);

      // 打开自定义弹窗
      const customButton = screen.getByText("自定义");
      fireEvent.click(customButton);

      // 点击取消按钮
      const cancelButton = screen.getByText("取消");
      fireEvent.click(cancelButton);

      // 弹窗应该关闭
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  describe("onChange 回调", () => {
    it("选择时间后触发 onChange", () => {
      render(<ReminderSettings value={[]} onChange={mockOnChange} />);

      // 选择多个时间
      fireEvent.click(screen.getByText("5分钟").closest("button")!);
      fireEvent.click(screen.getByText("1小时").closest("button")!);

      // onChange 累计被调用
      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });
  });

  describe("compact 模式", () => {
    it("紧凑模式渲染正确", () => {
      const { container } = render(
        <ReminderSettings value={[5]} onChange={mockOnChange} compact />,
      );

      // 验证组件渲染
      expect(screen.getByText("提醒设置")).toBeInTheDocument();
      // compact 模式使用 grid-cols-3，非 compact 使用 grid-cols-2
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("grid-cols-3");
    });
  });

  describe("选中数量显示", () => {
    it("显示已选中的数量", () => {
      render(<ReminderSettings value={[5, 15]} onChange={mockOnChange} />);

      // 应该显示选中数量徽章
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("未选中时不显示数量", () => {
      render(<ReminderSettings value={[]} onChange={mockOnChange} />);

      // 不应该显示数量徽章（只有选中时才会渲染）
      const badges = screen.queryAllByText(/^\d+$/);
      expect(badges.length).toBe(0);
    });
  });

  describe("自定义时间显示和删除", () => {
    it("显示已添加的自定义时间", () => {
      render(
        <ReminderSettings
          value={[5, 45]} // 45 不是预设时间
          onChange={mockOnChange}
        />,
      );

      // 应该显示自定义时间区域
      expect(screen.getByText("自定义时间")).toBeInTheDocument();
      expect(screen.getByText("提前45分钟")).toBeInTheDocument();
    });

    it("点击删除自定义时间", () => {
      render(<ReminderSettings value={[5, 45]} onChange={mockOnChange} />);

      // 点击删除按钮
      const deleteButton = screen.getByText("提前45分钟").closest("button");
      fireEvent.click(deleteButton!);

      // onChange 应该被调用，移除 45
      expect(mockOnChange).toHaveBeenCalledWith([5]);
    });
  });
});
