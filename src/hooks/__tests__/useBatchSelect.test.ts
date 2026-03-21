import { describe, it, expect, beforeEach } from "vitest";
import { useBatchSelect } from "../useBatchSelect";

describe("useBatchSelect", () => {
  beforeEach(() => {
    // Reset store before each test
    useBatchSelect.getState().clear();
  });

  it("should start with mode false and empty selection", () => {
    const state = useBatchSelect.getState();
    expect(state.mode).toBe(false);
    expect(state.selectedIds.size).toBe(0);
  });

  it("should toggle mode", () => {
    useBatchSelect.getState().toggleMode();
    expect(useBatchSelect.getState().mode).toBe(true);

    useBatchSelect.getState().toggleMode();
    expect(useBatchSelect.getState().mode).toBe(false);
  });

  it("should enter and exit mode", () => {
    useBatchSelect.getState().enterMode();
    expect(useBatchSelect.getState().mode).toBe(true);

    useBatchSelect.getState().exitMode();
    expect(useBatchSelect.getState().mode).toBe(false);
    expect(useBatchSelect.getState().selectedIds.size).toBe(0);
  });

  it("should toggle selection", () => {
    useBatchSelect.getState().toggle("id-1");
    expect(useBatchSelect.getState().isSelected("id-1")).toBe(true);

    useBatchSelect.getState().toggle("id-1");
    expect(useBatchSelect.getState().isSelected("id-1")).toBe(false);
  });

  it("should select and deselect", () => {
    useBatchSelect.getState().select("id-1");
    expect(useBatchSelect.getState().isSelected("id-1")).toBe(true);

    useBatchSelect.getState().deselect("id-1");
    expect(useBatchSelect.getState().isSelected("id-1")).toBe(false);
  });

  it("should select all", () => {
    useBatchSelect.getState().selectAll(["id-1", "id-2", "id-3"]);
    expect(useBatchSelect.getState().selectedCount()).toBe(3);
    expect(useBatchSelect.getState().hasSelection()).toBe(true);
  });

  it("should deselect all", () => {
    useBatchSelect.getState().selectAll(["id-1", "id-2"]);
    useBatchSelect.getState().deselectAll();
    expect(useBatchSelect.getState().selectedCount()).toBe(0);
  });

  it("should clear mode and selection", () => {
    useBatchSelect.getState().enterMode();
    useBatchSelect.getState().selectAll(["id-1", "id-2"]);

    useBatchSelect.getState().clear();

    expect(useBatchSelect.getState().mode).toBe(false);
    expect(useBatchSelect.getState().selectedCount()).toBe(0);
  });

  it("should count selected items", () => {
    useBatchSelect.getState().select("id-1");
    useBatchSelect.getState().select("id-2");
    expect(useBatchSelect.getState().selectedCount()).toBe(2);
  });
});
