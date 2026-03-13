import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsTagsView } from "@/app/views/SettingsTagsView";

vi.mock("@/hooks/useTags", () => ({
  useTags: vi.fn(),
  useCreateTag: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
  useUpdateTag: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
  useDeleteTag: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
}));

describe("SettingsTagsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTags = [
    {
      id: "tag-1",
      name: "Work",
      color: "#EF4444",
      description: "Work related tasks",
      created_at: "2026-01-01",
      updated_at: "2026-03-14",
    },
    {
      id: "tag-2",
      name: "Personal",
      color: "#3B82F6",
      description: "Personal tasks",
      created_at: "2026-01-01",
      updated_at: "2026-03-14",
    },
  ];

  it("renders settings tags view with title", () => {
    const { useTags } = require("@/hooks/useTags");
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null,
    } as any);

    render(<SettingsTagsView />);
    expect(screen.getByText("设置 > 标签")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    const { useTags } = require("@/hooks/useTags");
    vi.mocked(useTags).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    } as any);

    render(<SettingsTagsView />);
    expect(screen.getByText("加载中...")).toBeInTheDocument();
  });

  it("renders tags list", () => {
    const { useTags } = require("@/hooks/useTags");
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null,
    } as any);

    render(<SettingsTagsView />);
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("shows add button", () => {
    const { useTags } = require("@/hooks/useTags");
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null,
    } as any);

    render(<SettingsTagsView />);
    expect(screen.getByText("+ 新建标签")).toBeInTheDocument();
  });

  it("shows empty state when no tags", () => {
    const { useTags } = require("@/hooks/useTags");
    vi.mocked(useTags).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<SettingsTagsView />);
    expect(screen.getByText("暂无标签")).toBeInTheDocument();
  });
});
