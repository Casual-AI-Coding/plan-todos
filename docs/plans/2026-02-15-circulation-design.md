# Circulation (打卡) 功能设计

> 创建日期: 2026-02-15

## 概述

Circulation 是循环打卡功能，支持两种类型：
- **周期打卡 (periodic)**: 每日、每周、每月周期性打卡，支持 streak 连续统计
- **计数打卡 (count)**: 单纯累计次数，无时间维度，无 streak

打卡可以关联 Milestone 进行进度追踪。

---

## 1. Milestone 重构

### 1.1 现有问题

当前 Milestone 使用特定字段关联：
- plan_id
- task_id  
- target_id

这种设计导致：
- 字段冗余
- 难以扩展支持新实体（如 circulation）
- 不符合开闭原则

### 1.2 重构方案

采用统一关联字段：

```rust
struct Milestone {
    id: String,
    title: String,
    target_date: Option<String>,
    // 统一关联字段
    biz_type: Option<String>,  // 'plan' | 'task' | 'target' | 'circulation'
    biz_id: Option<String>,     // 关联的实体ID
    // 移除旧的特定字段
    status: String,
    progress: i32,               // 由关联实体自动计算
    created_at: String,
    updated_at: String,
}
```

### 1.3 向后兼容

- biz_type 默认为 null，走原有逻辑
- 读取时优先读 biz_type/biz_id
- 旧数据 migration：将 plan_id/task_id/target_id 转换为 biz_type/biz_id

---

## 2. 数据模型

### 2.1 circulations 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PRIMARY KEY | UUID |
| title | TEXT NOT NULL | 打卡项标题 |
| content | TEXT | 备注描述 |
| type | TEXT NOT NULL | **periodic / count** |
| frequency | TEXT | periodic 时: daily / weekly / monthly |
| frequency_config | TEXT | JSON 配置（如每周具体哪天） |
| target_count | INTEGER | count 时: 目标次数 |
| current_count | INTEGER DEFAULT 0 | count 时: 当前累计 |
| streak_count | INTEGER DEFAULT 0 | periodic 时: 当前连续 |
| best_streak | INTEGER DEFAULT 0 | periodic 时: 历史最佳 |
| last_completed_at | TEXT | 上次完成时间 |
| status | TEXT DEFAULT 'active' | active / archived |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### 2.2 circulation_logs 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PRIMARY KEY | UUID |
| circulation_id | TEXT NOT NULL | 外键 |
| completed_at | TEXT NOT NULL | 完成时间 |
| note | TEXT | 用户打卡备注 |
| period | TEXT | periodic 时: 周期标识 (如 2024-W05) |

### 2.3 frequency_config JSON 结构

```json
// weekly 时
{ "weekdays": [1,2,3,4,5] }

// monthly 时
{ "days": [1, 15] }
```

---

## 3. 打卡类型详解

### 3.1 周期打卡 (periodic)

| 频率 | 周期重置时间 | 适用场景 |
|------|-------------|---------|
| daily | 每天 00:00 | 每日晨跑、喝水、读书 |
| weekly | 每周一 00:00 | 每周总结、周计划 |
| monthly | 每月1日 00:00 | 每月复盘、账单整理 |

### 3.2 计数打卡 (count)

- 无时间维度
- 用户手动点击完成进行累加
- 无 streak 概念
- 可设置目标次数（如"本月运动10次"）

---

## 4. Streak 计算规则

### 4.1 Daily (每日)

```
状态判断基于 last_completed_at:
- 昨天完成 + 今天完成 → streak + 1
- 昨天未完成 + 今天完成 → streak = 1 (重新开始)
- 昨天完成 + 今天未完成 → streak 保持，明天再计
```

### 4.2 Weekly (每周)

```
- 上周完成 + 本周完成 → streak + 1
- 上周未完成 + 本周完成 → streak = 1
- period 格式: "2024-W05" (年-周数)
```

### 4.3 Monthly (每月)

```
- 上月完成 + 本月完成 → streak + 1
- 上月未完成 + 本月完成 → streak = 1
- period 格式: "2024-02"
```

---

## 5. UI 设计

### 5.1 路由结构

```
/circulations
├── /circulations/today     (今日打卡 - periodic/daily)
/circulations/weekly       (每周打卡 - periodic/weekly)
/circulations/monthly      (每月打卡 - periodic/monthly)
/circulations/count       (计数打卡 - count)
/circulations/settings    (打卡设置 - 管理所有打卡项)
```

