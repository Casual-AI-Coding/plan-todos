# Search & Calendar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add full-text search (title + content) with global + per-page UI, calendar view (all entities, month view) with list/calendar toggle on each entity page, and increase backend test coverage to 90%+.

**Architecture:** 
- Search: SQLite LIKE queries across todos, plans, tasks, targets, milestones tables. Global search via header component, per-page via existing view filters.
- Calendar: Month grid with events rendered by entity type color. Toggle state managed via local component state.

**Tech Stack:** Rust/Tauri backend, React/Next.js frontend, SQLite, date-fns for date handling.

---

## Phase 1: Full-Text Search

### Task 1: Add search database queries

**Files:**
- Modify: `src-tauri/src/db.rs` - Add search tables/indexes if needed
- Create: `src-tauri/src/search.rs` - New search module

**Step 1: Create search.rs with search commands**

```rust
// src-tauri/src/search.rs
use crate::AppState;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SearchResult {
    pub entity_type: String,
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub status: String,
}

#[tauri::command]
pub fn search_all(state: tauri::State<AppState>, query: String) -> Result<Vec<SearchResult>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut results = Vec::new();
    
    // Search todos
    let mut stmt = conn.prepare(
        "SELECT id, title, content, status FROM todos WHERE title LIKE ? OR content LIKE ?"
    ).map_err(|e| e.to_string())?;
    let pattern = format!("%{}%", query);
    let todos = stmt.query_map([&pattern, &pattern], |row| {
        Ok(SearchResult {
            entity_type: "todo".to_string(),
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            status: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;
    results.extend(todos.filter_map(|r| r.ok()));
    
    // Search plans (title, description)
    // Search tasks (title, description)  
    // Search targets (title, description)
    // Search milestones (title)
    
    Ok(results)
}
```

**Step 2: Register command in main.rs**

Add to `src-tauri/src/main.rs`:
```rust
mod search;
// Add to invoke_handler: search::search_all,
```

**Step 3: Run test**
```bash
cd src-tauri && cargo test
```
Expected: Build passes

---

### Task 2: Add frontend search API

**Files:**
- Modify: `src/lib/api.ts` - Add search function

**Step 1: Add search API function**

```typescript
export interface SearchResult {
  entity_type: string;
  id: string;
  title: string;
  content: string | null;
  status: string;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - search not available');
    return [];
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<SearchResult[]>('search_all', { query });
}
```

**Step 2: Run typecheck**
```bash
npm run typecheck
```
Expected: No errors

---

### Task 3: Create global search component

**Files:**
- Create: `src/components/ui/SearchBar.tsx` - Global search in header

**Step 1: Create SearchBar component**

```tsx
'use client';
import { useState } from 'react';
import { searchAll, SearchResult } from '@/lib/api';

interface SearchBarProps {
  onResultClick: (entityType: string, id: string) => void;
}

export function SearchBar({ onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      const data = await searchAll(value);
      setResults(data);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索..."
        className="px-4 py-2 border border-teal-200 rounded-lg"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-80 bg-white shadow-lg rounded-lg mt-1 z-50">
          {results.map((r) => (
            <div
              key={`${r.entity_type}-${r.id}`}
              onClick={() => onResultClick(r.entity_type, r.id)}
              className="p-3 hover:bg-teal-50 cursor-pointer border-b"
            >
              <div className="font-medium">{r.title}</div>
              <div className="text-xs text-gray-500">{r.entity_type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Task 4: Add per-page search to existing views

**Files:**
- Modify: `src/app/views/TodosView.tsx` - Add search filter
- Modify: `src/app/views/PlansView.tsx` - Add search filter
- Modify: `src/app/views/TargetsView.tsx` - Add search filter
- Modify: `src/app/views/MilestonesView.tsx` - Add search filter

**Step 1: Add search state to TodosView**

```tsx
const [searchQuery, setSearchQuery] = useState('');
// Add filter
const filteredTodos = todos
  .filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || 
             t.content?.toLowerCase().includes(q);
    }
    return true;
  })
  .filter(t => /* existing filter logic */);
