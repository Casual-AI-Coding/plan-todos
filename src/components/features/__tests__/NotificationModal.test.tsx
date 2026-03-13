import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationModal } from "../NotificationModal";
import * as useNotificationPolling from "@/lib/hooks/useNotificationPolling";

vi.mock("@/lib/hooks/useNotificationPolling");

describe("NotificationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotificationPolling.useNotificationPolling).mockReturnValue({
      dueReminders: [],
      pendingCount: 0,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("renders modal when open", () => {
    render(<NotificationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("待处理提醒 (0)")).toBeInTheDocument();
  });

  it("shows empty state when no reminders", () => {
    render(<NotificationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("暂无待处理提醒")).toBeInTheDocument();
  });

  it("shows reminders list when available", () => {
    vi.mocked(useNotificationPolling.useNotificationPolling).mockReturnValue({
      dueReminders: [
        {
          entity_type: "todo",
          entity_id: "1",
          title: "Test Todo",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
      ],
      pendingCount: 1,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("Test Todo")).toBeInTheDocument();
  });

  it("displays multiple reminders", () => {
    vi.mocked(useNotificationPolling.useNotificationPolling).mockReturnValue({
      dueReminders: [
        {
          entity_type: "todo",
          entity_id: "1",
          title: "First Todo",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
        {
          entity_type: "plan",
          entity_id: "2",
          title: "Second Plan",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [15],
          minutes_until_due: 10,
        },
        {
          entity_type: "target",
          entity_id: "3",
          title: "Third Target",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [30],
          minutes_until_due: 15,
        },
      ],
      pendingCount: 3,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("First Todo")).toBeInTheDocument();
    expect(screen.getByText("Second Plan")).toBeInTheDocument();
    expect(screen.getByText("Third Target")).toBeInTheDocument();
  });

  it("shows correct time remaining format for minutes", () => {
    vi.mocked(useNotificationPolling.useNotificationPolling).mockReturnValue({
      dueReminders: [
        {
          entity_type: "todo",
          entity_id: "1",
          title: "Test Todo",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 30,
        },
      ],
      pendingCount: 1,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("还有 30 分钟")).toBeInTheDocument();
  });

  it("shows correct time remaining format for hours", () => {
    vi.mocked(useNotificationPolling.useNotificationPolling).mockReturnValue({
      dueReminders: [
        {
          entity_type: "todo",
          entity_id: "1",
          title: "Test Todo",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [60],
          minutes_until_due: 120,
        },
      ],
      pendingCount: 1,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("还有 2 小时")).toBeInTheDocument();
  });

  it("shows correct time remaining format for days", () => {
    vi.mocked(useNotificationPolling.useNotificationPolling).mockReturnValue({
      dueReminders: [
        {
          entity_type: "todo",
          entity_id: "1",
          title: "Test Todo",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [1440],
          minutes_until_due: 2880,
        },
      ],
      pendingCount: 1,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("还有 2 天")).toBeInTheDocument();
  });

  it("shows more reminders message when there are more than 5", () => {
    vi.mocked(useNotificationPolling.useNotificationPolling).mockReturnValue({
      dueReminders: [
        {
          entity_type: "todo",
          entity_id: "1",
          title: "Todo 1",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
        {
          entity_type: "todo",
          entity_id: "2",
          title: "Todo 2",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
        {
          entity_type: "todo",
          entity_id: "3",
          title: "Todo 3",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
        {
          entity_type: "todo",
          entity_id: "4",
          title: "Todo 4",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
        {
          entity_type: "todo",
          entity_id: "5",
          title: "Todo 5",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
        {
          entity_type: "todo",
          entity_id: "6",
          title: "Todo 6",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
        {
          entity_type: "todo",
          entity_id: "7",
          title: "Todo 7",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
      ],
      pendingCount: 7,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("还有 2 条提醒...")).toBeInTheDocument();
  });

  it("shows view all button", () => {
    vi.mocked(useNotificationPolling.useNotificationPolling).mockReturnValue({
      dueReminders: [
        {
          entity_type: "todo",
          entity_id: "1",
          title: "Test Todo",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
      ],
      pendingCount: 1,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("查看全部")).toBeInTheDocument();
  });

  it("calls onClose when view all button is clicked", () => {
    const mockOnClose = vi.fn();

    vi.mocked(useNotificationPolling.useNotificationPolling).mockReturnValue({
      dueReminders: [
        {
          entity_type: "todo",
          entity_id: "1",
          title: "Test Todo",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
      ],
      pendingCount: 1,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationModal isOpen={true} onClose={mockOnClose} />);

    const viewAllButton = screen.getByText("查看全部");
    fireEvent.click(viewAllButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("displays correct reminder count in title", () => {
    vi.mocked(useNotificationPolling.useNotificationPolling).mockReturnValue({
      dueReminders: [
        {
          entity_type: "todo",
          entity_id: "1",
          title: "Todo 1",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
        {
          entity_type: "todo",
          entity_id: "2",
          title: "Todo 2",
          due_date: "2026-03-13T14:00:00Z",
          reminder_times: [5],
          minutes_until_due: 5,
        },
      ],
      pendingCount: 2,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("待处理提醒 (2)")).toBeInTheDocument();
  });
});
