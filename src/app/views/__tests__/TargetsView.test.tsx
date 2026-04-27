import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TargetsView } from "../TargetsView";

// Mock React Query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({ data: [], isLoading: false, error: null })),
  useMutation: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock("@/domain/target/targetQueries", () => ({
  useTargets: vi.fn(() => ({ data: [], isLoading: false, error: null })),
  useTargetTags: vi.fn(() => ({ data: [] })),
  useTargetSteps: vi.fn(() => ({ data: [] })),
  useCreateTarget: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
  useUpdateTarget: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
  useDeleteTarget: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
  useCreateStep: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
  useUpdateStep: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
  useDeleteStep: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn() })),
}));

vi.mock("@/domain/tag/tagQueries", () => ({
  useTags: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/lib/api", () => ({
  setEntityTags: vi.fn(),
  updateTarget: vi.fn(),
  getNotificationSettings: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("@/components/ui", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  Button: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="button">{children}</button>
  ),
  Modal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="modal" /> : null,
  Input: ({ label }: { label: string }) => (
    <div data-testid="input-label">{label}</div>
  ),
  ProgressBar: ({ value }: { value: number }) => (
    <div data-testid="progress-bar" data-value={value} />
  ),
  Checkbox: ({ checked }: { checked: boolean }) => (
    <input type="checkbox" data-testid="checkbox" checked={checked} readOnly />
  ),
}));

vi.mock("@/components/ui/animations", () => ({
  StaggeredList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="staggered-list">{children}</div>
  ),
  StaggeredListItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="staggered-list-item">{children}</div>
  ),
}));

vi.mock("@/components/features", () => ({
  EmptyStateCard: ({
    icon,
    title,
    description,
  }: {
    icon: string;
    title: string;
    description: string;
  }) => (
    <div data-testid="empty-state">
      <span data-testid="empty-icon">{icon}</span>
      <h3 data-testid="empty-title">{title}</h3>
      <p data-testid="empty-description">{description}</p>
    </div>
  ),
  TargetForm: ({ open }: { open: boolean }) =>
    open ? <div data-testid="target-form" /> : null,
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

describe("TargetsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染测试", () => {
    it("正确渲染标题", () => {
      render(<TargetsView />);
      expect(screen.getByText("GOALS")).toBeInTheDocument();
    });

    it("渲染新建按钮", () => {
      render(<TargetsView />);
      expect(screen.getByText("+ 新建 Target")).toBeInTheDocument();
    });

    it("空状态时显示 EmptyStateCard", () => {
      render(<TargetsView />);
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByTestId("empty-title")).toHaveTextContent("暂无目标");
    });
  });
});
