import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataBackupSettings } from "../DataBackupSettings";

// Mock Button component
vi.mock("@/components/ui/Button", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      variant,
      className,
      disabled,
      ...props
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
      className?: string;
      disabled?: boolean;
    }) => (
      <button
        data-testid="button"
        data-variant={variant}
        className={className}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    ),
  ),
}));

describe("DataBackupSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(<DataBackupSettings />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("渲染导出和导入按钮", () => {
      render(<DataBackupSettings />);

      expect(screen.getByText("导出数据 (JSON)")).toBeInTheDocument();
      expect(screen.getByText("导入数据")).toBeInTheDocument();
    });

    it("没有 onExport 时导出按钮禁用", () => {
      render(<DataBackupSettings />);

      const exportButton = screen.getByText("导出数据 (JSON)");
      expect(exportButton).toBeDisabled();
    });

    it("没有 onImport 时导入按钮禁用", () => {
      render(<DataBackupSettings />);

      const importButton = screen.getByText("导入数据");
      expect(importButton).toBeDisabled();
    });

    it("提供回调时按钮可用", () => {
      render(
        <DataBackupSettings
          onExport={vi.fn()}
          onImport={vi.fn()}
        />,
      );

      expect(screen.getByText("导出数据 (JSON)")).not.toBeDisabled();
      expect(screen.getByText("导入数据")).not.toBeDisabled();
    });
  });

  describe("导出功能", () => {
    it("点击导出按钮调用 onExport", async () => {
      const mockExport = vi.fn().mockResolvedValue(undefined);
      render(<DataBackupSettings onExport={mockExport} />);

      fireEvent.click(screen.getByText("导出数据 (JSON)"));

      await waitFor(() => {
        expect(mockExport).toHaveBeenCalledTimes(1);
      });
    });

    it("导出成功显示成功消息", async () => {
      const mockExport = vi.fn().mockResolvedValue(undefined);
      render(<DataBackupSettings onExport={mockExport} />);

      fireEvent.click(screen.getByText("导出数据 (JSON)"));

      await waitFor(() => {
        expect(screen.getByText("导出成功")).toBeInTheDocument();
      });
    });

    it("导出失败显示错误消息", async () => {
      const mockExport = vi
        .fn()
        .mockRejectedValue(new Error("导出出错"));
      render(<DataBackupSettings onExport={mockExport} />);

      fireEvent.click(screen.getByText("导出数据 (JSON)"));

      await waitFor(() => {
        expect(screen.getByText("导出失败: 导出出错")).toBeInTheDocument();
      });
    });

    it("导出中显示加载状态", async () => {
      let resolveExport: () => void;
      const exportPromise = new Promise<void>((resolve) => {
        resolveExport = resolve;
      });
      const mockExport = vi.fn().mockReturnValue(exportPromise);
      render(<DataBackupSettings onExport={mockExport} />);

      fireEvent.click(screen.getByText("导出数据 (JSON)"));

      await waitFor(() => {
        expect(screen.getByText("导出中...")).toBeInTheDocument();
      });

      resolveExport!();
    });
  });

  describe("导入功能", () => {
    it("导入按钮点击触发文件选择", () => {
      const mockImport = vi.fn();
      render(<DataBackupSettings onImport={mockImport} />);

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, "click");

      fireEvent.click(screen.getByText("导入数据"));

      expect(clickSpy).toHaveBeenCalled();
    });

    it("没有 onImport 时导入按钮禁用", () => {
      render(<DataBackupSettings />);

      const importButton = screen.getByText("导入数据");
      expect(importButton).toBeDisabled();
    });
  });

  describe("布局测试", () => {
    it("使用 space-y-3 布局", () => {
      const { container } = render(<DataBackupSettings />);

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass("space-y-3");
    });

    it("导出按钮是 secondary 变体", () => {
      render(<DataBackupSettings />);

      const exportButton = screen.getByText("导出数据 (JSON)");
      expect(exportButton).toHaveAttribute("data-variant", "secondary");
    });

    it("导入按钮是 secondary 变体", () => {
      render(<DataBackupSettings />);

      const importButton = screen.getByText("导入数据");
      expect(importButton).toHaveAttribute("data-variant", "secondary");
    });
  });
});
