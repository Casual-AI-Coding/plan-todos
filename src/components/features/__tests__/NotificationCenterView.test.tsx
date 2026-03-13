import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationCenterView } from "@/app/views/NotificationCenterView";

vi.mock("@/lib/hooks/useNotificationPolling", () => ({
  useNotificationPolling: vi.fn(),
}));

vi.mock("@/lib/api/notifications", () => ({
  getNotificationHistory: vi.fn(),
}));

import { useNotificationPolling } from "@/lib/hooks/useNotificationPolling";
import { getNotificationHistory } from "@/lib/api/notifications";

describe("NotificationCenterView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: [],
      pendingCount: 0,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    vi.mocked(getNotificationHistory).mockResolvedValue([]);
  });

  const mockReminders = [
    {
      entity_type: "todo" as const,
      entity_id: "todo-1",
      title: "Test Todo",
      due_date: "2026-03-13",
      reminder_times: [5],
      minutes_until_due: 5,
    },
    {
      entity_type: "plan" as const,
      entity_id: "plan-1",
      title: "Test Plan",
      due_date: "2026-03-13",
      reminder_times: [30],
      minutes_until_due: 30,
    },
  ];

  const mockHistoryData = [
    {
      id: "history-1",
      entity_type: "todo" as const,
      entity_id: "todo-1",
      title: "Reminder triggered",
      message: "Test Todo was due",
      reminder_time: 5,
      scheduled_at: new Date().toISOString(),
      channel: "in_app",
      status: "pending" as const,
      created_at: new Date().toISOString(),
    },
  ];

  it("renders with correct title", () => {
    render(<NotificationCenterView />);
    expect(screen.getByText("通知中心")).toBeInTheDocument();
  });

  it("shows pending tab with badge count", () => {
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: mockReminders,
      pendingCount: 2,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationCenterView />);
    expect(screen.getByText("待处理")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows empty state when no pending reminders", () => {
    render(<NotificationCenterView />);
    expect(screen.getByText("暂无待处理提醒")).toBeInTheDocument();
  });

  it("shows due reminders when available", () => {
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: mockReminders,
      pendingCount: 2,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationCenterView />);
    expect(screen.getByText("Test Todo")).toBeInTheDocument();
    expect(screen.getByText("Test Plan")).toBeInTheDocument();
  });

  it("displays entity type labels correctly", () => {
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: mockReminders,
      pendingCount: 2,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationCenterView />);
    expect(screen.getByText((content) => content.includes("待办"))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("计划"))).toBeInTheDocument();
  });

  it("shows loading state when reminders are loading", () => {
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: [],
      pendingCount: 0,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationCenterView />);
    expect(screen.getByText("加载中...")).toBeInTheDocument();
  });

  it("switches between pending and history tabs", async () => {
    vi.mocked(getNotificationHistory).mockResolvedValue(mockHistoryData);

    render(<NotificationCenterView />);

    const historyTab = screen.getByText("历史记录");
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(getNotificationHistory).toHaveBeenCalled();
    });
  });

  it("fetches history when history tab is clicked", async () => {
    vi.mocked(getNotificationHistory).mockResolvedValue(mockHistoryData);

    render(<NotificationCenterView />);

    const historyTab = screen.getByText("历史记录");
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(getNotificationHistory).toHaveBeenCalled();
    });
  });

  it("shows history data when available", async () => {
    vi.mocked(getNotificationHistory).mockResolvedValue(mockHistoryData);

    render(<NotificationCenterView />);

    const historyTab = screen.getByText("历史记录");
    fireEvent.click(historyTab);

    const historyItem = await screen.findByText("Reminder triggered");
    expect(historyItem).toBeInTheDocument();
    expect(screen.getByText("待发送")).toBeInTheDocument();
  });

  it("shows empty state for history when no data", async () => {
    vi.mocked(getNotificationHistory).mockResolvedValue([]);

    render(<NotificationCenterView />);

    const historyTab = screen.getByText("历史记录");
    fireEvent.click(historyTab);

    const emptyState = await screen.findByText("暂无历史记录");
    expect(emptyState).toBeInTheDocument();
  });

  it("displays entity type label for goal reminders", () => {
    const goalReminder = {
      entity_type: "target" as const,
      entity_id: "target-1",
      title: "Test Goal",
      due_date: "2026-03-13",
      reminder_times: [15],
      minutes_until_due: 15,
    };

    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: [goalReminder],
      pendingCount: 1,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationCenterView />);
    expect(screen.getByText((content) => content.includes("目标"))).toBeInTheDocument();
    expect(screen.getByText("Test Goal")).toBeInTheDocument();
  });
});
