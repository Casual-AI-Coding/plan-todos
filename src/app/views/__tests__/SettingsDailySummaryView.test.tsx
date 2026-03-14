import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsDailySummaryView } from "@/app/views/SettingsDailySummaryView";

vi.mock("@/hooks/useDailySummarySettings", () => ({
  useDailySummarySettings: vi.fn(() => ({
    data: undefined,
    isLoading: false,
  })),
  useUpdateDailySummarySettings: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("@/hooks/useNotificationPlugins", () => ({
  useNotificationPlugins: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

vi.mock("@/lib/api", () => ({
  getNotificationSettings: vi.fn(),
  setNotificationSettings: vi.fn(),
}));

describe("SettingsDailySummaryView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders settings daily summary view with title", () => {
    render(<SettingsDailySummaryView />);
    expect(screen.getByText("设置 > 通知 > 每日汇总")).toBeInTheDocument();
  });

  it("renders summary time section", () => {
    render(<SettingsDailySummaryView />);
    expect(screen.getByText("汇总时间")).toBeInTheDocument();
  });

  it("renders summary content section", () => {
    render(<SettingsDailySummaryView />);
    expect(screen.getByText("汇总内容")).toBeInTheDocument();
  });
});
