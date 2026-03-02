import { useState } from "react";

export interface ViewsFilters {
  search: string;
  status: string;
  priority: string;
  planId: string;
  dateRange: { start: string; end: string };
}

export function useViewsFilters() {
  const [filters, setFilters] = useState<ViewsFilters>({
    search: "",
    status: "all",
    priority: "all",
    planId: "all",
    dateRange: { start: "", end: "" },
  });

  const updateFilter = <K extends keyof ViewsFilters>(
    key: K,
    value: ViewsFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      priority: "all",
      planId: "all",
      dateRange: { start: "", end: "" },
    });
  };

  return { filters, updateFilter, resetFilters };
}
