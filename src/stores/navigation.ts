"use client";

import { create } from "zustand";

interface NavigationState {
  activeMenu: string;
  mobileSidebarOpen: boolean;
  navigate: (menu: string) => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  activeMenu: "dashboard",
  mobileSidebarOpen: false,
  navigate: (menu) => set({ activeMenu: menu }),
  openMobileSidebar: () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
