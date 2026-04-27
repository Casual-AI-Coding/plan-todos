# UI Visual Upgrade Design — Dashboard & ViewsView

**Date**: 2026-04-28  
**Status**: Approved (auto-proceed per user directive)

## Problem Statement

After the DDD architecture refactor, the functional structure is solid but the visual presentation remains poor:

1. **Hardcoded Tailwind colors** throughout — `bg-teal-50`, `text-gray-400`, `bg-blue-100` etc. don't adapt to the 4-theme system (default, dark, dracula, nord)
2. **Dynamic Tailwind classes** like `` bg-${color}-100 `` in ViewsFilters/ViewsBoard — JIT compiler can't resolve these at build time, so they produce no styles
3. **No Lucide icons** — the project has an Icons directory but none are used in Dashboard or ViewsView
4. **Minimal animations** — only StatsRow/EntityCountsRow have StaggeredList; other sections are static
5. **No visual hierarchy** — all SectionCards look identical; ActivePlans/Targets/Milestones are copy-paste identical
6. **Basic EntityCard** — tiny 10px text, no icon, no hover feedback
7. **Plain empty states** — just text "暂无xxx", no illustration or icon
8. **No toggle animations** on checkbox clicks in todo lists

## Design Goals

1. **Theme-aware**: Replace all hardcoded Tailwind colors with CSS variables from the project's theme system
2. **Icon-rich**: Add Lucide icons to every section header, entity card, view mode button, and empty state
3. **Animated**: Apply StaggeredList/HoverCard/FadeIn animations to all dashboard sections and view lists
4. **Visual hierarchy**: Differentiate section cards with colored left borders or top accents; give EntityCard visual weight
5. **JIT-safe**: Eliminate all dynamic Tailwind classes — use inline styles or static class maps

## Approach

### Color System Migration

Replace all hardcoded Tailwind colors with CSS variable references or inline style objects. For entity-type-specific colors (which need to be distinct per type), use a static color map with both light and dark mode variants via CSS variables.

**New CSS variables to add** (in globals.css):
```css
--color-todo: #3b82f6;       /* blue */
--color-task: #14b8a6;       /* teal */
--color-plan: #a855f7;       /* purple */
--color-target: #f97316;     /* orange */
--color-milestone: #ec4899;  /* pink */
```

These will be overridden per theme (dark, dracula, nord have different accent palettes).

### Icon Integration

Add missing icons to `src/components/ui/Icons/index.tsx`:
- `LayoutGrid` (board view), `List` (list view), `CalendarDays` (calendar view), `GanttChart` (gantt view)
- `BarChart3` (stats), `FolderOpen` (plans), `Target` (already exists), `Flag` (already exists)
- `ArrowRight` (navigation), `ChevronRight` (expand), `Sparkles` (decorative)
- `TrendingUp`, `Activity`, `Zap` (dashboard stat decorations)

### SectionCard Enhancement

Add optional `icon` prop (Lucide icon component), `accentColor` prop for left-border accent. Keep existing `isEmpty`/`emptyMessage` but add an icon to empty states.

### EntityCard Enhancement

Add entity-type icon (FolderOpen for plans, Target for targets, CheckSquare for todos, Flag for milestones, Clock for tasks). Increase text size, add hover scale animation, add click ripple feedback.

### ViewHeader Enhancement

Add icons to each view mode button (LayoutGrid, List, CalendarDays, GanttChart). Active state uses primary color fill.

### ViewsFilters Fix

Replace `bg-${item.color}-100` dynamic classes with a static `FILTER_COLOR_MAP` that maps filter key to full Tailwind classes. Use `style` prop for arbitrary colors where needed.

### ViewsBoard Enhancement

Replace hardcoded column header hex colors with CSS variables. Add column icons. Improve card spacing and hover effects.

### ViewsList Enhancement

Wrap each entity section in SectionCard with icon. Add StaggeredList animation for items. Add hover:scale feedback on items.

### ViewsCalendar Enhancement

Replace hardcoded Tailwind with CSS vars for day cells. Use ENTITY_TYPE_CONFIG colors (via style prop) for item dots/badges. Add today highlight with primary color.

### ViewsGantt Enhancement

Replace hardcoded bar colors with CSS variables. Add hover tooltip on bars. Improve zoom slider styling.

### ItemTooltip Enhancement

Replace hardcoded bg-white/border-gray with CSS variables. Add entity icon. Show more detail fields.

### Dashboard Sub-components Enhancement

- **StatsRow**: Add icons to each stat (BarChart3, TrendingUp, Activity)
- **EntityCountsRow**: Add per-entity-type colors via style prop
- **ProgressSection**: Differentiate the 3 rings with labels and colors
- **TodayTodosCard/OverdueTodosCard**: Add FadeIn animation on checkbox toggle, icon on empty state
- **ActivePlansCard/ActiveTargetsCard/ActiveMilestonesCard**: Add entity-specific icons and accent colors

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/Icons/index.tsx` | Add ~10 new icon exports |
| `src/app/globals.css` | Add entity-type CSS variables |
| `src/app/views/dashboard/SectionCard.tsx` | Add icon, accentColor props |
| `src/app/views/dashboard/StatsRow.tsx` | Add stat icons |
| `src/app/views/dashboard/EntityCountsRow.tsx` | Add per-type colors via style |
| `src/app/views/dashboard/ProgressSection.tsx` | Add labels, differentiate rings |
| `src/app/views/dashboard/TodayTodosCard.tsx` | Add animation, icon |
| `src/app/views/dashboard/OverdueTodosCard.tsx` | Add animation, icon |
| `src/app/views/dashboard/ActivePlansCard.tsx` | Add FolderOpen icon, accent |
| `src/app/views/dashboard/ActiveTargetsCard.tsx` | Add Target icon, accent |
| `src/app/views/dashboard/ActiveMilestonesCard.tsx` | Add Flag icon, accent |
| `src/app/views/views/EntityCard.tsx` | Add icon, better layout, hover |
| `src/app/views/views/ViewHeader.tsx` | Add icons to view mode buttons |
| `src/app/views/views/types.ts` | Replace hardcoded Tailwind in ENTITY_TYPE_CONFIG |
| `src/components/views/ViewsFilters.tsx` | Replace dynamic Tailwind with static map |
| `src/components/views/ViewsBoard.tsx` | CSS vars for columns, icon headers |
| `src/components/views/ViewsList.tsx` | SectionCard wrapping, animations |
| `src/components/views/ViewsCalendar.tsx` | CSS vars, today highlight |
| `src/components/views/ViewsGantt.tsx` | CSS vars, improved bars |
| `src/components/views/ItemTooltip.tsx` | CSS vars, entity icon |

## Non-Goals

- No new features — purely visual improvement
- No architecture changes — DDD structure stays as-is
- No new UI components — enhance existing ones
- No dark-mode-specific layout changes — just theme-aware colors
