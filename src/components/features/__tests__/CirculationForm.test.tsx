import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CirculationForm } from "../CirculationForm";
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
  Button: vi.fn(({ children, onClick, variant, disabled, ...props }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )),
}));

vi.mock("@/components/ui/Input", () => ({
  Input: vi.fn(
    ({ value, onChange, label, type, placeholder, min, ...props }) => (
      <div>
        {label && <label data-testid="input-label">{label}</label>}
        <input
          data-testid="input"
          type={type || "text"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          {...props}
        />
      </div>
    ),
  ),
}));

const mockCirculation: Circulation = {
  id: "circulation-1",
  title: "每日阅读",
  content: "每天阅读30分钟",
  circulation_type: "periodic",
  frequency: "daily",
  frequency_config: null,
  target_count: null,
  current_count: 15,
  streak_count: 5,
  best_streak: 10,
  last_completed_at: "2024-01-15",
  status: "active",
  created_at: "2024-01-01",
  updated_at: "2024-01-15",
};

describe("CirculationForm", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表单渲染", () => {
    it("正确渲染新建表单", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-title")).toHaveTextContent("新建打卡项");
    });

    it("正确渲染编辑表单", () => {
      render(
        <CirculationForm
          open={true}
          editingCirculation={mockCirculation}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("modal-title")).toHaveTextContent("编辑打卡项");
    });

    it("显示标题输入框", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByPlaceholderText("输入打卡项名称")).toBeInTheDocument();
    });

    it("显示类型选择按钮", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByText("周期打卡")).toBeInTheDocument();
      expect(screen.getByText("计数打卡")).toBeInTheDocument();
    });

    it("默认选择周期打卡", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByText("频率")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("类型切换", () => {
    it("点击计数打卡，显示目标次数输入框", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const countButton = screen.getByText("计数打卡");
      fireEvent.click(countButton);

      expect(screen.getByText("目标次数 (可选)")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("不填则无限")).toBeInTheDocument();
    });

    it("点击周期打卡，隐藏目标次数输入框", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const countButton = screen.getByText("计数打卡");
      fireEvent.click(countButton);

      const periodicButton = screen.getByText("周期打卡");
      fireEvent.click(periodicButton);

      expect(screen.queryByText("目标次数 (可选)")).not.toBeInTheDocument();
    });
  });

  describe("频率选择", () => {
    it("显示频率下拉选项", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent("每日");
      expect(options[1]).toHaveTextContent("每周");
      expect(options[2]).toHaveTextContent("每月");
    });

    it("可以选择不同频率", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "weekly" } });

      expect(select).toHaveValue("weekly");
    });
  });

  describe("目标次数输入", () => {
    it("可以输入目标次数", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const countButton = screen.getByText("计数打卡");
      fireEvent.click(countButton);

      const input = screen.getByPlaceholderText("不填则无限");
      fireEvent.change(input, { target: { value: "100" } });

      expect(input).toHaveValue(100);
    });
  });

  describe("表单提交", () => {
    it("填写标题后可以保存", async () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText("输入打卡项名称");
      fireEvent.change(titleInput, { target: { value: "每日运动" } });

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: "每日运动",
          circulation_type: "periodic",
          frequency: "daily",
          target_count: undefined,
        });
      });
    });

    it("未填写标题时保存按钮禁用", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const saveButton = screen.getByText("保存") as HTMLButtonElement;
      expect(saveButton).toBeDisabled();
    });

    it("保存周期打卡时包含频率", async () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText("输入打卡项名称");
      fireEvent.change(titleInput, { target: { value: "每日阅读" } });

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "weekly" } });

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: "每日阅读",
          circulation_type: "periodic",
          frequency: "weekly",
          target_count: undefined,
        });
      });
    });

    it("保存计数打卡时包含目标次数", async () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText("输入打卡项名称");
      fireEvent.change(titleInput, { target: { value: "喝水" } });

      const countButton = screen.getByText("计数打卡");
      fireEvent.click(countButton);

      const input = screen.getByPlaceholderText("不填则无限");
      fireEvent.change(input, { target: { value: "8" } });

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: "喝水",
          circulation_type: "count",
          frequency: undefined,
          target_count: 8,
        });
      });
    });
  });

  describe("取消操作", () => {
    it("点击取消按钮关闭表单", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnClose}
        />,
      );

      const cancelButton = screen.getByText("取消");
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("点击关闭按钮关闭表单", () => {
      render(
        <CirculationForm
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const closeButton = screen.getByTestId("modal-close");
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("编辑模式", () => {
    it("编辑时显示已有数据", () => {
      render(
        <CirculationForm
          open={true}
          editingCirculation={mockCirculation}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText("输入打卡项名称");
      expect(titleInput).toHaveValue("每日阅读");
    });

    it("编辑时保存更新后的数据", async () => {
      render(
        <CirculationForm
          open={true}
          editingCirculation={mockCirculation}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const titleInput = screen.getByPlaceholderText("输入打卡项名称");
      fireEvent.change(titleInput, { target: { value: "每日阅读更新" } });

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: "每日阅读更新",
          circulation_type: "periodic",
          frequency: "daily",
          target_count: undefined,
        });
      });
    });

    it("编辑计数打卡时显示目标次数", () => {
      const countCirculation: Circulation = {
        ...mockCirculation,
        circulation_type: "count",
        target_count: 100,
      };

      render(
        <CirculationForm
          open={true}
          editingCirculation={countCirculation}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
      );

      const input = screen.getByPlaceholderText("不填则无限");
      expect(input).toHaveValue(100);
    });
  });
});
