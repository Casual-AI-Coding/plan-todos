# Circulation (打卡) 功能设计

> 创建日期：2026-02-19
> 版本：v1.0
> 状态：已完成

---

## 1. 概述

Circulation（打卡）是一个循环任务功能，支持每日、每周、每月固定打卡，以及计数打卡。

---

## 2. 概念设计

### 2.1 实体定义

**Circulation（打卡项）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| title | String | 打卡项名称 |
| content | String? | 描述/备注 |
| circulation_type | String | `periodic` (周期) 或 `count` (计数) |
| frequency | String? | `daily` / `weekly` / `monthly` (周期打卡) |
| frequency_config | String? | JSON 配置（如每周特定日期） |
| target_count | Int? | 目标次数 (计数打卡) |
| current_count | Int | 当前进度 (计数打卡) |
| streak_count | Int | 当前连续天数 (周期打卡) |
| best_streak | Int | 最佳连续记录 (周期打卡) |
| last_completed_at | String? | 上次完成时间 |
| status | String | `active` 或 `archived` |
| created_at | String | 创建时间 |
| updated_at | String | 更新时间 |

**CirculationLog（打卡记录）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| circulation_id | String | 关联的打卡项 ID |
| completed_at | String | 打卡时间 |
| note | String? | 打卡备注 |
| period | String? | 周期标识 (`2024-W05`, `2024-02`) |

### 2.2 打卡类型

| 类型 | 说明 | 频率选项 |
|------|------|----------|
| periodic | 周期打卡 | daily / weekly / monthly |
| count | 计数打卡 | 无频率，持续累加 |

### 2.3 Streak 计算逻辑

**每日打卡**
- 连续日期：昨天打卡 + 今天打卡 = 2 天
- 中断：某天未打卡，streak 归零重新计算

**每周打卡**
- 连续周：上周完成 + 本周完成 = 2 周
- 周一为一周开始

**每月打卡**
- 连续月：上月完成 + 本月完成 = 2 月
- 每月 1 日为开始

---

## 3. UI 设计

### 3.1 侧边栏

```
TODOS → CIRCLUATIONS → PLANS
```

- 位置：TODOS 和 PLANS 中间
- 图标：🔄
- 标签：CIRCLUATIONS
- 无子菜单（通过页面内 Tab 切换）

### 3.2 打卡主页 (CirculationsView)

**布局结构**

