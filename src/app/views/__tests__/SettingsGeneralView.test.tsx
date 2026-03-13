import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsGeneralView } from "@/app/views/SettingsGeneralView";

vi.mock("@/lib/api", () => ({
  seedTestData: vi.fn(),
  resetData: vi.fn(),
}));

vi.mock("@/components/features", () => ({
  ThemeSelector: () => <div data-testid="theme-selector">Theme Selector</div>,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock("@/hooks/useTodos", () => ({
  queryKeys: { todos: ["todos"] },
}));

vi.mock("@/hooks/usePlans", () => ({
  planKeys: { plans: ["plans"] },
}));

vi.mock("@/hooks/useTargets", () => ({
  targetKeys: { targets: ["targets"] },
}));

vi.mock("@/hooks/useTasks", () => ({
  taskKeys: { tasks: ["tasks"] },
}));

vi.mock("@/hooks/useTags", () => ({
  tagKeys: { tags: ["tags"] },
}));

vi.mock("@/hooks/useCirculations", () => ({
  circulationKeys: { circulations: ["circulations"] },
}));

vi.mock("@/hooks/useDashboard", () => ({
  dashboardKeys: { dashboard: ["dashboard"] },
}));

vi.mock("@/hooks/useStatistics", () => ({
  statisticsKeys: { statistics: ["statistics"] },
}));

vi.mock("@/hooks/useMilestones", () => ({
  milestoneKeys: { milestones: ["milestones"] },
}));

describe("SettingsGeneralView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders settings general view with title", () => {
    render(<SettingsGeneralView />);
    expect(screen.getByText("设置 > 通用")).toBeInTheDocument();
  });

  it("renders appearance section", () => {
    render(<SettingsGeneralView />);
    expect(screen.getByText("外观")).toBeInTheDocument();
    expect(screen.getByText("主题")).toBeInTheDocument();
    expect(screen.getByText("语言")).toBeInTheDocument();
  });

  it("renders data management section", () => {
    render(<SettingsGeneralView />);
    expect(screen.getByText("数据管理")).toBeInTheDocument();
    expect(screen.getByText("自动备份")).toBeInTheDocument();
    expect(screen.getByText("备份路径")).toBeInTheDocument();
  });

  it("renders data operations section", () => {
    render(<SettingsGeneralView />);
    expect(screen.getByText("数据操作")).toBeInTheDocument();
    expect(screen.getByText("生成测试数据")).toBeInTheDocument();
    expect(screen.getByText("重置数据")).toBeInTheDocument();
  });

  it("renders language options", () => {
    render(<SettingsGeneralView />);
    expect(screen.getByText("中文")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("renders warning about dangerous operations", () => {
    render(<SettingsGeneralView />);
    expect(screen.getByText("危险操作")).toBeInTheDocument();
  });
});
