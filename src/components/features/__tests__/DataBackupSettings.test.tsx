import { render, screen, fireEvent } from "@testing-library/react";
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
      ...props
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
      className?: string;
    }) => (
      <button
        data-testid="button"
        data-variant={variant}
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    ),
  ),
}));

// Mock Input component
vi.mock("@/components/ui/Input", () => ({
  Input: vi.fn(
    ({
      value,
      onChange,
      placeholder,
      className,
      ...props
    }: {
      value: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      placeholder?: string;
      className?: string;
    }) => (
      <input
        data-testid="input"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        {...props}
      />
    ),
  ),
}));

describe("DataBackupSettings", () => {
  const mockOnAutoBackupChange = vi.fn();
  const mockOnBackupPathChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("渲染自动备份开关", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      expect(screen.getByText("自动备份")).toBeInTheDocument();
    });

    it("渲染备份路径输入框", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      expect(screen.getByText("备份路径")).toBeInTheDocument();
    });

    it("渲染导出和导入按钮", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      expect(screen.getByText("导出数据 (JSON)")).toBeInTheDocument();
      expect(screen.getByText("导入数据")).toBeInTheDocument();
    });
  });

  describe("自动备份开关", () => {
    it("autoBackup=true 时开关选中", () => {
      render(
        <DataBackupSettings
          autoBackup={true}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("autoBackup=false 时开关未选中", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it("点击开关触发 onAutoBackupChange", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockOnAutoBackupChange).toHaveBeenCalledWith(true);
    });

    it("显示自动备份说明", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      expect(screen.getByText("每次打开应用时自动备份")).toBeInTheDocument();
    });
  });

  describe("备份路径", () => {
    it("显示当前备份路径", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/custom/backup/path"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const input = screen.getByTestId("input") as HTMLInputElement;
      expect(input.value).toBe("/custom/backup/path");
    });

    it("显示正确的 placeholder", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath=""
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const input = screen.getByTestId("input") as HTMLInputElement;
      expect(input.placeholder).toBe("选择备份目录...");
    });

    it("输入变化时触发 onBackupPathChange", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath=""
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const input = screen.getByTestId("input");
      fireEvent.change(input, { target: { value: "/new/path" } });

      expect(mockOnBackupPathChange).toHaveBeenCalledWith("/new/path");
    });

    it("渲染浏览按钮", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      expect(screen.getByText("浏览")).toBeInTheDocument();
    });
  });

  describe("导出导入按钮", () => {
    it("导出按钮有 flex-1 className", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const exportButton = screen.getByText("导出数据 (JSON)");
      expect(exportButton).toHaveClass("flex-1");
    });

    it("导入按钮有 flex-1 className", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const importButton = screen.getByText("导入数据");
      expect(importButton).toHaveClass("flex-1");
    });

    it("导出按钮是 secondary 变体", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const exportButton = screen.getByText("导出数据 (JSON)");
      expect(exportButton).toHaveAttribute("data-variant", "secondary");
    });

    it("导入按钮是 secondary 变体", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const importButton = screen.getByText("导入数据");
      expect(importButton).toHaveAttribute("data-variant", "secondary");
    });
  });

  describe("布局测试", () => {
    it("使用 space-y-4 布局", () => {
      const { container } = render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass("space-y-4");
    });

    it("备份路径部分有 flex gap-2", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath="/backup"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      const buttonsContainer =
        screen.getByText("导出数据 (JSON)").parentElement;
      expect(buttonsContainer).toHaveClass("flex");
      expect(buttonsContainer).toHaveClass("gap-3");
    });
  });

  describe("组合场景", () => {
    it("完整配置渲染正确", () => {
      render(
        <DataBackupSettings
          autoBackup={true}
          backupPath="/home/user/backups"
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      // 验证所有元素都存在
      expect(screen.getByText("自动备份")).toBeInTheDocument();
      expect(screen.getByText("备份路径")).toBeInTheDocument();
      expect(screen.getByText("导出数据 (JSON)")).toBeInTheDocument();
      expect(screen.getByText("导入数据")).toBeInTheDocument();

      // 验证开关状态
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);

      // 验证输入框值
      const input = screen.getByTestId("input") as HTMLInputElement;
      expect(input.value).toBe("/home/user/backups");
    });

    it("空配置渲染正确", () => {
      render(
        <DataBackupSettings
          autoBackup={false}
          backupPath=""
          onAutoBackupChange={mockOnAutoBackupChange}
          onBackupPathChange={mockOnBackupPathChange}
        />,
      );

      // 验证所有元素都存在
      expect(screen.getByText("自动备份")).toBeInTheDocument();
      expect(screen.getByText("备份路径")).toBeInTheDocument();
      expect(screen.getByText("导出数据 (JSON)")).toBeInTheDocument();
      expect(screen.getByText("导入数据")).toBeInTheDocument();

      // 验证开关状态
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      // 验证输入框为空
      const input = screen.getByTestId("input") as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });
});
