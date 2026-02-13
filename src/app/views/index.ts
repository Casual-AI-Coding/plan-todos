export { Dashboard } from './Dashboard';
export { TodosView } from './TodosView';
export { PlansView } from './PlansView';
export { TargetsView } from './TargetsView';
export { MilestonesView } from './MilestonesView';
export { StatisticsView } from './StatisticsView';
export { SettingsView } from './SettingsView';

// Note: ViewsView is a large component (~880 lines) with 4 sub-view renderers.
// It remains in page.tsx for now but should be further split into:
// - ViewsView/index.tsx
// - ViewsView/ListView.tsx
// - ViewsView/BoardView.tsx
// - ViewsView/CalendarView.tsx
// - ViewsView/GanttView.tsx
