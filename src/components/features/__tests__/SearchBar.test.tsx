import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchBar } from "../SearchBar";
import type { SearchResult } from "@/lib/types";

// Mock searchAll API
vi.mock("@/lib/api", () => ({
  searchAll: vi.fn(),
}));

// Import mock
import { searchAll } from "@/lib/api";

describe("SearchBar", () => {
  const mockOnResultClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(
        <SearchBar onResultClick={mockOnResultClick} />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("渲染搜索输入框", () => {
      render(<SearchBar onResultClick={mockOnResultClick} />);
      const input = screen.getByLabelText("搜索");
      expect(input).toBeInTheDocument();
    });

    it("显示正确的 placeholder", () => {
      render(<SearchBar onResultClick={mockOnResultClick} />);
      const input = screen.getByPlaceholderText("搜索...");
      expect(input).toBeInTheDocument();
    });

    it("输入框初始为空", () => {
      render(<SearchBar onResultClick={mockOnResultClick} />);
      const input = screen.getByLabelText("搜索") as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  describe("搜索功能", () => {
    it("输入字符触发搜索", async () => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          entity_type: "todo",
          title: "测试任务",
          content: "内容",
          status: "pending",
        },
      ];
      (searchAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      render(<SearchBar onResultClick={mockOnResultClick} />);

      const input = screen.getByLabelText("搜索");
      fireEvent.change(input, { target: { value: "测试" } });

      await waitFor(() => {
        expect(searchAll).toHaveBeenCalledWith("测试");
      });
    });

    it("输入长度小于2不触发搜索", async () => {
      render(<SearchBar onResultClick={mockOnResultClick} />);

      const input = screen.getByLabelText("搜索");
      fireEvent.change(input, { target: { value: "a" } });

      await waitFor(() => {
        expect(searchAll).not.toHaveBeenCalled();
      });
    });

    it("输入长度为2时触发搜索", async () => {
      const mockResults: SearchResult[] = [];
      (searchAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      render(<SearchBar onResultClick={mockOnResultClick} />);

      const input = screen.getByLabelText("搜索");
      fireEvent.change(input, { target: { value: "ab" } });

      await waitFor(() => {
        expect(searchAll).toHaveBeenCalledWith("ab");
      });
    });

    it("清空输入时关闭结果下拉", async () => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          entity_type: "todo",
          title: "测试任务",
          content: "内容",
          status: "pending",
        },
      ];
      (searchAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      render(<SearchBar onResultClick={mockOnResultClick} />);

      const input = screen.getByLabelText("搜索");
      fireEvent.change(input, { target: { value: "测试" } });

      // 等待搜索完成并显示结果
      await waitFor(() => {
        expect(screen.getByText("测试任务")).toBeInTheDocument();
      });

      // 清空输入
      fireEvent.change(input, { target: { value: "" } });

      // 结果下拉应该关闭
      expect(screen.queryByText("测试任务")).not.toBeInTheDocument();
    });
  });

  describe("结果显示", () => {
    it("显示搜索结果", async () => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          entity_type: "todo",
          title: "任务一",
          content: "内容一",
          status: "pending",
        },
        {
          id: "2",
          entity_type: "plan",
          title: "计划一",
          content: "内容二",
          status: "active",
        },
      ];
      (searchAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      render(<SearchBar onResultClick={mockOnResultClick} />);

      const input = screen.getByLabelText("搜索");
      fireEvent.change(input, { target: { value: "测试" } });

      await waitFor(() => {
        expect(screen.getByText("任务一")).toBeInTheDocument();
        expect(screen.getByText("计划一")).toBeInTheDocument();
      });
    });

    it("显示实体类型标签", async () => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          entity_type: "todo",
          title: "任务一",
          content: "内容",
          status: "pending",
        },
      ];
      (searchAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      render(<SearchBar onResultClick={mockOnResultClick} />);

      const input = screen.getByLabelText("搜索");
      fireEvent.change(input, { target: { value: "测试" } });

      await waitFor(() => {
        expect(screen.getByText("todo")).toBeInTheDocument();
      });
    });

    it("无结果时显示提示信息", async () => {
      const mockResults: SearchResult[] = [];
      (searchAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      render(<SearchBar onResultClick={mockOnResultClick} />);

      const input = screen.getByLabelText("搜索");
      fireEvent.change(input, { target: { value: "不存在" } });

      await waitFor(() => {
        expect(screen.getByText("未找到结果")).toBeInTheDocument();
      });
    });
  });

  describe("结果点击", () => {
    it("点击结果项触发 onResultClick", async () => {
      const mockResults: SearchResult[] = [
        {
          id: "123",
          entity_type: "todo",
          title: "任务一",
          content: "内容",
          status: "pending",
        },
      ];
      (searchAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      render(<SearchBar onResultClick={mockOnResultClick} />);

      const input = screen.getByLabelText("搜索");
      fireEvent.change(input, { target: { value: "测试" } });

      await waitFor(() => {
        expect(screen.getByText("任务一")).toBeInTheDocument();
      });

      const resultItem = screen.getByText("任务一");
      fireEvent.click(resultItem);

      expect(mockOnResultClick).toHaveBeenCalledWith("todo", "123");
    });

    it("点击结果后关闭下拉", async () => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          entity_type: "todo",
          title: "任务一",
          content: "内容",
          status: "pending",
        },
      ];
      (searchAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      render(<SearchBar onResultClick={mockOnResultClick} />);

      const input = screen.getByLabelText("搜索");
      fireEvent.change(input, { target: { value: "测试" } });

      await waitFor(() => {
        expect(screen.getByText("任务一")).toBeInTheDocument();
      });

      const resultItem = screen.getByText("任务一");
      fireEvent.click(resultItem);

      // 下拉应该关闭
      expect(screen.queryByText("任务一")).not.toBeInTheDocument();
    });
  });

  describe("键盘导航", () => {
    it("Enter 键触发点击回调", async () => {
      const mockResults: SearchResult[] = [
        {
          id: "123",
          entity_type: "todo",
          title: "任务一",
          content: "内容",
          status: "pending",
        },
      ];
      (searchAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      render(<SearchBar onResultClick={mockOnResultClick} />);

      const input = screen.getByLabelText("搜索");
      fireEvent.change(input, { target: { value: "测试" } });

      await waitFor(() => {
        expect(screen.getByText("任务一")).toBeInTheDocument();
      });

      // 使用 Enter 键触发
      const resultItem = screen.getByText("任务一").closest("div");
      fireEvent.keyDown(resultItem!, { key: "Enter" });

      expect(mockOnResultClick).toHaveBeenCalledWith("todo", "123");
    });
  });

  describe("无障碍", () => {
    it("输入框有正确的 id", () => {
      render(<SearchBar onResultClick={mockOnResultClick} />);
      const input = screen.getByLabelText("搜索");
      expect(input.id).toBe("sidebar-search-input");
    });
  });
});