```
┌─────────────────────────────────────────────┐
│  打卡                            [今日打卡] [打卡设置]    [+ 新建]  │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ 🔥 连续 5 天      ✨ 最佳 15 天     │   │
│  │                                       │   │
│  │ 晨跑                        [打卡]   │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ 📊 3/8 次                          │   │
│  │                                       │   │
│  │ 喝水                          [+][-]  │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**组件说明**

1. **Tab 切换**
   - 位置：标题右侧
   - 选项：今日打卡 | 打卡设置
   - 样式：按钮组，当前选中高亮

2. **新建按钮**
   - 位置：Tab 行最右边
   - 样式：+ 新建

3. **设置 Tab 内**
   - 二级 Tab：周期打卡 | 计数打卡
   - 周期打卡子 Tab：每日 | 每周 | 每月

4. **卡片布局**
   - 周期打卡卡片：
     - 标题
     - 🔥 连续 X 天
     - ✨ 最佳 X 天
     - 打卡/撤销按钮
   - 计数打卡卡片：
     - 标题
     - 📊 当前/目标 次
     - + / - 按钮

### 3.3 打卡详情页 (CirculationDetailView)

**布局结构**

```
┌─────────────────────────────────────────────┐
│  ← 返回          晨跑                       │
├─────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────┐│
│  │  🔥 5   │ │ ✨ 15   │ │ 📊 3   │ │ ∞  ││
│  │当前连续  │ │ 最佳记录│ │已完成  │ │目标││
│  └─────────┘ └─────────┘ └─────────┘ └────┘│
│                                             │
│            [ 立即打卡 ]                      │
│                                             │
│  ─────── 打卡记录 ───────                  │
│  2024-02-19 10:30 ✓                        │
│  2024-02-18 09:15 ✓  早上好                │
│  2024-02-17 08:00 ✓                        │
└─────────────────────────────────────────────┘
```

### 3.4 Dashboard 集成

**打卡统计卡片**

```
┌─────────────────────────────────────────────┐
│  今日待打卡    今日已完成    当前最长连续    │
│      3             2             5         │
└─────────────────────────────────────────────┘
```

位置：现有 Stats Cards 下方

### 3.5 Statistics 集成

**打卡统计区域**

```
┌─────────────────────────────────────────────┐
│  总打卡项    活跃打卡    平均连续天数        │
│      10          8            4.2          │
└─────────────────────────────────────────────┘
```

位置：现有统计下方，新增独立区域

---

## 4. 功能设计

### 4.1 打卡操作

| 操作 | 说明 | 触发条件 |
|------|------|----------|
| 打卡 | 记录一次完成 | 点击打卡按钮 |
| 撤销 | 撤销今日打卡 | 点击撤销按钮 |
| +1 | 计数+1 (计数打卡) | 点击 + 按钮 |
| -1 | 计数-1 (计数打卡) | 点击 - 按钮 |

### 4.2 CRUD 操作

| 操作 | 说明 |
|------|------|
| 创建 | 填写标题、类型、频率/目标 |
| 编辑 | 修改标题、类型、频率/目标 |
| 删除 | 确认后删除 |
| 归档 | 归档后不在列表显示 |

### 4.3 今日打卡逻辑

**周期打卡**
- daily: 每天需要打卡
- weekly: 每周一需要打卡
- monthly: 每月1日需要打卡

**计数打卡**
- 每天都可以打卡，次数无限制

### 4.4 种子数据

创建以下示例打卡：

| 类型 | 名称 | 频率/目标 |
|------|------|----------|
| 每日 | 晨跑 | daily |
| 每日 | 读书 | daily |
| 每日 | 喝水 | daily |
| 每周 | 周报 | weekly |
| 每周 | 周复盘 | weekly |
| 每月 | 月总结 | monthly |
| 计数 | 喝水 | target: 8 |
| 计数 | 每日10000步 | target: 10000 |

---

## 5. 技术实现

### 5.1 数据库

```sql
-- circulations 表
CREATE TABLE circulations (
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
);

-- circulation_logs 表
CREATE TABLE circulation_logs (
    id TEXT PRIMARY KEY,
    circulation_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    note TEXT,
    period TEXT,
    FOREIGN KEY (circulation_id) REFERENCES circulations(id) ON DELETE CASCADE
);
```

### 5.2 后端命令

| 命令 | 说明 |
|------|------|
| get_circulation | 获取单个打卡 |
| get_circulations | 获取所有打卡 |
| get_circulations_by_type | 按类型筛选 |
| create_circulation | 创建打卡 |
| update_circulation | 更新打卡 |
| delete_circulation | 删除打卡 |
| checkin_circulation | 打卡 |
| undo_checkin_circulation | 撤销打卡 |
| get_circulation_logs | 获取打卡记录 |

### 5.3 前端组件

| 组件 | 说明 |
|------|------|
| CirculationsView | 打卡主页 |
| CirculationDetailView | 打卡详情页 |
| CheckinConfirm | 打卡确认弹窗 |

---

## 6. 页面检查清单

- [x] 侧边栏菜单位置
- [x] 打卡主页 Tab 切换
- [x] 打卡列表卡片式布局
- [x] 新建按钮位置（Tab 行最右边）
- [x] Streak 显示（主页 + 详情页）
- [x] Dashboard 打卡统计
- [x] Statistics 打卡统计
- [x] 种子数据

---

## 7. 更新历史

| 日期 | 操作 |
|------|------|
| 2026-02-19 | 创建文档 v1.0 |
