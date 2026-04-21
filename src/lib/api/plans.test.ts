import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getPlan, getPlans, createPlan, updatePlan, deletePlan } from "./plans";
import type { Plan, CreatePlanParams, UpdatePlanParams } from "@/lib/types";

// Mock @tauri-apps/api/core
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

// Get the mocked invoke function
const { invoke } = await import("@tauri-apps/api/core");

describe("getPlan", () => {
  const originalWindow = global.window;

  beforeEach(() => {
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

    await expect(getPlan("plan-1")).rejects.toThrow(
      "此操作需要在 Tauri 环境中运行: 获取 Plan",
    );
  });

  it("should call invoke with get_plan command", async () => {
    const mockPlan: Plan = {
      id: "plan-1",
      title: "Test Plan",
      description: "Test description",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      status: "active",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    const result = await getPlan("plan-1");

    expect(invoke).toHaveBeenCalledWith("get_plan", { id: "plan-1" });
    expect(result).toEqual(mockPlan);
  });

  it("should propagate errors from invoke", async () => {
    vi.mocked(invoke).mockRejectedValue(new Error("Database error"));

    await expect(getPlan("plan-1")).rejects.toThrow("Database error");
  });
});

describe("getPlans", () => {
  const originalWindow = global.window;

  beforeEach(() => {
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

    await expect(getPlans()).rejects.toThrow(
      "此操作需要在 Tauri 环境中运行: 获取 Plan 列表",
    );
  });

  it("should call invoke with get_plans command", async () => {
    const mockPlans: Plan[] = [
      {
        id: "plan-1",
        title: "Test Plan 1",
        description: "Description 1",
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        status: "active",
        sort_order: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "plan-2",
        title: "Test Plan 2",
        description: null,
        start_date: null,
        end_date: null,
        status: "completed",
        sort_order: 0,
        created_at: "2024-02-01T00:00:00Z",
        updated_at: "2024-02-01T00:00:00Z",
      },
    ];
    vi.mocked(invoke).mockResolvedValue(mockPlans);

    const result = await getPlans();

    expect(invoke).toHaveBeenCalledWith("get_plans", undefined);
    expect(result).toEqual(mockPlans);
  });

  it("should return empty array when no plans exist", async () => {
    vi.mocked(invoke).mockResolvedValue([]);

    const result = await getPlans();

    expect(result).toEqual([]);
  });

  it("should propagate errors from invoke", async () => {
    vi.mocked(invoke).mockRejectedValue(new Error("Database error"));

    await expect(getPlans()).rejects.toThrow("Database error");
  });
});

describe("createPlan", () => {
  const originalWindow = global.window;

  beforeEach(() => {
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

    const params: CreatePlanParams = { title: "New Plan" };

    await expect(createPlan(params)).rejects.toThrow(
      "此操作需要在 Tauri 环境中运行: 创建 Plan",
    );
  });

  it("should call invoke with create_plan command and all fields", async () => {
    const params: CreatePlanParams = {
      title: "New Plan",
      description: "Test description",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
    };
    const mockPlan: Plan = {
      id: "plan-new",
      title: "New Plan",
      description: "Test description",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      status: "active",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    const result = await createPlan(params);

    expect(invoke).toHaveBeenCalledWith("create_plan", {
      title: "New Plan",
      description: "Test description",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
    expect(result).toEqual(mockPlan);
  });

  it("should call invoke with only required fields", async () => {
    const params: CreatePlanParams = { title: "Simple Plan" };
    const mockPlan: Plan = {
      id: "plan-new",
      title: "Simple Plan",
      description: null,
      start_date: null,
      end_date: null,
      status: "active",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    await createPlan(params);

    expect(invoke).toHaveBeenCalledWith("create_plan", {
      title: "Simple Plan",
      description: null,
      startDate: null,
      endDate: null,
    });
  });

  it("should handle optional description only", async () => {
    const params: CreatePlanParams = {
      title: "Plan",
      description: "Only desc",
    };
    const mockPlan: Plan = {
      id: "plan-new",
      title: "Plan",
      description: "Only desc",
      start_date: null,
      end_date: null,
      status: "active",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    await createPlan(params);

    expect(invoke).toHaveBeenCalledWith("create_plan", {
      title: "Plan",
      description: "Only desc",
      startDate: null,
      endDate: null,
    });
  });

  it("should handle optional start_date only", async () => {
    const params: CreatePlanParams = {
      title: "Plan",
      start_date: "2024-01-01",
    };
    const mockPlan: Plan = {
      id: "plan-new",
      title: "Plan",
      description: null,
      start_date: "2024-01-01",
      end_date: null,
      status: "active",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    await createPlan(params);

    expect(invoke).toHaveBeenCalledWith("create_plan", {
      title: "Plan",
      description: null,
      startDate: "2024-01-01",
      endDate: null,
    });
  });

  it("should handle optional end_date only", async () => {
    const params: CreatePlanParams = { title: "Plan", end_date: "2024-12-31" };
    const mockPlan: Plan = {
      id: "plan-new",
      title: "Plan",
      description: null,
      start_date: null,
      end_date: "2024-12-31",
      status: "active",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    await createPlan(params);

    expect(invoke).toHaveBeenCalledWith("create_plan", {
      title: "Plan",
      description: null,
      startDate: null,
      endDate: "2024-12-31",
    });
  });

  it("should propagate errors from invoke", async () => {
    const params: CreatePlanParams = { title: "New Plan" };
    vi.mocked(invoke).mockRejectedValue(new Error("Database error"));

    await expect(createPlan(params)).rejects.toThrow("Database error");
  });
});

describe("updatePlan", () => {
  const originalWindow = global.window;

  beforeEach(() => {
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

    const params: UpdatePlanParams = { title: "Updated Plan" };

    await expect(updatePlan("plan-1", params)).rejects.toThrow(
      "此操作需要在 Tauri 环境中运行: 更新 Plan",
    );
  });

  it("should call invoke with update_plan command and all fields", async () => {
    const params: UpdatePlanParams = {
      title: "Updated Plan",
      description: "New description",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      status: "completed",
    };
    const mockPlan: Plan = {
      id: "plan-1",
      title: "Updated Plan",
      description: "New description",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      status: "completed",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-02-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    const result = await updatePlan("plan-1", params);

    expect(invoke).toHaveBeenCalledWith("update_plan", {
      id: "plan-1",
      title: "Updated Plan",
      description: "New description",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "completed",
    });
    expect(result).toEqual(mockPlan);
  });

  it("should call invoke with only title", async () => {
    const params: UpdatePlanParams = { title: "New Title" };
    const mockPlan: Plan = {
      id: "plan-1",
      title: "New Title",
      description: "Existing description",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      status: "active",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-02-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    await updatePlan("plan-1", params);

    expect(invoke).toHaveBeenCalledWith("update_plan", {
      id: "plan-1",
      title: "New Title",
      description: undefined,
      startDate: undefined,
      endDate: undefined,
      status: undefined,
    });
  });

  it("should call invoke with only status", async () => {
    const params: UpdatePlanParams = { status: "archived" };
    const mockPlan: Plan = {
      id: "plan-1",
      title: "Plan",
      description: "Description",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      status: "archived",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-02-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    await updatePlan("plan-1", params);

    expect(invoke).toHaveBeenCalledWith("update_plan", {
      id: "plan-1",
      title: undefined,
      description: undefined,
      startDate: undefined,
      endDate: undefined,
      status: "archived",
    });
  });

  it("should call invoke with only description", async () => {
    const params: UpdatePlanParams = { description: "New desc" };
    const mockPlan: Plan = {
      id: "plan-1",
      title: "Plan",
      description: "New desc",
      start_date: null,
      end_date: null,
      status: "active",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-02-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    await updatePlan("plan-1", params);

    expect(invoke).toHaveBeenCalledWith("update_plan", {
      id: "plan-1",
      title: undefined,
      description: "New desc",
      startDate: undefined,
      endDate: undefined,
      status: undefined,
    });
  });

  it("should call invoke with dates only", async () => {
    const params: UpdatePlanParams = {
      start_date: "2024-06-01",
      end_date: "2024-06-30",
    };
    const mockPlan: Plan = {
      id: "plan-1",
      title: "Plan",
      description: null,
      start_date: "2024-06-01",
      end_date: "2024-06-30",
      status: "active",
      sort_order: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-02-01T00:00:00Z",
    };
    vi.mocked(invoke).mockResolvedValue(mockPlan);

    await updatePlan("plan-1", params);

    expect(invoke).toHaveBeenCalledWith("update_plan", {
      id: "plan-1",
      title: undefined,
      description: undefined,
      startDate: "2024-06-01",
      endDate: "2024-06-30",
      status: undefined,
    });
  });

  it("should propagate errors from invoke", async () => {
    const params: UpdatePlanParams = { title: "Updated Plan" };
    vi.mocked(invoke).mockRejectedValue(new Error("Database error"));

    await expect(updatePlan("plan-1", params)).rejects.toThrow(
      "Database error",
    );
  });
});

describe("deletePlan", () => {
  const originalWindow = global.window;

  beforeEach(() => {
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

    await expect(deletePlan("plan-1")).rejects.toThrow(
      "此操作需要在 Tauri 环境中运行: 删除 Plan",
    );
  });

  it("should call invoke with delete_plan command", async () => {
    vi.mocked(invoke).mockResolvedValue(undefined);

    await deletePlan("plan-1");

    expect(invoke).toHaveBeenCalledWith("delete_plan", { id: "plan-1" });
  });

  it("should propagate errors from invoke", async () => {
    vi.mocked(invoke).mockRejectedValue(new Error("Database error"));

    await expect(deletePlan("plan-1")).rejects.toThrow("Database error");
  });

  it("should handle deleting plan with different ids", async () => {
    vi.mocked(invoke).mockResolvedValue(undefined);

    await deletePlan("plan-123");
    await deletePlan("plan-456");

    expect(invoke).toHaveBeenCalledWith("delete_plan", { id: "plan-123" });
    expect(invoke).toHaveBeenCalledWith("delete_plan", { id: "plan-456" });
  });
});
