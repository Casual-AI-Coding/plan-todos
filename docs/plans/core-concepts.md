# Plan Todos - 设计文档

> 创建日期：2026-02-13
> 更新日期：2026-02-13

---

## 一、产品概述

**产品定位**：本地优先的跨平台任务管理应用，融合短期 TODO 与长期 PLAN，帮助用户追踪日常事务与长期目标。

**核心理念**：
- 本地化存储，数据不上云（隐私优先）
- 短期任务与长期计划无缝关联
- 跨平台支持（桌面 + 移动 + Web 调试）

---

## 二、技术架构

### 2.1 技术栈

| 组件 | 技术选择 |
|------|----------|
| 核心框架 | Tauri v2 (Rust) |
| 前端 | Next.js (App Router) + React |
| 语言 | TypeScript |
| 数据库 | SQLite (本地文件) |
| 测试 | Vitest + Playwright |
| UI 设计系统 | ui-ux-pro-max (Fira Code/Sans + Teal/Orange) |

### 2.2 架构图

```
                    ┌─────────────────────────────────┐
                    │        Rust 核心业务逻辑          │
                    │   (数据库操作、通知、计划任务)    │
                    └─────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │  Tauri    │   │  Tauri    │   │  Tauri    │
            │  Desktop  │   │   iOS     │   │ Android   │
            │ (Windows) │   │ (WebView) │   │ (WebView) │
            └───────────┘   └───────────┘   └───────────┘

     ┌──────────────────────────────────────────────────────┐
     │              Web 调试模式 (开发时)                    │
     │   Tauri dev server → 浏览器访问 ←→ Rust 后端共享    │
     └──────────────────────────────────────────────────────┘
```

---

## 三、核心概念模型

### 3.1 概念总览