```

---

## Phase 2: Calendar View

### Task 5: Create Calendar component

**Files:**
- Create: `src/components/ui/Calendar.tsx` - Reusable calendar

**Step 1: Create Calendar component with month view**

```tsx
'use client';
import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'todo' | 'task' | 'plan' | 'milestone';
}

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function Calendar({ events, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter(e => e.date.startsWith(dateStr));
  };

  const eventColors: Record<string, string> = {
    todo: 'bg-teal-500',
    task: 'bg-blue-500', 
    plan: 'bg-orange-500',
    milestone: 'bg-purple-500'
  };

  return (
    <div className="calendar-container">
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
          ←
        </button>
        <h3>{format(currentDate, 'yyyy年M月', { locale: zhCN })}</h3>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
          →
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="text-center text-sm font-medium p-2">
            {d}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          return (
            <div 
              key={day.toISOString()}
              className={`min-h-20 border p-1 ${
                isSameDay(day, new Date()) ? 'bg-teal-50' : ''
              }`}
            >
              <div className="text-sm">{format(day, 'd')}</div>
              {dayEvents.slice(0, 3).map(e => (
                <div
                  key={e.id}
                  onClick={() => onEventClick(e)}
                  className={`text-xs p-1 mb-1 rounded ${eventColors[e.type]} text-white`}
                >
                  {e.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### Task 6: Add calendar toggle to entity views

**Files:**
- Modify: `src/app/views/TodosView.tsx` - Add list/calendar toggle
- Modify: `src/app/views/PlansView.tsx` - Add list/calendar toggle
- Modify: `src/app/views/TargetsView.tsx` - Add list/calendar toggle  
- Modify: `src/app/views/MilestonesView.tsx` - Add list/calendar toggle

**Step 1: Add toggle state to TodosView**

```tsx
const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

// Convert todos to calendar events
useEffect(() => {
  setCalendarEvents(
    todos
      .filter(t => t.due_date)
      .map(t => ({
        id: t.id,
        title: t.title,
        date: t.due_date!,
        type: 'todo' as const
      }))
  );
}, [todos]);

// In render:
return (
  <div>
    <div className="flex gap-2 mb-4">
      <button 
        onClick={() => setViewMode('list')}
        className={viewMode === 'list' ? 'bg-teal-500 text-white' : ''}
      >
        列表
      </button>
      <button 
        onClick={() => setViewMode('calendar')}
        className={viewMode === 'calendar' ? 'bg-teal-500 text-white' : ''}
      >
        日历
      </button>
    </div>
    
    {viewMode === 'list' ? (
      /* existing list render */
    ) : (
      <Calendar 
        events={calendarEvents} 
        onEventClick={(e) => console.log(e)} 
      />
    )}
  </div>
);
```

---

## Phase 3: Backend Test Coverage

### Task 7: Run coverage and identify gaps

**Step 1: Run coverage**
```bash
cd src-tauri && cargo tarpaulin --output-format html
```
Or use:
```bash
cargo install cargo-tarpaulin
cargo tarpaulin --out Html
```

**Step 2: Identify uncovered modules**

Look at coverage report. Likely gaps:
- `search.rs` (new)
- `statistics.rs`
- `batch.rs`
- `dashboard.rs`
- Notification modules

---

### Task 8: Add tests for search module

**Files:**
- Modify: `src-tauri/src/tests.rs` - Add search tests

**Step 1: Add search tests**

```rust
#[test]
fn test_search_todos() {
    let conn = Connection::open_in_memory().unwrap();
    init_db(&conn).unwrap();
    let now = chrono::Utc::now().to_rfc3339();
    
    conn.execute(
        "INSERT INTO todos (id, title, content, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        ["s1", "Buy milk", "Get 2 liters", "pending", &now, &now],
    ).unwrap();
    
    // Test search by title
    let mut stmt = conn.prepare(
        "SELECT id, title FROM todos WHERE title LIKE ?"
    ).unwrap();
    let results: Vec<(String, String)> = stmt
        .query_map(["%Buy%"], |row| Ok((row.get(0)?, row.get(1)?)))
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].1, "Buy milk");
}
```

---

### Task 9: Add tests for statistics module

**Files:**
- Modify: `src-tauri/src/tests.rs` - Add statistics tests

**Step 1: Add statistics tests**

```rust
#[test]
fn test_statistics_counts() {
    let conn = Connection::open_in_memory().unwrap();
    init_db(&conn).unwrap();
    let now = chrono::Utc::now().to_rfc3339();
    
    // Insert test data
    conn.execute(
        "INSERT INTO todos (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        ["t1", "Test", "pending", &now, &now],
    ).unwrap();
    
    // Count
    let count: i32 = conn
        .query_row("SELECT COUNT(*) FROM todos", [], |row| row.get(0))
        .unwrap();
    assert_eq!(count, 1);
}
```

---

### Task 10: Verify 90%+ coverage

**Step 1: Run final coverage check**
```bash
cd src-tauri && cargo tarpaulin --out Html
```

**Step 2: If below 90%, add more edge case tests**
- Null handling
- Invalid inputs
- Boundary conditions
- Error cases

---

## Execution

**Plan complete and saved to `docs/plans/2026-02-14-search-calendar-tests.md`**

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
