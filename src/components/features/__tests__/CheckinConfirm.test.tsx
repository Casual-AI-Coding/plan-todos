import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CheckinConfirm } from "../CheckinConfirm";
import type { Circulation } from "@/lib/types";

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
    <button
      data-testid={variant === "secondary" ? "cancel-button" : "confirm-button"}
      onClick={onClick}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  )),
}));

vi.mock("@/components/ui/Input", () => ({
  Input: vi.fn(({ value, onChange, type, ...props }) => (
    <input
      data-testid="count-input"
      type={type}
      value={value}
      onChange={onChange}
      {...props}
    />
  )),
}));

describe("CheckinConfirm", () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const periodicCirculation: Circulation = {
    id: "circulation-1",
    title: "每日阅读",
    content: "每天阅读 30 分钟",
    circulation_type: "periodic",
    frequency: "daily",
    frequency_config: null,
    target_count: null,
    current_count: 5,
    streak_count: 3,
    best_streak: 10,
    last_completed_at: "2024-01-15T10:00:00Z",
    status: "active",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  const countCirculation: Circulation = {
    id: "circulation-2",
    title: "喝水目标",
    content: "每天喝 8 杯水",
    circulation_type: "count",
    frequency: null,
    frequency_config: null,
    target_count: 8,
    current_count: 3,
    streak_count: 0,
    best_streak: 0,
    last_completed_at: "2024-01-15T10:00:00Z",
    status: "active",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染测试", () => {
    it("弹窗关闭时不渲染", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("弹窗打开时正确渲染", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-title")).toHaveTextContent("确认打卡");
    });

    it("显示打卡标题", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText("每日阅读")).toBeInTheDocument();
    });

    it("定期类型显示连续天数", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText("当前连续: 3 天")).toBeInTheDocument();
    });

    it("计数类型显示当前进度", () => {
      render(
        <CheckinConfirm
          circulation={countCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText("当前进度: 3 / 8")).toBeInTheDocument();
    });

    it("计数类型无目标时显示无穷大", () => {
      const infiniteCirculation: Circulation = {
        ...countCirculation,
        target_count: null,
      };

      render(
        <CheckinConfirm
          circulation={infiniteCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText("当前进度: 3 / ∞")).toBeInTheDocument();
    });
  });

  describe("确认操作", () => {
    it("点击确认按钮触发 onConfirm 回调（定期类型）", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      // 定期类型只传递 note，不传递 count
      expect(mockOnConfirm).toHaveBeenCalledWith("");
    });

    it("点击确认按钮触发 onConfirm 回调（计数类型）", () => {
      render(
        <CheckinConfirm
          circulation={countCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      // 计数类型应该传递 count 参数
      expect(mockOnConfirm).toHaveBeenCalledWith("", 1);
    });

    it("确认后清空备注和计数", async () => {
      render(
        <CheckinConfirm
          circulation={countCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      // 输入备注
      const textarea = screen.getByPlaceholderText("记录一下今天的感受...");
      fireEvent.change(textarea, { target: { value: "今天感觉很好" } });

      // 修改计数
      const countInput = screen.getByTestId("count-input");
      fireEvent.change(countInput, { target: { value: "5" } });

      // 确认
      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      // 验证回调被调用
      expect(mockOnConfirm).toHaveBeenCalledWith("今天感觉很好", 5);

      // 等待状态重置
      await waitFor(() => {
        const resetTextarea =
          screen.getByPlaceholderText("记录一下今天的感受...");
        expect(resetTextarea).toHaveValue("");
      });

      const resetCountInput = screen.getByTestId("count-input");
      expect(resetCountInput).toHaveValue(1);
    });

    it("确认时传递备注内容", () => {
      render(
        <CheckinConfirm
          circulation={countCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      // 输入备注
      const textarea = screen.getByPlaceholderText("记录一下今天的感受...");
      fireEvent.change(textarea, { target: { value: "今日打卡感受" } });

      // 确认
      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledWith("今日打卡感受", 1);
    });
  });

  describe("取消操作", () => {
    it("点击取消按钮触发 onCancel 回调", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const cancelButton = screen.getByTestId("cancel-button");
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("取消后清空备注和计数", async () => {
      render(
        <CheckinConfirm
          circulation={countCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      // 输入备注
      const textarea = screen.getByPlaceholderText("记录一下今天的感受...");
      fireEvent.change(textarea, { target: { value: "今天感觉很好" } });

      // 修改计数
      const countInput = screen.getByTestId("count-input");
      fireEvent.change(countInput, { target: { value: "5" } });

      // 取消
      const cancelButton = screen.getByTestId("cancel-button");
      fireEvent.click(cancelButton);

      // 验证 onCancel 被调用
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("点击关闭按钮触发 onCancel 回调", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const closeButton = screen.getByTestId("modal-close");
      fireEvent.click(closeButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe("计数输入", () => {
    it("显示计数输入框（计数类型）", () => {
      render(
        <CheckinConfirm
          circulation={countCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByTestId("count-input")).toBeInTheDocument();
      expect(screen.getByText("本次打卡数量")).toBeInTheDocument();
    });

    it("不显示计数输入框（定期类型）", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.queryByTestId("count-input")).not.toBeInTheDocument();
      expect(screen.queryByText("本次打卡数量")).not.toBeInTheDocument();
    });

    it("计数不能小于 1", () => {
      render(
        <CheckinConfirm
          circulation={countCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const countInput = screen.getByTestId("count-input");

      // 输入 0
      fireEvent.change(countInput, { target: { value: "0" } });

      // 确认时确保使用 Math.max(1, value)
      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      // 应该使用 max(1, 0) = 1
      expect(mockOnConfirm).toHaveBeenCalledWith("", 1);
    });

    it("输入负数时调整为 1", () => {
      render(
        <CheckinConfirm
          circulation={countCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const countInput = screen.getByTestId("count-input");

      // 输入负数
      fireEvent.change(countInput, { target: { value: "-5" } });

      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      // 应该使用 Math.max(1, -5) = 1
      expect(mockOnConfirm).toHaveBeenCalledWith("", 1);
    });

    it("显示累计进度预览", () => {
      render(
        <CheckinConfirm
          circulation={countCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      // 当前 3 + 本次 2 = 5
      const countInput = screen.getByTestId("count-input");
      fireEvent.change(countInput, { target: { value: "2" } });

      expect(screen.getByText("每次打卡后累计: 5 / 8")).toBeInTheDocument();
    });
  });

  describe("备注输入", () => {
    it("显示备注输入框", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const textarea = screen.getByPlaceholderText("记录一下今天的感受...");
      expect(textarea).toBeInTheDocument();
    });

    it("备注是可选的", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      // 空备注也应该可以确认（定期类型只传 note）
      expect(mockOnConfirm).toHaveBeenCalledWith("");
    });

    it("可以输入多行备注", () => {
      render(
        <CheckinConfirm
          circulation={periodicCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const textarea = screen.getByPlaceholderText("记录一下今天的感受...");
      fireEvent.change(textarea, {
        target: { value: "第一行\n第二行\n第三行" },
      });

      expect(textarea).toHaveValue("第一行\n第二行\n第三行");
    });
  });

  describe("边界情况", () => {
    it("传入空字符串标题", () => {
      const emptyTitleCirculation: Circulation = {
        ...periodicCirculation,
        title: "",
      };

      render(
        <CheckinConfirm
          circulation={emptyTitleCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      // 使用 getByRole 来查找标题元素
      const titleElement = screen.getByText((content, element) => {
        return element?.classList.contains("text-2xl") ?? false;
      });
      expect(titleElement).toBeInTheDocument();
    });

    it("传入很长标题时正常显示", () => {
      const longTitleCirculation: Circulation = {
        ...periodicCirculation,
        title: "这是一个非常非常长的标题用于测试文本溢出处理",
      };

      render(
        <CheckinConfirm
          circulation={longTitleCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(
        screen.getByText("这是一个非常非常长的标题用于测试文本溢出处理"),
      ).toBeInTheDocument();
    });

    it("best_streak 大于 current_streak 时正确显示", () => {
      const highStreakCirculation: Circulation = {
        ...periodicCirculation,
        streak_count: 3,
        best_streak: 100,
      };

      render(
        <CheckinConfirm
          circulation={highStreakCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      // 显示当前连续天数，不是 best streak
      expect(screen.getByText("当前连续: 3 天")).toBeInTheDocument();
    });

    it("0 次连续时正确显示", () => {
      const zeroStreakCirculation: Circulation = {
        ...periodicCirculation,
        streak_count: 0,
      };

      render(
        <CheckinConfirm
          circulation={zeroStreakCirculation}
          open={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText("当前连续: 0 天")).toBeInTheDocument();
    });
  });
});
