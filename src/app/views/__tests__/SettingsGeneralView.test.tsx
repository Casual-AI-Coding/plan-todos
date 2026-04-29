import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsGeneralView } from "@/app/views/SettingsGeneralView";
import { ToastProvider } from "@/components/ui/Toast";

vi.mock("@/lib/api", () => ({
  seedTestData: vi.fn(),
  resetData: vi.fn(),
  exportData: vi.fn(),
  importData: vi.fn(),
}));

vi.mock("@/components/features", () => ({
  ThemeSelector: () => <div data-testid="theme-selector">Theme Selector</div>,
  DataBackupSettings: ({
    onExport,
    onImport,
  }: {
    onExport?: () => Promise<void>;
    onImport?: (file: File) => Promise<void>;
  }) => (
    <div data-testid="data-backup-settings">
      Data Backup Settings
      <button data-testid="mock-export" onClick={() => onExport?.()}>
        Export
      </button>
      <button data-testid="mock-import" onClick={() => onImport?.(new File([], "test.json"))}>
        Import
      </button>
    </div>
  ),
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

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<ToastProvider>{ui}</ToastProvider>);
  };

  it("renders settings general view with title", () => {
    renderWithProvider(<SettingsGeneralView />);
    expect(screen.getByText("设置 > 通用")).toBeInTheDocument();
  });

  it("renders appearance section", () => {
    renderWithProvider(<SettingsGeneralView />);
    expect(screen.getByText("外观")).toBeInTheDocument();
    expect(screen.getByText("主题")).toBeInTheDocument();
    expect(screen.getByText("语言")).toBeInTheDocument();
  });

  it("renders hotkeys section", () => {
    renderWithProvider(<SettingsGeneralView />);
    expect(screen.getByText("快捷键")).toBeInTheDocument();
  });

  it("renders language options", () => {
    renderWithProvider(<SettingsGeneralView />);
    expect(screen.getByText("中文")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("renders restore default hotkeys button", () => {
    renderWithProvider(<SettingsGeneralView />);
    expect(screen.getByText("恢复默认")).toBeInTheDocument();
  });

  it("renders data backup section", () => {
    renderWithProvider(<SettingsGeneralView />);
    expect(screen.getByText("数据备份")).toBeInTheDocument();
    expect(screen.getByTestId("data-backup-settings")).toBeInTheDocument();
  });
});
