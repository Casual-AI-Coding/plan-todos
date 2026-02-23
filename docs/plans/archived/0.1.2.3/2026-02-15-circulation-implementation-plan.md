# Circulation (打卡) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现完整的 Circulation 打卡功能，包括周期打卡和计数打卡，支持 streak 统计，集成到 Dashboard/统计/导出/通知。

**Architecture:** 
1. 先重构 Milestone 使用统一 biz_type/biz_id 关联字段
2. 创建 Circulation 数据模型和数据库表
3. 实现 CRUD 和打卡命令
4. 前端创建 UI 和集成

**Tech Stack:** Rust/Tauri (后端), React/Next.js (前端), SQLite (数据库)

---

## 阶段 1: Milestone 重构

### Task 1: 修改 Milestone Model

**Files:**
- Modify: `src-tauri/src/models.rs:73-86`

**Step 1: 修改 Milestone 结构体**

```rust
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Milestone {
    pub id: String,
    pub title: String,
    pub target_date: Option<String>,
    // 统一关联字段 (新增)
    pub biz_type: Option<String>,  // 'plan' | 'task' | 'target' | 'circulation'
    pub biz_id: Option<String>,
    // 移除旧的特定字段
    pub status: String,
    pub progress: i32,
    pub created_at: String,
    pub updated_at: String,
}
```

**Step 2: 运行验证**

Run: `cd src-tauri && cargo check`
Expected: 编译成功

**Step 3: Commit**

```bash
git add src-tauri/src/models.rs
git commit -m "refactor: update Milestone model with biz_type/biz_id"
```

---

### Task 2: 数据库 Milestone 字段迁移

**Files:**
- Modify: `src-tauri/src/db.rs`

**Step 1: 添加迁移 SQL**

在 db.rs 的 migration 部分添加:

```rust
// Add biz_type and biz_id columns to milestones
conn.execute(
    "ALTER TABLE milestones ADD COLUMN IF NOT EXISTS biz_type TEXT",
    [],
).ok();
conn.execute(
    "ALTER TABLE milestones ADD COLUMN IF NOT EXISTS biz_id TEXT",
    [],
).ok();
```

**Step 2: 验证编译**

Run: `cd src-tauri && cargo check`

**Step 3: Commit**

```bash
git add src-tauri/src/db.rs
git commit -m "feat: add biz_type/biz_id columns to milestones table"
```

---

## 阶段 2: Circulation 数据模型

### Task 3: 添加 Circulation Model

**Files:**
- Modify: `src-tauri/src/models.rs`

**Step 1: 添加结构体**

```rust
// Circulation - 打卡
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Circulation {
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub circulation_type: String,  // 'periodic' | 'count'
    pub frequency: Option<String>, // 'daily' | 'weekly' | 'monthly' (periodic only)
    pub frequency_config: Option<String>,
    pub target_count: Option<i32>,   // count only
    pub current_count: i32,           // count only
    pub streak_count: i32,           // periodic only
    pub best_streak: i32,            // periodic only
    pub last_completed_at: Option<String>,
    pub status: String,              // 'active' | 'archived'
    pub created_at: String,
    pub updated_at: String,
}

// CirculationLog - 打卡记录
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct CirculationLog {
    pub id: String,
    pub circulation_id: String,
    pub completed_at: String,
    pub note: Option<String>,
    pub period: Option<String>,  // periodic: "2024-W05" / "2024-02"
}
```

**Step 2: 验证编译**

Run: `cd src-tauri && cargo check`

**Step 3: Commit**

```bash
git add src-tauri/src/models.rs
git commit -f "feat: add Circulation and CirculationLog models"
```

---

### Task 4: 创建 Circulation 数据库表

**Files:**
- Modify: `src-tauri/src/db.rs`

**Step 1: 添加建表 SQL**

在 db.rs init_db 函数中添加:

```rust
// Circulation table
conn.execute(
    "CREATE TABLE IF NOT EXISTS circulations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        circulation_type TEXT NOT NULL DEFAULT 'periodic',
        frequency TEXT,
        frequency_config TEXT,
        target_count INTEGER,
        current_count INTEGER NOT NULL DEFAULT 0,
        streak_count INTEGER NOT NULL DEFAULT 0,
        best_streak INTEGER NOT NULL DEFAULT 0,
        last_completed_at TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )",
    [],
)?;

// Circulation logs table
conn.execute(
    "CREATE TABLE IF NOT EXISTS circulation_logs (
        id TEXT PRIMARY KEY,
        circulation_id TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        note TEXT,
        period TEXT,
        FOREIGN KEY (circulation_id) REFERENCES circulations(id) ON DELETE CASCADE
    )",
    [],
)?;

// Indexes
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_circulations_type ON circulations(circulation_type)",
    [],
)?;
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_circulations_status ON circulations(status)",
    [],
)?;
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_circulation_logs_cid ON circulation_logs(circulation_id)",
    [],
)?;
```

**Step 2: 验证编译**

Run: `cd src-tauri && cargo check`

**Step 3: Commit**

