# Circulation 打卡功能优化实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 优化打卡功能的 UI 布局、集成到 Dashboard/Statistics、添加种子数据

**Architecture:** 
- 修改侧边栏菜单结构，将打卡移到 TODOS 和 PLANS 中间
- 重构 CirculationsView 卡片布局，添加 streak 显示
- 在 Dashboard 和 Statistics 页面集成打卡统计
- 添加种子数据用于测试

**Tech Stack:** Next.js 16, React 19, TypeScript, Tauri, SQLite

---

## Task 1: 侧边栏调整

**Files:**
- Modify: `src/components/layout/Sidebar.tsx:17-33`

**Step 1: 修改菜单结构**

将:
```tsx
{ 
  id: 'circulations', 
  icon: '🔄', 
  label: '打卡',
  children: [
    { id: 'circulations-today', icon: '📅', label: '今日打卡' },
    { id: 'circulations-settings', icon: '⚙️', label: '打卡设置' },
  ]
},
```

改为（放到 TODOS 和 PLANS 中间，无 children）:
```tsx
{ id: 'todos', icon: '📋', label: 'TODOS' },
{ id: 'circulations', icon: '🔄', label: 'CIRCLUATIONS' },
{ id: 'plans', icon: '🚀', label: 'PLANS' },
```

**Step 2: 更新 page.tsx 路由**

修改: `src/app/page.tsx`
- 移除 `circulations-today` 和 `circulations-settings` 路由
- 添加 `circulations` 路由指向 `<CirculationsView />`

**Step 3: 测试验证**

运行: `npm run typecheck`
预期: 无错误

---

## Task 2: 打卡主页卡片式布局

**Files:**
- Modify: `src/app/views/CirculationsView.tsx`

**Step 1: 修改 Tab 布局**

在标题行添加新建按钮（最右边）:
```tsx
<div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-semibold" style={{ color: '#134E4A' }}>打卡</h2>
  <div className="flex items-center gap-2">
    <Button variant={viewMode === 'today' ? 'primary' : 'secondary'} onClick={() => setViewMode('today')}>
      今日打卡
    </Button>
    <Button variant={viewMode === 'settings' ? 'primary' : 'secondary'} onClick={() => setViewMode('settings')}>
      打卡设置
    </Button>
    <Button onClick={() => setShowForm(true)}>+ 新建</Button>
  </div>
</div>
```

**Step 2: 修改卡片样式**

在设置 Tab 内，每个打卡项显示:
```tsx
<Card key={c.id}>
  <div className="flex items-center justify-between">
    <div>
      <div className="font-semibold" style={{ color: '#134E4A' }}>{c.title}</div>
      {c.circulation_type === 'periodic' && (
        <div className="text-sm text-gray-500 mt-1">
          🔥 连续 {c.streak_count} 天 · ✨ 最佳 {c.best_streak} 天
        </div>
      )}
      {c.circulation_type === 'count' && (
        <div className="text-sm text-gray-500 mt-1">
          📊 {c.current_count} / {c.target_count || '∞'}
        </div>
      )}
    </div>
    {/* 打卡按钮 */}
  </div>
</Card>
```

**Step 3: 验证**

运行: `npm run build`
预期: 构建成功

---

## Task 3: 打卡详情页 Streak 显示

**Files:**
- Modify: `src/app/views/CirculationDetailView.tsx`

**Step 1: 添加统计卡片**

在详情页顶部添加 4 个统计卡片:
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <Card>
    <div className="text-center">
      <div className="text-3xl font-bold text-teal-600">{circulation.streak_count}</div>
      <div className="text-sm text-gray-500 mt-1">当前连续</div>
    </div>
  </Card>
  <Card>
    <div className="text-center">
      <div className="text-3xl font-bold text-orange-500">{circulation.best_streak}</div>
      <div className="text-sm text-gray-500 mt-1">最佳记录</div>
    </div>
  </Card>
  {circulation.circulation_type === 'count' && (
    <>
      <Card>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-500">{circulation.current_count}</div>
          <div className="text-sm text-gray-500 mt-1">已完成</div>
        </div>
      </Card>
      <Card>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-600">{circulation.target_count || '∞'}</div>
          <div className="text-sm text-gray-500 mt-1">目标</div>
        </div>
      </Card>
    </>
  )}
