import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { seedTestData, resetData } from "./data";
import type { SeedResult, ResetOptions } from "@/lib/types";

// Mock @tauri-apps/api/core
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

// Get the mocked invoke function
const { invoke } = await import("@tauri-apps/api/core");

describe("seedTestData", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Set up Tauri environment
    Object.defineProperty(global, "window", {
      value: { __TAURI__: {} },
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("should throw error when not in Tauri environment", async () => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });

    await expect(seedTestData()).rejects.toThrow(
      "This app must run in Tauri to seed test data",
    );
  });

  it("should call invoke with seed_test_data command", async () => {
    const mockResult: SeedResult = {
      todos: 10,
      plans: 5,
      tasks: 20,
      targets: 8,
      steps: 15,
      milestones: 3,
      circulations: 2,
      circulation_logs: 10,
      tags: 6,
    };
    vi.mocked(invoke).mockResolvedValue(mockResult);

    const result = await seedTestData();

    expect(invoke).toHaveBeenCalledWith("seed_test_data");
    expect(result).toEqual(mockResult);
  });

  it("should return SeedResult with correct structure", async () => {
    const mockResult: SeedResult = {
      todos: 5,
      plans: 3,
      tasks: 10,
      targets: 4,
      steps: 8,
      milestones: 2,
      circulations: 1,
      circulation_logs: 5,
      tags: 3,
    };
    vi.mocked(invoke).mockResolvedValue(mockResult);

    const result = await seedTestData();

    expect(result).toHaveProperty("todos");
    expect(result).toHaveProperty("plans");
    expect(result).toHaveProperty("tasks");
    expect(result).toHaveProperty("targets");
    expect(result).toHaveProperty("steps");
    expect(result).toHaveProperty("milestones");
    expect(result).toHaveProperty("circulations");
    expect(result).toHaveProperty("circulation_logs");
    expect(result).toHaveProperty("tags");
  });

  it("should propagate errors from invoke", async () => {
    vi.mocked(invoke).mockRejectedValue(new Error("Database error"));

    await expect(seedTestData()).rejects.toThrow("Database error");
  });

  it("should handle zero seeded data", async () => {
    const mockResult: SeedResult = {
      todos: 0,
      plans: 0,
      tasks: 0,
      targets: 0,
      steps: 0,
      milestones: 0,
      circulations: 0,
      circulation_logs: 0,
      tags: 0,
    };
    vi.mocked(invoke).mockResolvedValue(mockResult);

    const result = await seedTestData();

    expect(result.todos).toBe(0);
    expect(result.plans).toBe(0);
  });
});

describe("resetData", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Set up Tauri environment
    Object.defineProperty(global, "window", {
      value: { __TAURI__: {} },
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("should throw error when not in Tauri environment", async () => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });

    await expect(resetData()).rejects.toThrow(
      "This app must run in Tauri to reset data",
    );
  });

  it("should call invoke with reset_data command and null options", async () => {
    vi.mocked(invoke).mockResolvedValue(undefined);

    await resetData();

    expect(invoke).toHaveBeenCalledWith("reset_data", { options: null });
  });

  it("should call invoke with empty options object", async () => {
    vi.mocked(invoke).mockResolvedValue(undefined);

    await resetData({});

    expect(invoke).toHaveBeenCalledWith("reset_data", { options: {} });
  });

  it("should call invoke with keep_tags option", async () => {
    const options: ResetOptions = { keep_tags: true };
    vi.mocked(invoke).mockResolvedValue(undefined);

    await resetData(options);

    expect(invoke).toHaveBeenCalledWith("reset_data", { options });
  });

  it("should call invoke with keep_settings option", async () => {
    const options: ResetOptions = { keep_settings: true };
    vi.mocked(invoke).mockResolvedValue(undefined);

    await resetData(options);

    expect(invoke).toHaveBeenCalledWith("reset_data", { options });
  });

  it("should call invoke with both keep_tags and keep_settings", async () => {
    const options: ResetOptions = { keep_tags: true, keep_settings: true };
    vi.mocked(invoke).mockResolvedValue(undefined);

    await resetData(options);

    expect(invoke).toHaveBeenCalledWith("reset_data", { options });
  });

  it("should call invoke with keep_tags false", async () => {
    const options: ResetOptions = { keep_tags: false };
    vi.mocked(invoke).mockResolvedValue(undefined);

    await resetData(options);

    expect(invoke).toHaveBeenCalledWith("reset_data", { options });
  });

  it("should call invoke with keep_settings false", async () => {
    const options: ResetOptions = { keep_settings: false };
    vi.mocked(invoke).mockResolvedValue(undefined);

    await resetData(options);

    expect(invoke).toHaveBeenCalledWith("reset_data", { options });
  });

  it("should propagate errors from invoke", async () => {
    vi.mocked(invoke).mockRejectedValue(new Error("Reset failed"));

    await expect(resetData()).rejects.toThrow("Reset failed");
  });

  it("should handle undefined options parameter", async () => {
    vi.mocked(invoke).mockResolvedValue(undefined);

    await resetData(undefined);

    expect(invoke).toHaveBeenCalledWith("reset_data", { options: null });
  });
});
