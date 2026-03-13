import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MilestonesView } from "@/app/views/MilestonesView";

vi.mock("@/hooks/useMilestones", () => ({
  useMilestones: vi.fn(),
  useCreateMilestone: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
  useUpdateMilestone: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
  useDeleteMilestone: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
  usePlansForMilestone: vi.fn(() => ({ data: [] })),
  useTargetsForMilestone: vi.fn(() => ({ data: [] })),
  useCirculationsForMilestone: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}));

describe("MilestonesView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMilestones = [
    {
      id: "milestone-1",
      title: "Launch Product",
      status: "active" as const,
      progress: 50,
      target_date: "2026-06-30",
      biz_type: "plan" as const,
      biz_id: "plan-1",
      created_at: "2026-01-01",
      updated_at: "2026-03-14",
    },
    {
      id: "milestone-2",
      title: "Complete Training",
      status: "completed" as const,
      progress: 100,
      target_date: "2026-03-01",
      biz_type: "target" as const,
      biz_id: "target-1",
      created_at: "2026-01-01",
      updated_at: "2026-03-01",
    },
  ];

  it("renders loading state", () => {
    const { useMilestones } = require("@/hooks/useMilestones");
    vi.mocked(useMilestones).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<MilestonesView />);
    expect(screen.getByText("里程碑")).toBeInTheDocument();
  });

  it("renders milestones with data", () => {
    const { useMilestones } = require("@/hooks/useMilestones");
    vi.mocked(useMilestones).mockReturnValue({
      data: mockMilestones,
      isLoading: false,
    } as any);

    render(<MilestonesView />);
    expect(screen.getByText("Launch Product")).toBeInTheDocument();
    expect(screen.getByText("Complete Training")).toBeInTheDocument();
  });

  it("shows empty state when no milestones", () => {
    const { useMilestones } = require("@/hooks/useMilestones");
    vi.mocked(useMilestones).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<MilestonesView />);
    expect(screen.getByText("暂无里程碑")).toBeInTheDocument();
  });

  it("shows create button", () => {
    const { useMilestones } = require("@/hooks/useMilestones");
    vi.mocked(useMilestones).mockReturnValue({
      data: mockMilestones,
      isLoading: false,
    } as any);

    render(<MilestonesView />);
    expect(screen.getByText("+ 新建")).toBeInTheDocument();
  });
});
