import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LanguageSelector } from "../LanguageSelector";

describe("LanguageSelector", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(
        <LanguageSelector value="zh" onChange={mockOnChange} />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("渲染语言选择下拉框", () => {
      render(<LanguageSelector value="zh" onChange={mockOnChange} />);
      const select = screen.getByLabelText("语言");
      expect(select).toBeInTheDocument();
    });

    it("显示正确的 label 文本", () => {
      render(<LanguageSelector value="zh" onChange={mockOnChange} />);
      expect(screen.getByText("语言")).toBeInTheDocument();
    });

    it("显示中文和英文两个选项", () => {
      render(<LanguageSelector value="zh" onChange={mockOnChange} />);
      expect(screen.getByText("中文")).toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
    });
  });

  describe("状态测试", () => {
    it("初始值为中文时显示中文", () => {
      render(<LanguageSelector value="zh" onChange={mockOnChange} />);
      const select = screen.getByLabelText("语言") as HTMLSelectElement;
      expect(select.value).toBe("zh");
    });

    it("初始值为英文时显示英文", () => {
      render(<LanguageSelector value="en" onChange={mockOnChange} />);
      const select = screen.getByLabelText("语言") as HTMLSelectElement;
      expect(select.value).toBe("en");
    });
  });

  describe("交互测试", () => {
    it("选择中文时调用 onChange", () => {
      render(<LanguageSelector value="en" onChange={mockOnChange} />);
      const select = screen.getByLabelText("语言");

      fireEvent.change(select, { target: { value: "zh" } });

      expect(mockOnChange).toHaveBeenCalledWith("zh");
    });

    it("选择英文时调用 onChange", () => {
      render(<LanguageSelector value="zh" onChange={mockOnChange} />);
      const select = screen.getByLabelText("语言");

      fireEvent.change(select, { target: { value: "en" } });

      expect(mockOnChange).toHaveBeenCalledWith("en");
    });

    it("多次切换调用多次 onChange", () => {
      render(<LanguageSelector value="zh" onChange={mockOnChange} />);
      const select = screen.getByLabelText("语言");

      fireEvent.change(select, { target: { value: "en" } });
      fireEvent.change(select, { target: { value: "zh" } });

      expect(mockOnChange).toHaveBeenCalledTimes(2);
      expect(mockOnChange).toHaveBeenNthCalledWith(1, "en");
      expect(mockOnChange).toHaveBeenNthCalledWith(2, "zh");
    });
  });

  describe("无障碍测试", () => {
    it("select 元素有正确的 id", () => {
      render(<LanguageSelector value="zh" onChange={mockOnChange} />);
      const select = screen.getByLabelText("语言");
      expect(select.id).toBe("language-select");
    });

    it("label 正确关联到 select", () => {
      render(<LanguageSelector value="zh" onChange={mockOnChange} />);
      const label = screen.getByText("语言");
      expect(label.getAttribute("for")).toBe("language-select");
    });
  });

  describe("组合场景", () => {
    it("从中文切换到英文", () => {
      render(<LanguageSelector value="zh" onChange={mockOnChange} />);

      const select = screen.getByLabelText("语言");
      expect(select).toHaveValue("zh");

      fireEvent.change(select, { target: { value: "en" } });

      expect(mockOnChange).toHaveBeenCalledWith("en");
      expect(select).toHaveValue("en");
    });

    it("从英文切换到中文", () => {
      render(<LanguageSelector value="en" onChange={mockOnChange} />);

      const select = screen.getByLabelText("语言");
      expect(select).toHaveValue("en");

      fireEvent.change(select, { target: { value: "zh" } });

      expect(mockOnChange).toHaveBeenCalledWith("zh");
      expect(select).toHaveValue("zh");
    });
  });
});
