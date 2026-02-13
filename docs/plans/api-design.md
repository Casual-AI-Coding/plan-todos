# Plan Todos - API 设计

> 状态：✅ 已实现（2026-02-14）
> 
> **实际状态**：所有实体 CRUD API 已完成

---

## 一、API 概述

- **协议**：HTTP (Tauri IPC 命令)
- **格式**：JSON
- **基础路径**：`ipc://localhost/`

---

## 二、通用约定

### 请求格式

```typescript
{
  "cmd": "command_name",
  "payload": { /* 请求参数 */ }
}
```

### 响应格式

```typescript
// 成功
{
  "ok": true,
  "data": { /* 响应数据 */ }
}

// 失败
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

### 错误代码

| 代码 | 说明 |
|------|------|
| `NOT_FOUND` | 资源不存在 |
| `VALIDATION_ERROR` | 参数校验失败 |
| `WEIGHT_EXCEEDED` | 权重超限 (Step) |
| `INVALID_REFERENCE` | 无效的关联引用 |
| `INTERNAL_ERROR` | 内部错误 |

---

## 三、Plan API

### 3.1 获取所有 Plan

```typescript
// 请求
{ "cmd": "get_plans", "payload": { status?: "active" | "completed" | "archived" } }

// 响应
{
  "ok": true,
  "data": [
    {
      "id": "plan_xxx",
      "title": "Plan A",
      "description": "...",
      "start_date": "2026-01-01",
      "end_date": "2026-03-31",
      "status": "active",
      "progress": 60,  // 自动计算: (done_task_count / total_task_count) * 100
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-02-13T00:00:00Z"
    }
  ]
}
```

### 3.2 获取单个 Plan

```typescript
// 请求
{ "cmd": "get_plan", "payload": { id: "plan_xxx" } }
```

### 3.3 创建 Plan

```typescript
// 请求
{ 
  "cmd": "create_plan", 
  "payload": {
    title: string,
    description?: string,
    start_date?: string,
    end_date?: string
  }
}

// 响应
{ "ok": true, "data": { /* Plan对象 */ } }
```

### 3.4 更新 Plan

```typescript
// 请求
{ 
  "cmd": "update_plan", 
  "payload": {
    id: string,
    title?: string,
    description?: string,
    start_date?: string,
    end_date?: string,
    status?: "active" | "completed" | "archived"
  }
}
```

### 3.5 删除 Plan

```typescript
// 请求
{ "cmd": "delete_plan", "payload": { id: "plan_xxx" } }

// 级联删除：同时删除关联的 Task
```

---

## 四、Task API

### 4.1 获取所有 Task

```typescript
// 请求
{ 
  "cmd": "get_tasks", 
  "payload": { 
    plan_id?: string,
    status?: "pending" | "in-progress" | "done"
  } 
}
```

### 4.2 创建 Task

```typescript
// 请求
{ 
  "cmd": "create_task", 
  "payload": {
    plan_id: string,
    title: string,
    description?: string,
    start_date?: string,
    end_date?: string
  }
}
```

### 4.3 更新 Task

```typescript
// 请求
{ 
  "cmd": "update_task", 
  "payload": {
    id: string,
    title?: string,
    description?: string,
    start_date?: string,
    end_date?: string,
    status?: "pending" | "in-progress" | "done"
  }
}
```

### 4.4 删除 Task

```typescript
// 请求
{ "cmd": "delete_task", "payload": { id: "task_xxx" } }
```

---

## 五、Target API

### 5.1 获取所有 Target

```typescript
// 请求
{ "cmd": "get_targets", "payload": { status?: "active" | "completed" | "archived" } }

