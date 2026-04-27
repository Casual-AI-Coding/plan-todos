2026-04-27
- Moved todo-specific selectors into `src/domain/todo/todoFilters.ts` as pure functions without React memoization so callers can decide whether memoization is needed.
- Consolidated `TodosView` UI state into `useTodoViewState()` and removed the dead `selectedTags` state while keeping the rendered component contract unchanged.