```bash
git add src-tauri/src/db.rs
git commit -m "feat: create circulations and circulation_logs tables"
```

---

## 阶段 3: Circulation 后端命令

### Task 5: 创建 Circulation CRUD 命令

**Files:**
- Create: `src-tauri/src/commands/circulations.rs`

**Step 1: 实现基础 CRUD**

```rust
use crate::log_command;
use crate::models::{Circulation, CirculationLog};
use crate::AppState;

#[tauri::command]
pub fn get_circulations(state: tauri::State<AppState>) -> Result<Vec<Circulation>, String> {
    log_command!("get_circulations", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        // 实现获取所有
    })
}

#[tauri::command]
pub fn get_circulation(state: tauri::State<AppState>, id: String) -> Result<Circulation, String> { ... }

#[tauri::command]
pub fn create_circulation(
    state: tauri::State<AppState>,
    title: String,
    circulation_type: String,
    frequency: Option<String>,
    target_count: Option<i32>,
) -> Result<Circulation, String> { ... }

#[tauri::command]
pub fn update_circulation(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    circulation_type: Option<String>,
    frequency: Option<String>,
    target_count: Option<i32>,
) -> Result<Circulation, String> { ... }

#[tauri::command]
pub fn delete_circulation(state: tauri::State<AppState>, id: String) -> Result<(), String> { ... }
```

**Step 2: 验证编译**

Run: `cd src-tauri && cargo check`

**Step 3: Commit**

```bash
git add src-tauri/src/commands/circulations.rs
git commit -m "feat: add Circulation CRUD commands"
```

---

### Task 6: 实现打卡命令 (checkin)

**Files:**
- Modify: `src-tauri/src/commands/circulations.rs`

**Step 1: 添加 checkin 命令**

```rust
#[tauri::command]
pub fn checkin_circulation(
    state: tauri::State<AppState>,
    id: String,
    note: Option<String>,
) -> Result<Circulation, String> {
    // 1. 获取当前 circulation
    // 2. 根据类型计算 streak 或累加 count
    // 3. 记录 log
    // 4. 返回更新后的 circulation
}
```

**Step 2: 添加撤销打卡命令**

```rust
#[tauri::command]
pub fn undo_checkin_circulation(
    state: tauri::State<AppState>,
    id: String,
) -> Result<Circulation, String> {
    // 1. 获取最近一条打卡记录
    // 2. 恢复 streak 或 count 到打卡前状态
    // 3. 删除该条 log
    // 4. 返回更新后的 circulation
}
```

**Step 3: 添加获取打卡记录命令**

```rust
#[tauri::command]
pub fn get_circulation_logs(
    state: tauri::State<AppState>,
    circulation_id: String,
    limit: Option<i32>,
) -> Result<Vec<CirculationLog>, String> { ... }
```

**Step 3: 验证编译**

Run: `cd src-tauri && cargo check`

**Step 4: Commit**

```bash
git add src-tauri/src/commands/circulations.rs
git commit -m "feat: add checkin and get_logs commands"
```

---

### Task 7: 注册 Circulation 命令

**Files:**
- Modify: `src-tauri/src/commands/mod.rs`
- Modify: `src-tauri/src/main.rs`

**Step 1: 添加 mod 声明**

```rust
pub mod circulations;
```

**Step 2: 注册命令**

在 main.rs 的 invoke_handler 中添加:

```rust
commands::circulations::get_circulations,
commands::circulations::get_circulation,
commands::circulations::create_circulation,
commands::circulations::update_circulation,
commands::circulations::delete_circulation,
commands::circulations::checkin_circulation,
commands::circulations::undo_checkin_circulation,
commands::circulations::get_circulation_logs,
```

**Step 3: 验证编译**

Run: `cd src-tauri && cargo check`

**Step 4: Commit**

```bash
git add src-tauri/src/commands/mod.rs src-tauri/src/main.rs
git commit -m "feat: register Circulation commands in Tauri"
```

---

## 阶段 4: 前端类型定义

### Task 8: 添加 TypeScript 类型

**Files:**
- Modify: `src/lib/api.ts`

**Step 1: 添加类型**

```typescript
export type CirculationType = 'periodic' | 'count';
export type PeriodicFrequency = 'daily' | 'weekly' | 'monthly';

export interface Circulation {
  id: string;
  title: string;
  content?: string;
  circulation_type: CirculationType;
  frequency?: PeriodicFrequency;
  frequency_config?: string;
  target_count?: number;
  current_count: number;
  streak_count: number;
  best_streak: number;
  last_completed_at?: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CirculationLog {
  id: string;
  circulation_id: string;
  completed_at: string;
  note?: string;
  period?: string;
}

export interface CreateCirculationParams {
  title: string;
  circulation_type: CirculationType;
  frequency?: PeriodicFrequency;
  target_count?: number;
}
```

**Step 2: 验证类型检查**

Run: `npm run typecheck`

**Step 3: Commit**

```bash
git add src/lib/api.ts
git commit -f "feat: add Circulation TypeScript types"
```

---

## 阶段 5: 前端 API 函数

