/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CirculationsView } from "@/app/views/CirculationsView";
import { useCirculations } from "@/domain/circulation/circulationQueries";

vi.mock("@/domain/circulation/circulationQueries", () => ({
  useCirculations: vi.fn(),
  useCreateCirculation: vi.fn(),
  useUpdateCirculation: vi.fn(),
  useDeleteCirculation: vi.fn(),
  useCheckinCirculation: vi.fn(),
  useUndoCheckinCirculation: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getCirculationLogsBatch: vi.fn(),
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => children,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
  DragEndEvent: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  arrayMove: vi.fn((arr, from, to) => arr),
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  sortableKeyboardCoordinates: vi.fn(),
  rectSortingStrategy: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
  CSS: {
    Transform: {
      toString: vi.fn(() => ""),
    },
  },
}));

import {
  useCirculations,
  useCreateCirculation,
  useCheckinCirculation,
  useUndoCheckinCirculation,
} from "@/hooks/useCirculations";

describe("CirculationsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCirculations = [
    {
      id: "circ-1",
      title: "Daily Exercise",
      circulation_type: "periodic" as const,
      frequency: "daily" as const,
      status: "active" as const,
      streak_count: 5,
      best_streak: 10,
      created_at: "2026-01-01",
      updated_at: "2026-03-14",
    },
    {
      id: "circ-2",
      title: "Read Books",
      circulation_type: "count" as const,
      status: "active" as const,
      current_count: 20,
      target_count: 100,
      created_at: "2026-01-01",
      updated_at: "2026-03-14",
    },
  ];

  it("renders loading state", () => {
    vi.mocked(useCirculations).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<CirculationsView />);
    expect(screen.getByText("打卡")).toBeInTheDocument();
  });

  it("renders circulations with data", () => {
    vi.mocked(useCirculations).mockReturnValue({
      data: mockCirculations,
      isLoading: false,
    } as any);

    render(<CirculationsView />);
    expect(screen.getByText("Daily Exercise")).toBeInTheDocument();
    expect(screen.getByText("Read Books")).toBeInTheDocument();
  });

  it("shows empty state when no circulations", () => {
    vi.mocked(useCirculations).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<CirculationsView />);
    expect(screen.getByText("今日没有待打卡项")).toBeInTheDocument();
  });

  it("shows today tab and settings tab buttons", () => {
    vi.mocked(useCirculations).mockReturnValue({
      data: mockCirculations,
      isLoading: false,
    } as any);

    render(<CirculationsView />);
    expect(screen.getByText("今日打卡")).toBeInTheDocument();
    expect(screen.getByText("打卡设置")).toBeInTheDocument();
  });

  it("switches between today and settings tabs", () => {
    vi.mocked(useCirculations).mockReturnValue({
      data: mockCirculations,
      isLoading: false,
    } as any);

    render(<CirculationsView />);

    const settingsTab = screen.getByText("打卡设置");
    fireEvent.click(settingsTab);

    expect(screen.getByText("周期打卡")).toBeInTheDocument();
    expect(screen.getByText("计数打卡")).toBeInTheDocument();
  });

  it("shows create button", () => {
    vi.mocked(useCirculations).mockReturnValue({
      data: mockCirculations,
      isLoading: false,
    } as any);

    render(<CirculationsView />);
    expect(screen.getByText("+ 新建")).toBeInTheDocument();
  });

  it("displays streak count for periodic circulations", () => {
    vi.mocked(useCirculations).mockReturnValue({
      data: mockCirculations,
      isLoading: false,
    } as any);

    render(<CirculationsView />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("连续天数")).toBeInTheDocument();
  });

  it("displays best streak for periodic circulations", () => {
    vi.mocked(useCirculations).mockReturnValue({
      data: mockCirculations,
      isLoading: false,
    } as any);

    render(<CirculationsView />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("最佳记录")).toBeInTheDocument();
  });
});
