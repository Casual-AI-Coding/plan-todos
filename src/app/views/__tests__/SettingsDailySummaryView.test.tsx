import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsDailySummaryView } from "@/app/views/SettingsDailySummaryView";

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
    expect(screen.getByText("设置 > 每日摘要")).toBeInTheDocument();
  });

  it("renders summary time section", () => {
    render(<SettingsDailySummaryView />);
    expect(screen.getByText("摘要时间")).toBeInTheDocument();
  });

  it("renders summary content section", () => {
    render(<SettingsDailySummaryView />);
    expect(screen.getByText("摘要内容")).toBeInTheDocument();
  });
});
