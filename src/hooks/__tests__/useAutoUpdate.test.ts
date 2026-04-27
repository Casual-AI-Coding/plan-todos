import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetUpdateToastFlag, useAutoUpdate } from "../useAutoUpdate";
import * as updateApi from "@/lib/api/update";

vi.mock("@/lib/api/update", () => ({
  checkForUpdates: vi.fn(),
  skipVersion: vi.fn(),
}));

describe("useAutoUpdate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetUpdateToastFlag();
  });

  it("should auto-check on mount", async () => {
    vi.mocked(updateApi.checkForUpdates).mockResolvedValue(null);

    const { result } = renderHook(() => useAutoUpdate());

    await waitFor(() => {
      expect(updateApi.checkForUpdates).toHaveBeenCalled();
      expect(result.current.checking).toBe(false);
    });
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

  it("should use the fallback message for non-Error rejections", async () => {
    vi.mocked(updateApi.checkForUpdates).mockRejectedValue("string error");

    const { result } = renderHook(() => useAutoUpdate());

    await waitFor(() => {
      expect(result.current.error).toBe("检查更新失败");
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

  it("should not skip when updateInfo is null", async () => {
    vi.mocked(updateApi.checkForUpdates).mockResolvedValue(null);

    const { result } = renderHook(() => useAutoUpdate());

    await waitFor(() => {
      expect(result.current.checking).toBe(false);
    });

    await act(async () => {
      await result.current.handleSkip();
    });

    expect(updateApi.skipVersion).not.toHaveBeenCalled();
  });

  it("should allow resetUpdateToastFlag to re-enable update notifications", async () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
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
    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.checkUpdate();
    });
    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

    resetUpdateToastFlag();

    await act(async () => {
      await result.current.checkUpdate();
    });

    expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
  });
});