### Task 9: 添加 Circulation API 函数

**Files:**
- Modify: `src/lib/api.ts`

**Step 1: 添加 API 函数**

```typescript
export async function getCirculations(): Promise<Circulation[]> { ... }
export async function getCirculation(id: string): Promise<Circulation> { ... }
export async function createCirculation(data: CreateCirculationParams): Promise<Circulation> { ... }
export async function updateCirculation(id: string, data: Partial<Circulation>): Promise<Circulation> { ... }
export async function deleteCirculation(id: string): Promise<void> { ... }
export async function checkinCirculation(id: string, note?: string): Promise<Circulation> { ... }
export async function undoCheckinCirculation(id: string): Promise<Circulation> { ... }
export async function getCirculationLogs(id: string, limit?: number): Promise<CirculationLog[]> { ... }
```

**Step 2: 验证编译**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/lib/api.ts
git commit -m "feat: add Circulation API functions"
```

---

## 阶段 6: 前端 UI 组件

### Task 10: 创建打卡二次确认组件

**Files:**
- Create: `src/components/ui/CheckinConfirm.tsx`

**Step 1: 实现确认弹窗**

```typescript
interface CheckinConfirmProps {
  circulation: Circulation;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}
```

**Step 2: 验证渲染**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/components/ui/CheckinConfirm.tsx
git commit -m "feat: add CheckinConfirm modal component"
```

---

### Task 11: 创建 CirculationsView 主页面

**Files:**
- Create: `src/app/views/CirculationsView.tsx`

**Step 1: 实现页面结构**

- Tab 切换: 今日打卡 / 打卡设置
- 打卡设置内: Periodic (每日/每周/每月) / Count Tab

**Step 2: 实现打卡列表**

- 显示当前待打卡项
- 打卡按钮
- streak / count 显示

**Step 3: 验证渲染**

Run: `npm run build`

**Step 4: Commit**

```bash
git add src/app/views/CirculationsView.tsx
git commit -m "feat: add CirculationsView page"
```

---

### Task 12: 创建打卡详情页

**Files:**
- Create: `src/app/views/CirculationDetailView.tsx`

**Step 1: 实现详情**

- 打卡项基本信息
- streak / count 统计
- 最近 20 条打卡记录

**Step 2: 验证渲染**

Run: `npm run build`

**Step 3: Commit**

```bash
git add src/app/views/CirculationDetailView.tsx
git commit -m "feat: add CirculationDetailView"
```

---

### Task 13: 添加路由和 Sidebar 入口

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

**Step 1: 添加路由**

```tsx
case 'circulations-today': return <CirculationsView mode="today" />;
case 'circulations-settings': return <CirculationsView mode="settings" />;
case 'circulation-detail': return <CirculationDetailView />;
```

**Step 2: 添加 Sidebar 菜单**

```tsx
{
  id: 'circulations',
  label: '打卡',
  children: [
    { id: 'circulations-today', label: '今日打卡' },
    { id: 'circulations-settings', label: '打卡设置' },
  ]
}
```

**Step 3: 验证渲染**

Run: `npm run build`

**Step 4: Commit**

```bash
git add src/app/page.tsx src/components/layout/Sidebar.tsx
git commit -m "feat: add Circulation routes and navigation"
```

---

## 阶段 7: 集成到现有模块

### Task 14: 集成到 Dashboard

**Files:**
- Modify: `src-tauri/src/commands/dashboard.rs`
- Modify: `src/app/views/Dashboard.tsx`

**Step 1: 后端添加打卡统计**

```rust
// Dashboard struct 添加
pub today_circulations: Vec<CirculationSummary>,
pub today_completed: i32,
pub today_pending: i32,
```

**Step 2: 前端显示**

添加打卡概览卡片

**Step 3: 验证**

Run: `npm run build && cd src-tauri && cargo check`

**Step 4: Commit**

```bash
git add src-tauri/src/commands/dashboard.rs src/app/views/Dashboard.tsx
git commit -m "feat: integrate Circulation into Dashboard"
```

---

### Task 15: 集成到 Export/Import

**Files:**
- Modify: `src-tauri/src/commands/export.rs`

**Step 1: 导出中添加 circulations**

在 ExportDataContent 中添加:

```rust
pub circulations: Vec<Circulation>,
pub circulation_logs: Vec<CirculationLog>,
```

**Step 2: 实现导出**

**Step 3: Commit**

```bash
git add src-tauri/src/commands/export.rs
git commit -m "feat: add Circulation to export/import"
```

---

## 阶段 8: 测试

### Task 16: 添加测试

**Files:**
- Create: `src/lib/circulations.test.ts`

**Step 1: 编写测试**

```typescript
describe('Circulation API', () => {
  // 测试创建
  // 测试打卡
  // 测试 streak 计算
});
```

**Step 2: 运行测试**

Run: `npm run test`

**Step 3: Commit**

```bash
git add src/lib/circulations.test.ts
git commit -m "test: add Circulation tests"
```

---

## 执行选项

**Plan complete and saved to `docs/plans/2026-02-15-circulation-design.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
