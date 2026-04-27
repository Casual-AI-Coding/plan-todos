import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ReorderItem } from "@/lib/api/reorder";
import { reorderPlans, reorderTargets, reorderTodos } from "@/lib/api/reorder";

const { mockInvoke, mockIsTauri } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockIsTauri: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    invoke: mockInvoke,
    isTauri: mockIsTauri,
  },
}));

describe("Reorder API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    mockIsTauri.mockReset();
    mockIsTauri.mockReturnValue(true);
  });

  const sampleOrders: ReorderItem[] = [
    { id: "item-1", sort_order: 10 },
    { id: "item-2", sort_order: 20 },
  ];

  it("reorderTodos converts sort objects into tuple orders", async () => {
    mockInvoke.mockResolvedValue(2);

    const result = await reorderTodos(sampleOrders);

    expect(mockInvoke).toHaveBeenCalledWith("reorder_todos", {
      orders: [
        ["item-1", 10],
        ["item-2", 20],
      ],
    });
    expect(result).toBe(2);
  });

  it("reorderPlans sends plan tuple orders", async () => {
    mockInvoke.mockResolvedValue(2);

    const result = await reorderPlans(sampleOrders);

    expect(mockInvoke).toHaveBeenCalledWith("reorder_plans", {
      orders: [
        ["item-1", 10],
        ["item-2", 20],
      ],
    });
    expect(result).toBe(2);
  });

  it("reorderTargets preserves empty order lists", async () => {
    mockInvoke.mockResolvedValue(0);

    const result = await reorderTargets([]);

    expect(mockInvoke).toHaveBeenCalledWith("reorder_targets", {
      orders: [],
    });
    expect(result).toBe(0);
  });

  it("reorderTargets converts sort objects into tuple orders", async () => {
    mockInvoke.mockResolvedValue(2);

    const result = await reorderTargets(sampleOrders);

    expect(mockInvoke).toHaveBeenCalledWith("reorder_targets", {
      orders: [
        ["item-1", 10],
        ["item-2", 20],
      ],
    });
    expect(result).toBe(2);
  });
});