```
┌─────────────────────────────────────────────────────────────────┐
│                    概念关系总览                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐         ┌──────────────┐                    │
│   │    Target    │◄───────►│     Step     │                    │
│   │  长期目标     │  1:N    │   步骤/权重   │                    │
│   │ 有截止日期    │         │ 无时间概念    │                    │
│   │ 有进度(%)    │         │ 完成累加进度  │                    │
│   └──────────────┘         └──────────────┘                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐         ┌──────────────┐                    │
│   │    Plan      │◄───────►│     Task     │                    │
│   │  长期计划     │  1:N    │   短期任务    │                    │
│   │ 有持续时间    │         │ 有持续时间    │                    │
│   │ 可拆分        │         │ 属于Plan     │                    │
│   └──────────────┘         └──────────────┘                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐                                              │
│   │     Todo     │  ← 独立，无关联                               │
│   │                                                │
│   │ 有截止日期    │                                              │
短期事项     ││   └──────────────┘                                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐                                              │
│   │   Milestone  │  ← 进度检查点                                  │
│   │   里程碑     │  ← 可关联 Plan/Task/Target (三选一)          │
│   └──────────────┘                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
┌─────────────────────────────────────────────────────────────────┐
│                    概念关系总览                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐         ┌──────────────┐                    │
│   │    Target    │◄───────►│     Step     │                    │
│   │  长期目标     │  1:N    │   步骤/权重   │                    │
│   │ 有截止日期    │         │ 无时间概念    │                    │
│   │ 有进度(%)    │         │ 完成累加进度  │                    │
│   └──────────────┘         └──────────────┘                    │
│          │                                                       │
│          │ 关联 (可选)                                           │
│          ▼                                                       │
│   ┌──────────────┐                                              │
│   │   Milestone  │  ← 反映 Target 进度                          │
│   │   里程碑     │                                              │
│   └──────────────┘                                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐         ┌──────────────┐                    │
│   │    Plan      │◄───────►│     Task     │                    │
│   │  长期计划     │  1:N    │   短期任务    │                    │
│   │ 有持续时间    │         │ 有持续时间    │                    │
│   │ 可拆分        │         │ 属于Plan     │                    │
│   └──────────────┘         └──────────────┘                    │
│          │                                                       │
│          │ 关联 (可选)                                           │
│          ▼                                                       │
│   ┌──────────────┐                                              │
│   │   Milestone  │  ← 反映 Plan/Task 进度                       │
│   │   里程碑     │                                              │
│   └──────────────┘                                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐                                            │
│   │     Todo     │                                            │
│   │  短期事项     │  ← 独立，无关联                            │
│   │ 有截止日期    │                                            │
│   │ 状态: pending/in-progress/done                           │
│   └──────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 详细定义

| 概念 | 类型 | 时间属性 | 进度 | 关联 |
|------|------|---------|------|------|
| **Plan** | 长期计划 | 持续时间 (start~end) | Task 完成百分比 | 1→N Task |
| **Task** | 短期任务 | 持续时间 (start~end) | 完成状态 | 属于 1 Plan |
| **Target** | 长期目标 | 截止日期 | Step 权重累加 | 1→N Step |
| **Step** | 步骤 | 无 | 权重值 (0-100%) | 属于 1 Target |
| **Todo** | 短期事项 | 截止日期 | 完成状态 | 独立 |
| **Milestone** | 里程碑 | 可选日期 | 衍生 | 关联 Plan/Task/Target |

### 3.3 状态定义

```
Plan:      active | completed | archived
Task:      pending | in-progress | done
Target:    active | completed | archived  
Step:      pending | completed
Todo:      pending | in-progress | done
Milestone: pending | completed
```

### 3.4 Milestone 定位（混合模式）

Milestone = **进度检查点 + 阶段性目标**

- 用户手动创建 Milestone
- 手动关联 Plan/Task/Target（三选一）
- 自动根据关联项的完成度计算进度

```
Milestone = {
  id: string,
  title: string,           // 如 "设计完成"
  target_date?: string,    // 可选目标日期
  // 关联类型 (三选一)
  plan_id?: string,        // 关联的 Plan
  task_id?: string,       // 关联的 Task  
  target_id?: string,     // 关联的 Target
  status: 'pending' | 'completed'
  // 进度 = 关联项的完成度
}
```

---

## 四、数据模型

### 4.1 Plan - 长期计划

```typescript
interface Plan {
  id: string;
  title: string;              // 计划标题
  description?: string;       // 描述
  start_date?: string;       // 开始日期
  end_date?: string;          // 结束日期
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}
```

### 4.2 Task - 短期任务

```typescript
interface Task {
  id: string;
  plan_id: string;           // 所属 Plan
  title: string;              // 任务标题
  description?: string;       // 描述
  start_date?: string;       // 开始日期
  end_date?: string;          // 结束日期
  status: 'pending' | 'in-progress' | 'done';
  created_at: string;
  updated_at: string;
}
```

### 4.3 Target - 长期目标

```typescript
interface Target {
  id: string;
  title: string;              // 目标标题
  description?: string;      // 描述
  due_date?: string;         // 截止日期
  status: 'active' | 'completed' | 'archived';
  // 进度 = 所有 Step 权重之和 (当 Step 完成时累加)
  created_at: string;
  updated_at: string;
}
```

### 4.4 Step - 步骤

```typescript
interface Step {
  id: string;
  target_id: string;          // 所属 Target
  title: string;              // 步骤标题
  weight: number;             // 权重 (0-100)，创建时校验总和 ≤ 100
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}
```

### 4.5 Todo - 短期事项

```typescript
interface Todo {
  id: string;
  title: string;              // 事项标题
  content?: string;           // 内容
  due_date?: string;          // 截止日期
  status: 'pending' | 'in-progress' | 'done';
  created_at: string;
  updated_at: string;
}
```

### 4.6 Milestone - 里程碑

```typescript
interface Milestone {
  id: string;
  title: string;              // 里程碑标题
  target_date?: string;      // 目标日期
  // 关联类型 (三选一)
  plan_id?: string;
  task_id?: string;
  target_id?: string;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}
```

---

## 五、核心功能

### 5.1 Plan/Task 管理

- 创建/编辑/删除 Plan
- Plan 设置开始/结束日期
- Plan 可拆分为多个 Task
- Task 关联到所属 Plan
- Task 设置开始/结束日期
- 追踪完成进度（Task 完成百分比）

### 5.2 Target/Step 管理

- 创建/编辑/删除 Target
- Target 设置截止日期
- Target 下创建 Steps
- Step 手动分配权重，创建时校验总和 ≤ 100%
- 进度自动计算（完成的 Step 权重累加）

### 5.3 Todo 管理

- 创建/编辑/删除 Todo
- 设置截止日期
- 标记状态（待处理/进行中/已完成）

### 5.4 Milestone 管理

- 创建/编辑/删除 Milestone
- 关联到 Plan/Task/Target（三选一）
- 设置目标日期（可选）
- 进度自动根据关联项计算

### 5.5 视图模式

| 视图 | 描述 |
|------|------|
| **列表视图** | 层级展示 Plan → Task / Target → Step / Todo |
| **日历视图** | 月/周/日视图，按日期显示 Todo/Task |
| **时间轴视图** | 甘特图样式，横向展示时间分布 |

### 5.6 推送通知

#### 插件式架构

```
┌─────────────────────────────────────────────┐
│              Notification Core              │
│  ┌─────────────────────────────────────────┐ │
│  │ Event Bus - 事件中心                     │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│              Plugin Interface               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │
│  │飞书  │ │钉钉  │ │ 邮件  │ │ Webhook  │  │
│  │插件  │ │插件  │ │ 插件  │ │   插件   │  │
│  └──────┘ └──────┘ └──────┘ └──────────┘  │
└─────────────────────────────────────────────┘
```

#### 通知类型

| 类型 | 触发条件 | 示例 |
|------|----------|------|
| 定时提醒 | 到期前 X 分钟/小时/天 | "项目A设计稿还有 30 分钟到期" |
| 事件触发 | 任务完成/新建/更新 | "你已完成 '回复邮件'" |
| 每日汇总 | 每天早上 9 点 | "今日 3 件待办，2 件已过期" |

---

## 六、UI/UX 设计

### 6.1 设计系统

使用 ui-ux-pro-max 生成的设计系统：

| 元素 | 规格 |
|------|------|
| 主色 | `#0D9488` (Teal) |
| 次色 | `#14B8A6` |
| 强调/CTA | `#F97316` (Orange) |
| 背景 | `#F0FDFA` |
| 文字 | `#134E4A` |
| 标题字体 | Fira Code |
| 正文字体 | Fira Sans |