</div>
```

---

## Task 4: Dashboard 打卡统计集成

**Files:**
- Modify: `src/app/views/Dashboard.tsx`
- Modify: `src-tauri/src/commands/dashboard.rs` (如需要)

**Step 1: 添加打卡统计卡片**

在现有 Stats Cards 下方添加:
```tsx
{/* Circulation Stats */}
<div className="grid grid-cols-3 gap-4">
  <Card className="text-center">
    <div className="text-3xl font-bold text-teal-600">{dashboard.circulation_stats?.today_pending || 0}</div>
    <div className="text-sm text-gray-500 mt-1">今日待打卡</div>
  </Card>
  <Card className="text-center">
    <div className="text-3xl font-bold text-green-600">{dashboard.circulation_stats?.today_completed || 0}</div>
    <div className="text-sm text-gray-500 mt-1">今日已完成</div>
  </Card>
  <Card className="text-center">
    <div className="text-3xl font-bold text-orange-500">{dashboard.circulation_stats?.current_streak || 0}</div>
    <div className="text-sm text-gray-500 mt-1">当前最长连续</div>
  </Card>
</div>
```

**Step 2: 类型定义**

确保 Dashboard 类型包含 circulation_stats:
```typescript
interface CirculationStats {
  today_pending: number;
  today_completed: number;
  current_streak: number;
}
```

---

## Task 5: Statistics 打卡统计集成

**Files:**
- Modify: `src/app/views/StatisticsView.tsx`

**Step 1: 添加打卡统计**

在现有统计下方添加:
```tsx
{/* Circulation Stats */}
<Card>
  <h3 className="font-semibold mb-4" style={{ color: '#134E4A' }}>打卡统计</h3>
  <div className="grid grid-cols-3 gap-4">
    <div className="text-center">
      <div className="text-2xl font-bold text-teal-600">{circulations.length}</div>
      <div className="text-sm text-gray-500">总打卡项</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-green-600">{circulations.filter(c => c.status === 'active').length}</div>
      <div className="text-sm text-gray-500">活跃打卡</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-orange-500">
        {circulations.length > 0 
          ? Math.round(circulations.reduce((sum, c) => sum + c.streak_count, 0) / circulations.length * 10) / 10
          : 0}
      </div>
      <div className="text-sm text-gray-500">平均连续天数</div>
    </div>
  </div>
</Card>
```

**Step 2: 加载打卡数据**

在 StatisticsView 中添加:
```typescript
const [circulations, setCirculations] = useState<Circulation[]>([]);

// 在 loadData 中添加
const [t, p, tg, m, c] = await Promise.all([
  getTodos(), getPlans(), getTargets(), getMilestones(), getCirculations()
]);
```

---

## Task 6: 种子数据

**Files:**
- Modify: `src-tauri/src/db.rs`

**Step 1: 添加打卡种子数据**

在 seed_data 函数中添加:
```rust
// Seed Circulations - 每日打卡
conn.execute(
    "INSERT INTO circulations (id, title, content, circulation_type, frequency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    rusqlite::params!["circ-daily-1", "晨跑", "每天早上跑步", "periodic", "daily", "active", &now, &now],
)?;
conn.execute(
    "INSERT INTO circulations (id, title, content, circulation_type, frequency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    rusqlite::params!["circ-daily-2", "读书", "每天阅读 30 分钟", "periodic", "daily", "active", &now, &now],
)?;
conn.execute(
    "INSERT INTO circulations (id, title, content, circulation_type, frequency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    rusqlite::params!["circ-daily-3", "喝水", "每天喝足够的水", "periodic", "daily", "active", &now, &now],
)?;

// Seed Circulations - 每周打卡
conn.execute(
    "INSERT INTO circulations (id, title, content, circulation_type, frequency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    rusqlite::params!["circ-weekly-1", "周报", "每周完成周报", "periodic", "weekly", "active", &now, &now],
)?;
conn.execute(
    "INSERT INTO circulations (id, title, content, circulation_type, frequency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    rusqlite::params!["circ-weekly-2", "周复盘", "每周进行复盘", "periodic", "weekly", "active", &now, &now],
)?;

// Seed Circulations - 每月打卡
conn.execute(
    "INSERT INTO circulations (id, title, content, circulation_type, frequency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    rusqlite::params!["circ-monthly-1", "月总结", "每月完成月度总结", "periodic", "monthly", "active", &now, &now],
)?;

// Seed Circulations - 计数打卡
conn.execute(
    "INSERT INTO circulations (id, title, content, circulation_type, target_count, current_count, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    rusqlite::params!["circ-count-1", "喝水", "每天喝 8 杯水", "count", 8, 0, "active", &now, &now],
)?;
conn.execute(
    "INSERT INTO circulations (id, title, content, circulation_type, target_count, current_count, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    rusqlite::params!["circ-count-2", "每日10000步", "每天走 10000 步", "count", 10000, 0, "active", &now, &now],
)?;
```

---

## Task 7: 测试和验证

**Step 1: 运行测试**

运行: `npm run test -- --run`
预期: 全部通过

**Step 2: 类型检查**

运行: `npm run typecheck`
预期: 无错误

**Step 3: 构建**

运行: `npm run build`
预期: 构建成功

**Step 4: 提交**

```bash
git add -A
git commit -m "feat: optimize circulation UI and integrate with dashboard"
```
