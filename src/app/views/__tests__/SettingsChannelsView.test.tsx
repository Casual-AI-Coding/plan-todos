/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsChannelsView } from "@/app/views/SettingsChannelsView";
import { useNotificationPlugins } from "@/hooks/useNotificationPlugins";

vi.mock("@/hooks/useNotificationPlugins", () => ({
  useNotificationPlugins: vi.fn(),
  useCreateNotificationPlugin: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
  useUpdateNotificationPlugin: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
  useDeleteNotificationPlugin: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
}));

vi.mock("@/lib/api", () => ({
  sendNotification: vi.fn(),
}));

describe("SettingsChannelsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPlugins = [
    {
      id: "plugin-1",
      name: "Feishu Notification",
      plugin_type: "feishu",
      enabled: true,
      config: '{"webhook": "https://example.com"}',
      created_at: "2026-01-01",
      updated_at: "2026-03-14",
    },
  ];

  it("renders settings channels view with title", () => {
    vi.mocked(useNotificationPlugins).mockReturnValue({
      data: mockPlugins,
      isLoading: false,
    } as any);

    render(<SettingsChannelsView />);
    expect(screen.getByText("设置 > 通知 > 通知渠道")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    vi.mocked(useNotificationPlugins).mockReturnValue({
      data: [],
      isLoading: true,
    } as any);

    render(<SettingsChannelsView />);
    expect(screen.getByText("加载中...")).toBeInTheDocument();
  });

  it("renders plugins list", () => {
    vi.mocked(useNotificationPlugins).mockReturnValue({
      data: mockPlugins,
      isLoading: false,
    } as any);

    render(<SettingsChannelsView />);
    expect(screen.getByText("Feishu Notification")).toBeInTheDocument();
  });

  it("shows add button", () => {
    vi.mocked(useNotificationPlugins).mockReturnValue({
      data: mockPlugins,
      isLoading: false,
    } as any);

    render(<SettingsChannelsView />);
    expect(screen.getByText("+ 添加通知渠道")).toBeInTheDocument();
  });

  it("shows empty state when no plugins", () => {
    vi.mocked(useNotificationPlugins).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<SettingsChannelsView />);
    expect(screen.getByText(/暂无通知渠道/)).toBeInTheDocument();
  });
});