### 6.2 风格

- **微交互**：小动画、手感反馈、流畅过渡
- 适合移动端和生产力工具

### 6.3 响应式布局

```
┌─────────────────────────────────────────────────┐
│ 桌面端 (>1024px)                                │
│ ┌──────────┬────────────────────────────────┐  │
│ │  侧边栏   │           主内容区              │  │
│ │  (240px) │                                │  │
│ └──────────┴────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│ 平板端 (768-1024px)                             │
│ ┌────────────┬─────────────────────────────┐   │
│ │  侧边栏    │        主内容区               │   │
│ │  (可收起)  │                              │   │
│ └────────────┴─────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│ 手机端 (<768px)                                │
│ ┌─────────────────────────┐                    │
│ │  底部导航栏              │                    │
│ │  [首页] [日历] [时间轴] [设置]                │   │
│ └─────────────────────────┘                    │
└─────────────────────────────────────────────────┘
```

---

## 七、数据流与状态管理

### 7.1 前端状态

```
React Context
├── PlanContext - Plan/Task 列表状态
├── TargetContext - Target/Step 列表状态
├── TodoContext - Todo 列表状态
├── MilestoneContext - Milestone 列表状态
└── UIContext - 视图切换、侧边栏状态
```

### 7.2 Tauri IPC

| 操作 | 命令 | 说明 |
|------|------|------|
| 获取所有 Plan | `get_plans` | 返回列表 |
| 创建 Plan | `create_plan` | 传入 title, description, start_date, end_date |
| 更新 Plan | `update_plan` | 支持部分更新 |
| 删除 Plan | `delete_plan` | 级联删除关联 Task |
| 获取所有 Task | `get_tasks` | 返回列表 |
| 创建 Task | `create_task` | 传入 title, plan_id, start_date, end_date |
| 更新 Task | `update_task` | 支持部分更新 |
| 删除 Task | `delete_task` | |
| 获取所有 Target | `get_targets` | 返回列表 |
| 创建 Target | `create_target` | 传入 title, description, due_date |
| 更新 Target | `update_target` | 支持部分更新 |
| 删除 Target | `delete_target` | 级联删除关联 Step |
| 获取所有 Step | `get_steps` | 按 target_id 查询 |
| 创建 Step | `create_step` | 传入 title, target_id, weight |
| 更新 Step | `update_step` | 支持部分更新 |
| 删除 Step | `delete_step` | |
| 获取所有 Todo | `get_todos` | 返回列表 |
| 创建 Todo | `create_todo` | 传入 title, content, due_date |
| 更新 Todo | `update_todo` | 支持部分更新 |
| 删除 Todo | `delete_todo` | |
| 获取所有 Milestone | `get_milestones` | 返回列表 |
| 创建 Milestone | `create_milestone` | 传入 title, target_date, 关联类型 |
| 更新 Milestone | `update_milestone` | 支持部分更新 |
| 删除 Milestone | `delete_milestone` | |
| 发送通知 | `send_notification` | 调用通知插件 |

---

## 八、错误处理

### 8.1 前端

- **乐观更新**：UI 先更新，后台同步
- **错误回滚**：同步失败时恢复原状态
- **Toast 通知**：操作结果即时反馈

### 8.2 后端 (Rust)

- **Result 类型**：`Result<T, AppError>`
- **错误日志**：写入本地日志文件
- **数据校验**：创建/更新前校验必填字段

---

