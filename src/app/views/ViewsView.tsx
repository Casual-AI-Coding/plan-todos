"use client";

import { useViewsViewModel } from "./views/useViewsViewModel";
import { ViewHeader } from "./views/ViewHeader";
import { ViewContainer } from "./views/ViewContainer";

export function ViewsView() {
  const viewModel = useViewsViewModel();

  return (
    <div className="p-6">
      <ViewHeader
        viewMode={viewModel.viewMode}
        onViewModeChange={viewModel.setViewMode}
        filters={viewModel.filters}
        setFilters={viewModel.setFilters}
      />
      <ViewContainer {...viewModel} />
    </div>
  );
}
