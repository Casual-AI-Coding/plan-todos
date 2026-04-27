import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UpdateInfo } from "@/lib/api/update";
import { checkForUpdates, skipVersion } from "@/lib/api/update";

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

describe("Update API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it("checkForUpdates returns the backend update info", async () => {
    const updateInfo: UpdateInfo = {
      has_update: true,
      current_version: "0.8.4",
      latest_version: "0.8.5",
      release_url: "https://example.com/releases/0.8.5",
      release_notes: "Bug fixes and improvements",
    };
    mockInvoke.mockResolvedValue(updateInfo);

    const result = await checkForUpdates();

    expect(mockInvoke).toHaveBeenCalledWith("check_for_updates");
    expect(result).toEqual(updateInfo);
  });

  it("checkForUpdates can return null when no update exists", async () => {
    mockInvoke.mockResolvedValue(null);

    const result = await checkForUpdates();

    expect(mockInvoke).toHaveBeenCalledWith("check_for_updates");
    expect(result).toBeNull();
  });

  it("skipVersion forwards the selected version", async () => {
    mockInvoke.mockResolvedValue(undefined);

    await skipVersion("0.8.5");

    expect(mockInvoke).toHaveBeenCalledWith("skip_version", {
      version: "0.8.5",
    });
  });
});