## 九、测试策略

| 层级 | 工具 | 覆盖范围 |
|------|------|----------|
| 单元测试 | Vitest | 业务逻辑、工具函数 |
| 集成测试 | Vitest | Tauri 命令、数据库 CRUD |
| E2E 测试 | Playwright | 核心用户流程 |

### 核心测试场景

1. 创建 Plan → 创建 Task → 完成 Task → 验证 Plan 进度
2. 创建 Target → 创建 Steps → 完成 Step → 验证 Target 进度
3. 创建 Milestone → 关联 Plan → 完成 Task → 验证 Milestone 进度
4. 日历视图创建/移动 Todo
5. 通知插件发送测试

---

## 十、里程碑规划

### Phase 1: 核心框架 ✅ 已完成 (2026-02-13)

- [x] Tauri 项目初始化
- [x] SQLite 数据库集成
- [x] 基础 CRUD API

### Phase 2: 数据模型实现 ✅ 已完成 (2026-02-14)

- [x] Plan/Task CRUD
- [x] Target/Step CRUD + 进度自动计算 + 权重校验
- [x] Todo CRUD
- [x] Milestone CRUD + 三选一关联验证

### Phase 3: 前端开发 ✅ 已完成 (2026-02-14)

- [x] 列表视图 (Todos/Plans/Targets/Milestones)
- [x] 日历视图
- [x] 看板视图
- [x] 时间轴视图
- [x] 响应式布局
- [x] Dashboard 今日总览

### Phase 4: API 优化 🚧 进行中

- [ ] 添加数据库索引
- [ ] 实现统计 API (`get_statistics`)
- [ ] 实现 Dashboard API (`get_dashboard`)
- [ ] 添加单个实体查询 API
- [ ] 实现批量操作 API

### Phase 5: 通知系统 📋 待规划

- [ ] 通知核心架构
- [ ] 飞书/钉钉/邮件/Webhook 插件
- [ ] 定时任务

### Phase 6: 移动端 📋 待规划

- [ ] Tauri iOS 构建
- [ ] Tauri Android 构建

### Phase 7: 数据同步 📋 待规划

- [ ] iCloud/Google Drive/OneDrive 同步
- [ ] 本地文件导入导出
- [ ] 冲突解决策略

---

## 十一、数据备份与同步

### 11.1 设计理念

本地存储优先，但支持通过第三方备份服务实现数据备份与多设备同步。

### 11.2 支持的备份服务

| 服务 | 类型 | 说明 |
|------|------|------|
| **iCloud** | 云同步 | Apple 用户，跨 iPhone/iPad/Mac |
| **Google Drive** | 云同步 | Android/跨平台用户 |
| **OneDrive** | 云同步 | Microsoft 生态用户 |
| **Dropbox** | 云同步 | 通用云盘 |
| **本地文件** | 手动备份 | 导出为 JSON/SQLite 文件 |
| **WebDAV** | 自托管 | 支持自建 NAS（如坚果云、Nextcloud） |

### 11.3 同步机制

```
┌─────────────────────────────────────────────────────┐
│                   数据同步层                          │
│  ┌─────────────────────────────────────────────────┐│
│  │           Sync Engine (Rust)                    ││
│  │  - 检测文件变化                                 ││
│  │  - 冲突解决（本地优先 / 服务端优先 / 手动合并）││
│  │  - 增量同步                                   ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────┐
│                   存储层                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │ iCloud  │ │  Drive  │ │OneDrive │ │ WebDAV │ │
│  │  Drive  │ │         │ │         │ │        │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
└─────────────────────────────────────────────────────┘
```

### 11.4 数据格式

- **SQLite 文件**：直接同步 `.db` 文件（简单，但可能有并发问题）
- **JSON 导出**：结构化数据，易于版本控制和冲突解决（推荐）

### 11.5 冲突解决策略

| 策略 | 描述 | 适用场景 |
|------|------|----------|
| **本地优先** | 保留本地修改，覆盖服务端 | 个人设备，不希望被其他设备干扰 |
| **服务端优先** | 保留服务端修改，覆盖本地 | 多设备协作，希望最新修改生效 |
| **手动合并** | 提示用户选择 | 重要数据，需要人工确认 |

---

## 十二、文件结构

```
plan-todos/
├── src/                      # Next.js 前端
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── styles/
├── src-tauri/                # Rust 后端
│   ├── src/
│   │   ├── commands/         # Tauri 命令
│   │   ├── db/              # 数据库操作
│   │   ├── notifications/   # 通知系统
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/
│   └── plans/               # 设计文档
├── design-system/           # 设计系统
├── AGENTS.md                # 开发指南
└── package.json
```
