import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeSelector } from "../ThemeSelector";
import type { ThemeId } from "@/hooks/useTheme";

// Create mock functions
const mockSetTheme = vi.fn();
const mockSetGlassBlur = vi.fn();
const mockSetGlassOpacity = vi.fn();
const mockToggleTheme = vi.fn();

// Mock useTheme hook
vi.mock("@/hooks/useTheme", () => ({
  useTheme: vi.fn(() => ({
    theme: "light" as ThemeId,
    setTheme: mockSetTheme,
    toggleTheme: mockToggleTheme,
    isDark: false,
    isSystem: false,
    isInitialized: true,
  })),
  ThemeId: {} as ThemeId,
}));

// Mock useGlassSettings hook
vi.mock("@/hooks/useGlassSettings", () => ({
  useGlassSettings: vi.fn(() => ({
    glassBlur: 10,
    glassOpacity: 80,
    setGlassBlur: mockSetGlassBlur,
    setGlassOpacity: mockSetGlassOpacity,
  })),
}));

// Mock themes registry
vi.mock("@/lib/themes/registry", () => ({
  themeListWithSystem: [
    {
      id: "system",
      name: "System",
      icon: "🖥️",
      colors: { bg: "#fff", border: "#ddd" },
    },
    {
      id: "light",
      name: "Light",
      icon: "☀️",
      colors: { bg: "#fff", border: "#ddd" },
    },
    {
      id: "dark",
      name: "Dark",
      icon: "🌙",
      colors: { bg: "#222", border: "#444" },
    },
    {
      id: "glass",
      name: "Glass",
      icon: "🔮",
      colors: { bg: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.3)" },
    },
  ],
}));

// Mock Modal component
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

// Mock Button component
vi.mock("@/components/ui/Button", () => ({
  Button: vi.fn(({ children, onClick, variant, ...props }) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  )),
}));

// Import after mocks
import { useTheme } from "@/hooks/useTheme";
import { useGlassSettings } from "@/hooks/useGlassSettings";

describe("ThemeSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "light" as ThemeId,
      setTheme: mockSetTheme,
      toggleTheme: mockToggleTheme,
      isDark: false,
      isSystem: false,
      isInitialized: true,
    });
    (useGlassSettings as ReturnType<typeof vi.fn>).mockReturnValue({
      glassBlur: 10,
      glassOpacity: 80,
      setGlassBlur: mockSetGlassBlur,
      setGlassOpacity: mockSetGlassOpacity,
    });
  });

  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(<ThemeSelector />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("渲染主题选择器容器", () => {
      render(<ThemeSelector />);
      const container = document.querySelector("[data-theme-selector]");
      expect(container).toBeInTheDocument();
    });

    it("渲染所有主题按钮", () => {
      render(<ThemeSelector />);
      // Check for theme names in the rendered output
      expect(screen.getByText("System")).toBeInTheDocument();
      expect(screen.getByText("Light")).toBeInTheDocument();
      expect(screen.getByText("Dark")).toBeInTheDocument();
      expect(screen.getByText("Glass")).toBeInTheDocument();
    });
  });

  describe("主题切换", () => {
    it("点击非当前主题时调用 setTheme", () => {
      render(<ThemeSelector />);

      // 点击 Dark 主题按钮
      const darkButton = screen.getByText("Dark").closest("button");
      fireEvent.click(darkButton!);

      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    it("点击当前主题时打开设置弹窗", () => {
      render(<ThemeSelector />);

      // 点击当前选中的 Light 主题
      const lightButton = screen.getByText("Light").closest("button");
      fireEvent.click(lightButton!);

      // 应该打开 Modal
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("点击 Glass 主题时打开设置弹窗", () => {
      // 设置当前主题为 Glass
      (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: "glass" as ThemeId,
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
        isDark: false,
        isSystem: false,
        isInitialized: true,
      });

      render(<ThemeSelector />);

      // 点击当前选中的 Glass 主题
      const glassButton = screen.getByText("Glass").closest("button");
      fireEvent.click(glassButton!);

      // 应该打开 Modal
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("切换到不同主题时保持弹窗状态（内部状态）", () => {
      // 先设置为 glass 以便打开弹窗
      (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: "glass" as ThemeId,
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
        isDark: false,
        isSystem: false,
        isInitialized: true,
      });

      const { rerender } = render(<ThemeSelector />);

      // 点击 Glass 主题打开弹窗
      const glassButton = screen.getByText("Glass").closest("button");
      fireEvent.click(glassButton!);
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      // 切换到其他主题 - 弹窗状态由组件内部管理
      // 由于 showGlassModal 是内部状态，不会自动关闭
      (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: "dark" as ThemeId,
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
        isDark: true,
        isSystem: false,
        isInitialized: true,
      });

      rerender(<ThemeSelector />);

      // 注意：showGlassModal 是组件内部状态，主题切换不会自动关闭弹窗
      // 这个测试验证组件渲染正常
      expect(screen.queryByTestId("modal")).toBeInTheDocument();
    });
  });

  describe("当前主题高亮", () => {
    it("当前主题按钮有 active 样式", () => {
      // 设置当前主题为 dark
      (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: "dark" as ThemeId,
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
        isDark: true,
        isSystem: false,
        isInitialized: true,
      });

      render(<ThemeSelector />);

      // Dark 按钮应该有 active 样式类
      const darkButton = screen.getByText("Dark").closest("button");
      expect(darkButton).toHaveClass("border-[var(--color-primary)]");
    });

    it("非当前主题没有 active 样式", () => {
      // 设置当前主题为 light
      (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: "light" as ThemeId,
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
        isDark: false,
        isSystem: false,
        isInitialized: true,
      });

      render(<ThemeSelector />);

      // Dark 按钮不应该有 active 样式类
      const darkButton = screen.getByText("Dark").closest("button");
      expect(darkButton).not.toHaveClass("border-[var(--color-primary)]");
    });
  });

  describe("弹窗功能", () => {
    it("弹窗显示标题 Theme Settings", () => {
      // 设置当前主题为 glass 以打开弹窗
      (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: "glass" as ThemeId,
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
        isDark: false,
        isSystem: false,
        isInitialized: true,
      });

      render(<ThemeSelector />);

      // 点击 Glass 主题
      const glassButton = screen.getByText("Glass").closest("button");
      fireEvent.click(glassButton!);

      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "Theme Settings",
      );
    });

    it("点击关闭按钮关闭弹窗", () => {
      // 设置当前主题为 glass 以打开弹窗
      (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
        theme: "glass" as ThemeId,
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
        isDark: false,
        isSystem: false,
        isInitialized: true,
      });

      render(<ThemeSelector />);

      // 点击 Glass 主题打开弹窗
      const glassButton = screen.getByText("Glass").closest("button");
      fireEvent.click(glassButton!);
      expect(screen.getByTestId("modal")).toBeInTheDocument();

      // 点击关闭按钮
      const closeButton = screen.getByTestId("modal-close");
      fireEvent.click(closeButton);

      // 弹窗应该关闭
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  describe("按钮焦点处理", () => {
    it("点击后按钮失去焦点", () => {
      render(<ThemeSelector />);

      const darkButton = screen.getByText("Dark").closest("button");

      // 模拟点击事件
      fireEvent.click(darkButton!);

      // 按钮应该失去焦点
      expect(document.activeElement).not.toBe(darkButton);
    });
  });
});
