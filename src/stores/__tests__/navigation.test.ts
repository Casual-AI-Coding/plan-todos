import { beforeEach, describe, expect, it } from "vitest";

import { useNavigationStore } from "@/stores/navigation";

describe("useNavigationStore", () => {
  beforeEach(() => {
    useNavigationStore.setState({
      activeMenu: "dashboard",
      mobileSidebarOpen: false,
    });
  });

  it("updates the active menu through navigate", () => {
    useNavigationStore.getState().navigate("todos");

    expect(useNavigationStore.getState().activeMenu).toBe("todos");
  });

  it("opens and closes the mobile sidebar", () => {
    useNavigationStore.getState().openMobileSidebar();
    expect(useNavigationStore.getState().mobileSidebarOpen).toBe(true);

    useNavigationStore.getState().closeMobileSidebar();
    expect(useNavigationStore.getState().mobileSidebarOpen).toBe(false);
  });

  it("sets the mobile sidebar visibility directly", () => {
    useNavigationStore.getState().setMobileSidebarOpen(true);
    expect(useNavigationStore.getState().mobileSidebarOpen).toBe(true);

    useNavigationStore.getState().setMobileSidebarOpen(false);
    expect(useNavigationStore.getState().mobileSidebarOpen).toBe(false);
  });
});