### 5.2 打卡设置页面

Tab 切换分类：
- 周期打卡 (Periodic)
  - 每日
  - 每周
  - 每月
- 计数打卡 (Count)

每个 Tab 下展示该类型所有打卡项列表。

### 5.3 今日打卡页面

展示今日需要打卡的项：
- periodic/daily 全部显示
- periodic/weekly 显示今日是周几
- periodic/monthly 显示今日是几号
- 点击打卡按钮进行二次确认

### 5.4 打卡详情页

- 打卡项基本信息
- streak / count 统计
- 最近 20 条打卡记录

### 5.5 打卡交互流程

```
用户点击打卡
    ↓
弹出确认框 (二次确认)
    ↓
用户输入备注 (可选)
    ↓
确认打卡
    ↓
更新 streak / count
    ↓
记录 circulation_log
    ↓
显示成功反馈
```

---

## 6. API 设计

### 6.1 CRUD 接口

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /circulations | 获取所有打卡项 |
| GET | /circulations/:id | 获取单个 |
| GET | /circulations?type=periodic&frequency=daily | 筛选 |
| POST | /circulations | 创建 |
| PUT | /circulations/:id | 更新 |
| DELETE | /circulations/:id | 删除 |

### 6.2 打卡操作

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /circulations/:id/checkin | 打卡 |
| POST | /circulations/:id/undo | 撤销最近一次打卡 |
| GET | /circulations/:id/logs | 获取打卡记录(最新20条) |
| GET | /circulations/:id/stats | 获取统计 |

### 6.3 今日数据

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /circulations/today | 获取今日待打卡列表 |

---

## 7. 集成到现有模块

### 7.1 Dashboard

新增字段：
- today_circulations: 今日打卡项列表
- today_completed: 今日已完成数
- today_pending: 今日待打卡数
- current_streak: 全局当前 streak（最长）

### 7.2 Statistics 统计页面

- 打卡完成率图表
- streak 排行
- count 累计排行

### 7.3 Export / Import

导出数据包含：
- circulations 表
- circulation_logs 表

### 7.4 Notifications 通知

可选功能：
- 打卡提醒（可配置时间）
- 打卡完成通知
- 连续打卡成就通知

### 7.5 Milestone 集成

Milestone.biz_type = 'circulation' 时：
- progress = circulation.streak_count (periodic)
- progress = circulation.current_count (count)

---

## 8. 数据库迁移

### 8.1 新增表

```sql
CREATE TABLE circulations (...);
CREATE TABLE circulation_logs (...);
```

### 8.2 Milestone 字段变更

```sql
-- 添加新字段
ALTER TABLE milestones ADD COLUMN biz_type TEXT;
ALTER TABLE milestones ADD COLUMN biz_id TEXT;

-- 数据迁移 (伪代码)
UPDATE milestones 
SET biz_type = 'plan', biz_id = plan_id 
WHERE plan_id IS NOT NULL;

-- 删除旧字段 (可选，暂时保留兼容)
-- ALTER TABLE milestones DROP COLUMN plan_id;
-- ALTER TABLE milestones DROP COLUMN task_id;
-- ALTER TABLE milestones DROP COLUMN target_id;
```

---

## 9. 技术实现要点

### 9.1 后端 (Rust/Tauri)

1. 新增 models: Circulation, CirculationLog
2. 新增 commands: CRUD + checkin
3. streak 计算逻辑在 checkin 时处理
4. 日志记录每次打卡

### 9.2 前端 (React/Next.js)

1. 新增 CirculationsView
2. 打卡二次确认弹窗组件
3. Tab 切换 UI
4. 最近记录列表

### 9.3 类型定义

```typescript
type CirculationType = 'periodic' | 'count';
type PeriodicFrequency = 'daily' | 'weekly' | 'monthly';

interface Circulation {
  id: string;
  title: string;
  content?: string;
  type: CirculationType;
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

interface CirculationLog {
  id: string;
  circulation_id: string;
  completed_at: string;
  note?: string;
  period?: string;
}
```

---

## 10. 待确认问题

- [x] 打卡提醒通知 - 记录到 iteration-plan.md 作为后续迭代功能
- [x] streak 中断后不支持补卡
- [x] 需要"撤销打卡"功能
