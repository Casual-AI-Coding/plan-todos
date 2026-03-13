/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoFilters } from "../TodoFilters";
import type { Tag } from "@/lib/types";

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
    name: "学习",
    color: "#4ECDC4",
    description: null,
    created_at: "2024-01-01",
  },
  {
    id: "tag-3",
    name: "生活",
    color: "#45B7D1",
    description: null,
    created_at: "2024-01-01",
  },
];

describe("TodoFilters", () => {
  const mockOnFilterChange = vi.fn();
  const mockOnPriorityFilterChange = vi.fn();
  const mockOnTagFilterChange = vi.fn();
  const mockOnSearchChange = vi.fn();
  const mockOnViewModeChange = vi.fn();
  const mockOnPriorityDropdownToggle = vi.fn();
  const mockOnTagDropdownToggle = vi.fn();

  const defaultProps = {
    filter: "all" as const,
    priorityFilter: "all" as const,
    tagFilters: [] as string[],
    searchQuery: "",
    viewMode: "list" as const,
    allTags: mockTags,
    showPriorityDropdown: false,
    showTagDropdown: false,
    onFilterChange: mockOnFilterChange,
    onPriorityFilterChange: mockOnPriorityFilterChange,
    onTagFilterChange: mockOnTagFilterChange,
    onSearchChange: mockOnSearchChange,
    onViewModeChange: mockOnViewModeChange,
    onPriorityDropdownToggle: mockOnPriorityDropdownToggle,
    onTagDropdownToggle: mockOnTagDropdownToggle,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("状态标签切换", () => {
    it("渲染全部状态标签", () => {
      render(<TodoFilters {...defaultProps} />);

      expect(screen.getByText("全部")).toBeInTheDocument();
      expect(screen.getByText("今日")).toBeInTheDocument();
      expect(screen.getByText("即将到期")).toBeInTheDocument();
      expect(screen.getByText("已完成")).toBeInTheDocument();
    });

    it("点击全部标签触发 onFilterChange", () => {
      render(<TodoFilters {...defaultProps} />);

      fireEvent.click(screen.getByText("全部"));

      expect(mockOnFilterChange).toHaveBeenCalledWith("all");
    });

    it("点击今日标签触发 onFilterChange", () => {
      render(<TodoFilters {...defaultProps} />);

      fireEvent.click(screen.getByText("今日"));

      expect(mockOnFilterChange).toHaveBeenCalledWith("today");
    });

    it("点击即将到期标签触发 onFilterChange", () => {
      render(<TodoFilters {...defaultProps} />);

      fireEvent.click(screen.getByText("即将到期"));

      expect(mockOnFilterChange).toHaveBeenCalledWith("upcoming");
    });

    it("点击已完成标签触发 onFilterChange", () => {
      render(<TodoFilters {...defaultProps} />);

      fireEvent.click(screen.getByText("已完成"));

      expect(mockOnFilterChange).toHaveBeenCalledWith("completed");
    });

    it("当前激活的标签有正确样式", () => {
      render(<TodoFilters {...defaultProps} filter="today" />);

      const todayButton = screen.getByText("今日");
      expect(todayButton).toHaveClass("bg-teal-100", "text-teal-700");
    });
  });

  describe("视图模式切换", () => {
    it("渲染列表和日历视图按钮", () => {
      render(<TodoFilters {...defaultProps} />);

      expect(screen.getByText("列表")).toBeInTheDocument();
      expect(screen.getByText("日历")).toBeInTheDocument();
    });

    it("点击列表按钮触发 onViewModeChange", () => {
      render(<TodoFilters {...defaultProps} viewMode="calendar" />);

      fireEvent.click(screen.getByText("列表"));

      expect(mockOnViewModeChange).toHaveBeenCalledWith("list");
    });

    it("点击日历按钮触发 onViewModeChange", () => {
      render(<TodoFilters {...defaultProps} viewMode="list" />);

      fireEvent.click(screen.getByText("日历"));

      expect(mockOnViewModeChange).toHaveBeenCalledWith("calendar");
    });

    it("当前视图按钮有正确样式", () => {
      render(<TodoFilters {...defaultProps} viewMode="list" />);

      const listButton = screen.getByText("列表");
      expect(listButton).toHaveClass("bg-teal-500", "text-white");
    });
  });

  describe("优先级下拉菜单", () => {
    it("渲染优先级筛选按钮", () => {
      render(<TodoFilters {...defaultProps} />);

      expect(screen.getByText("优先级")).toBeInTheDocument();
    });

    it("点击优先级按钮触发 onPriorityDropdownToggle", () => {
      render(<TodoFilters {...defaultProps} />);

      fireEvent.click(screen.getByText("优先级"));

      expect(mockOnPriorityDropdownToggle).toHaveBeenCalled();
    });

    it("下拉菜单展开时显示所有优先级选项", () => {
      render(<TodoFilters {...defaultProps} showPriorityDropdown={true} />);

      // 下拉菜单中的优先级选项在绝对定位的 div 中
      const dropdown = screen.getByText("P0 紧急").closest("div.absolute");
      expect(dropdown).toBeInTheDocument();

      // 验证下拉菜单内的选项
      expect(screen.getAllByText("全部")[1]).toBeInTheDocument();
      expect(screen.getByText("P0 紧急")).toBeInTheDocument();
      expect(screen.getByText("P1 重要")).toBeInTheDocument();
      expect(screen.getByText("P2 普通")).toBeInTheDocument();
      expect(screen.getByText("P3 低")).toBeInTheDocument();
    });

    it("点击优先级选项触发 onPriorityFilterChange", () => {
      render(<TodoFilters {...defaultProps} showPriorityDropdown={true} />);

      fireEvent.click(screen.getByText("P0 紧急"));

      expect(mockOnPriorityFilterChange).toHaveBeenCalledWith("P0");
    });

    it("选中优先级时显示该优先级", () => {
      render(
        <TodoFilters
          {...defaultProps}
          priorityFilter="P1"
          showPriorityDropdown={true}
        />,
      );

      expect(screen.getByText("P1")).toBeInTheDocument();
    });

    it("选中的优先级选项有正确样式", () => {
      render(
        <TodoFilters
          {...defaultProps}
          priorityFilter="P2"
          showPriorityDropdown={true}
        />,
      );

      const p2Button = screen.getByText("P2 普通");
      expect(p2Button).toHaveClass("text-teal-600", "font-medium");
    });

    it("选中非全部优先级时按钮有正确样式", () => {
      render(<TodoFilters {...defaultProps} priorityFilter="P1" />);

      const priorityButton = screen.getByText("P1");
      expect(priorityButton).toHaveClass(
        "border-teal-500",
        "bg-teal-50",
        "text-teal-700",
      );
    });
  });

  describe("标签下拉菜单", () => {
    it("渲染标签筛选按钮", () => {
      render(<TodoFilters {...defaultProps} />);

      expect(screen.getByText("标签")).toBeInTheDocument();
    });

    it("点击标签按钮触发 onTagDropdownToggle", () => {
      render(<TodoFilters {...defaultProps} />);

      fireEvent.click(screen.getByText("标签"));

      expect(mockOnTagDropdownToggle).toHaveBeenCalled();
    });

    it("下拉菜单展开时显示所有标签", () => {
      render(<TodoFilters {...defaultProps} showTagDropdown={true} />);

      expect(screen.getByText("工作")).toBeInTheDocument();
      expect(screen.getByText("学习")).toBeInTheDocument();
      expect(screen.getByText("生活")).toBeInTheDocument();
    });

    it("无标签时显示暂无标签", () => {
      render(
        <TodoFilters {...defaultProps} allTags={[]} showTagDropdown={true} />,
      );

      expect(screen.getByText("暂无标签")).toBeInTheDocument();
    });

    it("点击标签选项切换标签筛选", () => {
      render(
        <TodoFilters
          {...defaultProps}
          showTagDropdown={true}
          tagFilters={[]}
        />,
      );

      fireEvent.click(screen.getByText("工作"));

      expect(mockOnTagFilterChange).toHaveBeenCalledWith(["tag-1"]);
    });

    it("已选中的标签再次点击取消选中", () => {
      render(
        <TodoFilters
          {...defaultProps}
          showTagDropdown={true}
          tagFilters={["tag-1"]}
        />,
      );

      fireEvent.click(screen.getByText("工作"));

      expect(mockOnTagFilterChange).toHaveBeenCalledWith([]);
    });

    it("选中多个标签时显示选中数量", () => {
      render(<TodoFilters {...defaultProps} tagFilters={["tag-1", "tag-2"]} />);

      expect(screen.getByText("+2 标签")).toBeInTheDocument();
    });

    it("选中标签时按钮有正确样式", () => {
      render(<TodoFilters {...defaultProps} tagFilters={["tag-1"]} />);

      const tagButton = screen.getByText("+1 标签");
      expect(tagButton).toHaveClass(
        "border-teal-500",
        "bg-teal-50",
        "text-teal-700",
      );
    });

    it("标签选项显示正确的颜色", () => {
      render(<TodoFilters {...defaultProps} showTagDropdown={true} />);

      const workTag = screen.getByText("工作");
      const colorDot = workTag.previousSibling as HTMLElement;
      expect(colorDot).toHaveStyle({ backgroundColor: "#FF6B6B" });
    });
  });

  describe("搜索功能", () => {
    it("渲染搜索输入框", () => {
      render(<TodoFilters {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("搜索...");
      expect(searchInput).toBeInTheDocument();
    });

    it("输入搜索文本触发 onSearchChange", () => {
      render(<TodoFilters {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("搜索...");
      fireEvent.change(searchInput, { target: { value: "测试搜索" } });

      expect(mockOnSearchChange).toHaveBeenCalledWith("测试搜索");
    });

    it("显示搜索文本", () => {
      render(<TodoFilters {...defaultProps} searchQuery="已搜索内容" />);

      const searchInput = screen.getByPlaceholderText(
        "搜索...",
      ) as HTMLInputElement;
      expect(searchInput.value).toBe("已搜索内容");
    });

    it("有搜索内容时显示清除按钮", () => {
      render(<TodoFilters {...defaultProps} searchQuery="测试" />);

      expect(screen.getByText("✕")).toBeInTheDocument();
    });

    it("无搜索内容时不显示清除按钮", () => {
      render(<TodoFilters {...defaultProps} searchQuery="" />);

      expect(screen.queryByText("✕")).not.toBeInTheDocument();
    });

    it("点击清除按钮清空搜索", () => {
      render(<TodoFilters {...defaultProps} searchQuery="测试" />);

      fireEvent.click(screen.getByText("✕"));

      expect(mockOnSearchChange).toHaveBeenCalledWith("");
    });

    it("搜索输入框有正确的 aria-label", () => {
      render(<TodoFilters {...defaultProps} />);

      const searchInput = screen.getByLabelText("搜索待办事项");
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe("布局", () => {
    it("筛选栏使用正确的 flex 布局", () => {
      const { container } = render(<TodoFilters {...defaultProps} />);

      // 验证第一行有 justify-between
      const firstRow = container.querySelector(".justify-between");
      expect(firstRow).toBeInTheDocument();
    });

    it("搜索框使用正确的右对齐", () => {
      const { container } = render(<TodoFilters {...defaultProps} />);

      // 验证搜索框区域有 ml-auto
      const searchWrapper = container.querySelector(".ml-auto");
      expect(searchWrapper).toBeInTheDocument();
    });
  });

  describe("无障碍性", () => {
    it("优先级按钮有正确的 aria 属性", () => {
      render(<TodoFilters {...defaultProps} />);

      const priorityButton = screen.getByText("优先级");
      expect(priorityButton).toHaveClass("min-h-11");
    });

    it("标签按钮有正确的 aria 属性", () => {
      render(<TodoFilters {...defaultProps} />);

      const tagButton = screen.getByText("标签");
      expect(tagButton).toHaveClass("min-h-11");
    });

    it("搜索清除按钮有正确的 aria-label", () => {
      render(<TodoFilters {...defaultProps} searchQuery="测试" />);

      const clearButton = screen.getByLabelText("清除搜索");
      expect(clearButton).toBeInTheDocument();
    });

    it("状态切换按钮满足最小触摸尺寸", () => {
      render(<TodoFilters {...defaultProps} />);

      const filterButton = screen.getByText("全部");
      expect(filterButton).toHaveClass("min-h-11");
    });
  });

  describe("边界情况", () => {
    it("空标签数组时正常工作", () => {
      render(
        <TodoFilters {...defaultProps} allTags={[]} showTagDropdown={true} />,
      );

      expect(screen.getByText("暂无标签")).toBeInTheDocument();
    });

    it("空搜索字符串时正常工作", () => {
      render(<TodoFilters {...defaultProps} searchQuery="" />);

      const searchInput = screen.getByPlaceholderText(
        "搜索...",
      ) as HTMLInputElement;
      expect(searchInput.value).toBe("");
    });

    it("所有优先级选中时正常工作", () => {
      render(<TodoFilters {...defaultProps} priorityFilter="all" />);

      expect(screen.getByText("优先级")).toBeInTheDocument();
    });

    it("所有标签选中时正常工作", () => {
      render(
        <TodoFilters
          {...defaultProps}
          tagFilters={["tag-1", "tag-2", "tag-3"]}
        />,
      );

      expect(screen.getByText("+3 标签")).toBeInTheDocument();
    });
  });
});