// 响应
{
  "data": [
    {
      "id": "target_xxx",
      "title": "Target X",
      "description": "...",
      "due_date": "2026-06-30",
      "status": "active",
      "progress": 70,  // 自动计算: 完成Step权重之和
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

### 5.2 创建 Target

```typescript
{ 
  "cmd": "create_target", 
  "payload": {
    title: string,
    description?: string,
    due_date?: string
  }
}
```

### 5.3 更新 Target

```typescript
{ 
  "cmd": "update_target", 
  "payload": {
    id: string,
    title?: string,
    description?: string,
    due_date?: string,
    status?: "active" | "completed" | "archived"
  }
}
```

### 5.4 删除 Target

```typescript
{ "cmd": "delete_target", "payload": { id: "target_xxx" } }

// 级联删除：同时删除关联的 Step
```

---

## 六、Step API

### 6.1 获取所有 Step

```typescript
// 请求
{ "cmd": "get_steps", "payload": { target_id: "target_xxx" } }

// 响应
{
  "data": [
    {
      "id": "step_xxx",
      "target_id": "target_xxx",
      "title": "Step 1",
      "weight": 30,
      "status": "completed",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "total_weight": 85  // 所有Step权重之和
}
```

### 6.2 创建 Step

```typescript
// 请求
{ 
  "cmd": "create_step", 
  "payload": {
    target_id: string,
    title: string,
    weight: number  // 0-100，创建时校验总权重 ≤ 100
  }
}

// 响应 (成功)
{ "ok": true, "data": { /* Step对象 */ } }

// 响应 (失败 - 权重超限)
{
  "ok": false,
  "error": {
    "code": "WEIGHT_EXCEEDED",
    "message": "权重总和不能超过100%，当前: 85%，新添加: 30%"
  }
}
```

### 6.3 更新 Step

```typescript
// 请求
{ 
  "cmd": "update_step", 
  "payload": {
    id: string,
    title?: string,
    weight?: number,  // 也会校验总权重
    status?: "pending" | "completed"
  }
}
```

### 6.4 删除 Step

```typescript
{ "cmd": "delete_step", "payload": { id: "step_xxx" } }
```

---

## 七、Todo API

### 7.1 获取所有 Todo

```typescript
// 请求
{ 
  "cmd": "get_todos", 
  "payload": { 
    status?: "pending" | "in-progress" | "done",
    due_date_start?: string,  // 截止日期范围
    due_date_end?: string
  } 
}
```

### 7.2 创建 Todo

```typescript
{ 
  "cmd": "create_todo", 
  "payload": {
    title: string,
    content?: string,
    due_date?: string
  }
}
```

### 7.3 更新 Todo

```typescript
{ 
  "cmd": "update_todo", 
  "payload": {
    id: string,
    title?: string,
    content?: string,
    due_date?: string,
    status?: "pending" | "in-progress" | "done"
  }
}
```

### 7.4 删除 Todo

```typescript
{ "cmd": "delete_todo", "payload": { id: "todo_xxx" } }
```

---

## 八、Milestone API

### 8.1 获取所有 Milestone

```typescript
// 请求
{ "cmd": "get_milestones", "payload": { status?: "pending" | "completed" } }

// 响应
{
  "data": [
    {
      "id": "milestone_xxx",
      "title": "Milestone 1",
      "target_date": "2026-03-15",
      "plan_id": "plan_xxx",
      "task_id": null,
      "target_id": null,
      "status": "pending",
      "progress": 60,  // 自动计算：关联实体的完成度
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

### 8.2 创建 Milestone

```typescript
// 请求 - 三选一关联
{ 
  "cmd": "create_milestone", 
  "payload": {
    title: string,
    target_date?: string,
    plan_id?: string,    // 选填其一
    task_id?: string,   // 选填其一
    target_id?: string  // 选填其一
  }
}

// 约束校验：必须且仅能选择一个关联
```

### 8.3 更新 Milestone

```typescript
{ 
  "cmd": "update_milestone", 
  "payload": {
    id: string,
    title?: string,
    target_date?: string,
    plan_id?: string,
    task_id?: string,
    target_id?: string,
    status?: "pending" | "completed"
  }
}
```

### 8.4 删除 Milestone

```typescript
{ "cmd": "delete_milestone", "payload": { id: "milestone_xxx" } }
```

---

## 九、统计 API

### 9.1 获取统计数据

```typescript
// 请求
{ "cmd": "get_statistics", "payload": { period?: "day" | "week" | "month" | "all" } }

// 响应
{
  "ok": true,
  "data": {
    "counts": {
      "todo": 45,
      "plan": 12,
      "task": 28,
      "target": 8,
      "step": 35,
      "milestone": 5
    },
    "completion": {
      "todo_done": 30,
      "task_done": 18,
      "step_done": 22,
      "milestone_done": 2
    },
    "trends": {
      // 日/周/月 完成趋势
    },
    "efficiency": {
      "streak_days": 5,
      "today_completed": 3,
      "week_completed": 15,
      "productivity_score": 85
    }
  }
}
```

### 9.2 获取今日概览

```typescript
// 请求
{ "cmd": "get_dashboard" }

// 响应
{
  "ok": true,
  "data": {
    "today_todos": [ /* 今天到期的Todo */ ],
    "upcoming_todos": [ /* 3天内到期 */ ],
    "completed_today": [ /* 今天完成 */ ],
    "active_plans": [ /* 进行中的Plan及进度 */ ],
    "active_targets": [ /* 进行中的Target及进度 */ ]
  }
}
```

---

## 十、批量操作

### 10.1 批量更新状态

```typescript
// 请求
{ 
  "cmd": "bulk_update_status", 
  "payload": {
    ids: string[],
    status: string
  }
}
```

---

## 十一、后续设计

- [ ] 组件设计 → `component-design.md`
