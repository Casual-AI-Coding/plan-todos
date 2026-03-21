import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAutoUpdate } from "../useAutoUpdate";
import * as updateApi from "@/lib/api/update";

vi.mock("@/lib/api/update", () => ({
  checkForUpdates: vi.fn(),
  skipVersion: vi.fn(),
}));

describe("useAutoUpdate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should auto-check on mount", async () => {
    vi.mocked(updateApi.checkForUpdates).mockResolvedValue(null);

    renderHook(() => useAutoUpdate());

    expect(updateApi.checkForUpdates).toHaveBeenCalled();
  });

  it("should set updateInfo when update available", async () => {
    const mockInfo = {
      has_update: true,
      current_version: "0.6.0",
      latest_version: "0.7.0",
      release_url: "https://github.com/oGsLP/plan-todos/releases/v0.7.0",
      release_notes: "New features",
    };

    vi.mocked(updateApi.checkForUpdates).mockResolvedValue(mockInfo);

    const { result } = renderHook(() => useAutoUpdate());

    await waitFor(() => {
      expect(result.current.updateInfo).toEqual(mockInfo);
    });

    expect(result.current.checking).toBe(false);
  });

  it("should handle errors", async () => {
    vi.mocked(updateApi.checkForUpdates).mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useAutoUpdate());

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    });
  });

  it("should skip version and clear updateInfo", async () => {
    const mockInfo = {
      has_update: true,
      current_version: "0.6.0",
      latest_version: "0.7.0",
      release_url: "https://github.com/...",
      release_notes: "New features",
    };

    vi.mocked(updateApi.checkForUpdates).mockResolvedValue(mockInfo);
    vi.mocked(updateApi.skipVersion).mockResolvedValue();

    const { result } = renderHook(() => useAutoUpdate());

    await waitFor(() => {
      expect(result.current.updateInfo).toBeTruthy();
    });

    await act(async () => {
      await result.current.handleSkip();
    });

    expect(updateApi.skipVersion).toHaveBeenCalledWith("0.7.0");
    expect(result.current.updateInfo).toBeNull();
  });
});
