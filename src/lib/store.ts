import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Mobile sidebar
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // Active menu
  activeMenu: string;
  setActiveMenu: (menu: string) => void;

  // Selected tags for filtering
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tagId: string) => void;
  clearTags: () => void;

  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

/**
 * App Store - Global UI state management
 * Using Zustand for lightweight state management
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar state
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Mobile sidebar
      mobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      // Active menu
      activeMenu: "dashboard",
      setActiveMenu: (menu) => set({ activeMenu: menu }),

      // Selected tags
      selectedTags: [],
      setSelectedTags: (tags) => set({ selectedTags: tags }),
      toggleTag: (tagId) =>
        set((state) => ({
          selectedTags: state.selectedTags.includes(tagId)
            ? state.selectedTags.filter((t) => t !== tagId)
            : [...state.selectedTags, tagId],
        })),
      clearTags: () => set({ selectedTags: [] }),

      // Search query
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      // UI state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "plan-todos-app-store",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        selectedTags: state.selectedTags,
      }),
    },
  ),
);
