/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CirculationDetailView } from "@/app/views/CirculationDetailView";
import { useCirculation, useCirculationLogs } from "@/domain/circulation/circulationQueries";

vi.mock("@/domain/circulation/circulationQueries", () => ({
  useCirculation: vi.fn(),
  useCirculationLogs: vi.fn(),
  useCheckinCirculation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
  useUndoCheckinCirculation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("CirculationDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCirculation = {
    id: "circ-1",
    title: "Daily Exercise",
    circulation_type: "periodic" as const,
    frequency: "daily" as const,
    status: "active" as const,
    streak_count: 5,
    best_streak: 10,
    last_completed_at: new Date().toISOString(),
    created_at: "2026-01-01",
    updated_at: "2026-03-14",
  };

  it("renders loading state", () => {
    vi.mocked(useCirculation).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    vi.mocked(useCirculationLogs).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<CirculationDetailView id="circ-1" />);
    expect(screen.getByText("加载中...")).toBeInTheDocument();
  });

  it("renders circulation detail with data", () => {
    vi.mocked(useCirculation).mockReturnValue({
      data: mockCirculation,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useCirculationLogs).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<CirculationDetailView id="circ-1" />);
    expect(screen.getByText("Daily Exercise")).toBeInTheDocument();
  });

  it("displays streak count", () => {
    vi.mocked(useCirculation).mockReturnValue({
      data: mockCirculation,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useCirculationLogs).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<CirculationDetailView id="circ-1" />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("displays best streak", () => {
    vi.mocked(useCirculation).mockReturnValue({
      data: mockCirculation,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useCirculationLogs).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<CirculationDetailView id="circ-1" />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("displays logs section", () => {
    vi.mocked(useCirculation).mockReturnValue({
      data: mockCirculation,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useCirculationLogs).mockReturnValue({
      data: [
        {
          id: "log-1",
          circulation_id: "circ-1",
          completed_at: new Date().toISOString(),
          note: "Great workout",
        },
      ],
      isLoading: false,
    } as any);

    render(<CirculationDetailView id="circ-1" />);
    expect(screen.getByText("打卡记录")).toBeInTheDocument();
  });
});
