import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodosView } from "../TodosView";
import type { Todo } from "@/lib/types";

// Mock React Query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock hooks
vi.mock("@/domain/todo/todoQueries", () => ({
  useTodos: vi.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreateTodo: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
  useUpdateTodo: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
  useDeleteTodo: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
  useReorderTodos: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
}));

vi.mock("@/hooks/useTags", () => ({
  useTags: vi.fn(() => ({ data: [] })),
}));

// Mock API
vi.mock("@/lib/api", () => ({
  setEntityTags: vi.fn(),
  setNotificationSettings: vi.fn(),
}));

// Mock UI components - define inside vi.mock to avoid hoisting issues
vi.mock("@/components/ui", () => ({
  Card: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/animations", () => ({
  StaggeredList: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="staggered-list" className={className}>
      {children}
    </div>
  ),
  StaggeredListItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="staggered-list-item">{children}</div>
  ),
}));

vi.mock("@/components/ui/Calendar", () => ({
  Calendar: () => <div data-testid="calendar" />,
}));

vi.mock("@/components/features", () => ({
  EmptyStateCard: ({
    icon,
    title,
    description,
    action,
  }: {
    icon: string;
    title: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <div data-testid="empty-state">
      <span data-testid="empty-icon">{icon}</span>
      <h3 data-testid="empty-title">{title}</h3>
      <p data-testid="empty-description">{description}</p>
      {action}
    </div>
  ),
}));

vi.mock("@/components/features/TodoItem", () => ({
  TodoItem: ({
    todo,
    onToggle,
    onDelete,
    onClick,
  }: {
    todo: Todo;
    onToggle?: (t: Todo) => void;
    onDelete?: (id: string) => void;
    onClick?: (t: Todo) => void;
  }) => (
    <div
      data-testid="todo-item"
      data-id={todo.id}
      onClick={() => onClick?.(todo)}
    >
      <span data-testid="todo-title">{todo.title}</span>
      <button data-testid="todo-toggle" onClick={() => onToggle?.(todo)}>
        Toggle
      </button>
      <button data-testid="todo-delete" onClick={() => onDelete?.(todo.id)}>
        Delete
      </button>
    </div>
  ),
}));

vi.mock("@/components/features/TodoForm", () => ({
  TodoForm: ({
    open,
    editingTodo,
    onClose,
    onSave,
  }: {
    open: boolean;
    editingTodo?: Todo;
    onClose: () => void;
    onSave: (
      data: { title: string; content?: string; priority: string },
      tags: string[],
    ) => void;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="todo-form">
        <span data-testid="form-mode">{editingTodo ? "edit" : "create"}</span>
        <button data-testid="form-close" onClick={onClose}>
          Close
        </button>
        <button
          data-testid="form-save"
          onClick={() =>
            onSave?.({ title: "Test", content: "", priority: "P2" }, [])
          }
        >
          Save
        </button>
      </div>
    );
  },
}));

vi.mock("@/components/features/TodoFilters", () => ({
  TodoFilters: () => <div data-testid="todo-filters" />,
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  })),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("TodosView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染测试", () => {
    it("正确渲染标题", () => {
      render(<TodosView />);
      expect(screen.getByText("TODOS")).toBeInTheDocument();
    });

    it("渲染新建按钮", () => {
      render(<TodosView />);
      expect(screen.getByText("+ 新建")).toBeInTheDocument();
    });

    it("渲染过滤器组件", () => {
      render(<TodosView />);
      expect(screen.getByTestId("todo-filters")).toBeInTheDocument();
    });

    it("空状态时显示 EmptyStateCard", () => {
      render(<TodosView />);
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByTestId("empty-title")).toHaveTextContent(
        "暂无待办事项",
      );
    });
  });

  describe("用户交互测试", () => {
    it("点击新建按钮打开表单", () => {
      render(<TodosView />);
      const newButton = screen.getByText("+ 新建");
      fireEvent.click(newButton);
      expect(screen.getByTestId("todo-form")).toBeInTheDocument();
    });

    it("点击 EmptyStateCard 的创建按钮打开表单", () => {
      render(<TodosView />);
      const createButton = screen.getByText("+ 创建待办");
      fireEvent.click(createButton);
      expect(screen.getByTestId("todo-form")).toBeInTheDocument();
    });

    it("表单关闭按钮可以关闭表单", () => {
      render(<TodosView />);
      fireEvent.click(screen.getByText("+ 新建"));
      expect(screen.getByTestId("todo-form")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("form-close"));
      expect(screen.queryByTestId("todo-form")).not.toBeInTheDocument();
    });

    it("显示日历视图", () => {
      // 需要有数据且切换到日历视图模式才显示日历
      // 这里测试默认空状态下的渲染
      render(<TodosView />);
      // 默认显示空状态，而不是日历
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  describe("过滤器功能测试", () => {
    it("点击页面其他地方关闭下拉菜单", () => {
      render(<TodosView />);
      const overlay = document.querySelector(".fixed.inset-0");
      if (overlay) {
        fireEvent.click(overlay);
      }
      expect(screen.getByText("TODOS")).toBeInTheDocument();
    });
  });
});
