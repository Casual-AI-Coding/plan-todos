import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationBell } from "../NotificationBell";

// Mock the hook
vi.mock("@/lib/hooks/useNotificationPolling", () => ({
  useNotificationPolling: vi.fn(),
}));

import { useNotificationPolling } from "@/lib/hooks/useNotificationPolling";

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders bell icon", () => {
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: [],
      pendingCount: 0,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationBell />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not show badge when pendingCount is 0", () => {
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: [],
      pendingCount: 0,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationBell />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    // Badge should not exist when count is 0
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows badge when pendingCount > 0", () => {
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: [
        {
          entity_type: "todo",
          entity_id: "1",
          title: "Test",
          due_date: "2026-03-13",
          reminder_times: [5],
          minutes_until_due: 5,
        },
      ],
      pendingCount: 1,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationBell />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("displays correct count up to 99", () => {
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: [],
      pendingCount: 50,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationBell />);
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("displays 99+ when count exceeds 99", () => {
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: [],
      pendingCount: 150,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationBell />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("has correct aria-label with count", () => {
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: [],
      pendingCount: 5,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationBell />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "5 条未读通知",
    );
  });

  it("calls onClick when button is clicked", () => {
    const mockOnClick = vi.fn();
    vi.mocked(useNotificationPolling).mockReturnValue({
      dueReminders: [],
      pendingCount: 0,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<NotificationBell onClick={mockOnClick} />);
    screen.getByRole("button").click();
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
