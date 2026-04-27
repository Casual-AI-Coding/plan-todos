/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsTagsView } from "@/app/views/SettingsTagsView";
import { useTags } from "@/domain/tag/tagQueries";

vi.mock("@/domain/tag/tagQueries", () => ({
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
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null,
    } as any);

    render(<SettingsTagsView />);
    expect(screen.getByText("设置 > 标签管理")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    vi.mocked(useTags).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    } as any);

    render(<SettingsTagsView />);
    expect(screen.getByText("加载中...")).toBeInTheDocument();
  });

  it("renders tags list", () => {
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
    vi.mocked(useTags).mockReturnValue({
      data: mockTags,
      isLoading: false,
      error: null,
    } as any);

    render(<SettingsTagsView />);
    expect(screen.getByText("+ 新建标签")).toBeInTheDocument();
  });

  it("shows empty state when no tags", () => {
    vi.mocked(useTags).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<SettingsTagsView />);
    expect(screen.getByText("暂无标签")).toBeInTheDocument();
  });
});
