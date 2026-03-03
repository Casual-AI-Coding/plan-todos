# 代码审查问题修复计划

> 创建时间: 2026-03-03
> 版本: 0.5.8 → 0.5.9
> 目标: 修复代码审查发现的 16 个问题

---

## 一、问题概述

### 1.1 问题统计

| 优先级   | 数量   | 说明             |
| -------- | ------ | ---------------- |
| P0       | 3      | 必须阻塞发布     |
| P1       | 7      | 应在发布前修复   |
| P2       | 4      | 建议在本版本修复 |
| P3       | 2      | 可选改进         |
| **总计** | **16** |                  |

### 1.2 问题分布

| 模块                     | 问题数 |
| ------------------------ | ------ |
| Rust 后端 (circulations) | 5      |
| Rust 后端 (其他)         | 3      |
| 前端 API 层              | 5      |
| 前端类型定义             | 3      |

---

## 二、P0 问题修复方案

### 2.1 [P0-1] TOCTOU 竞态条件修复

**位置**: `src-tauri/src/commands/circulations/checkin.rs:24-114`

**问题描述**:

```rust
// 当前代码存在时间窗口漏洞
let circ: Circulation = stmt.query_row([...])?;  // 1. 读取
if let Some(ref last_completed) = circ.last_completed_at {
    // 2. 检查是否已打卡
}
// ⚠️ 时间窗口 - 并发请求可能在此期间通过检查
conn.execute("UPDATE circulations ...")?;  // 3. 更新
```

**修复方案**:

使用 `BEGIN IMMEDIATE` 事务获取排他锁：

```rust
pub async fn checkin_circulation(
    id: String,
    count: Option<i32>,
    note: Option<String>,
) -> Result<Circulation, String> {
    log_command!("checkin_circulation");

    let state = APP_STATE.get().ok_or("AppState not initialized")?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // 使用 IMMEDIATE 事务获取排他锁，防止并发
    let tx = conn.transaction_with_behavior(
        rusqlite::TransactionBehavior::Immediate
    ).map_err(|e| e.to_string())?;

    // 在事务内完成所有操作
    let circ = get_circulation_in_tx(&tx, &id)?;
    check_already_completed_today(&circ)?;  // 检查逻辑
    update_circulation_in_tx(&tx, &circ, count, note)?;  // 更新
    insert_log_in_tx(&tx, &circ, count, note)?;  // 插入日志

    tx.commit().map_err(|e| e.to_string())?;
    Ok(circ)
}
```

**实现步骤**:

1. 提取 `get_circulation_in_tx()`, `update_circulation_in_tx()`, `insert_log_in_tx()` 辅助函数
2. 使用 `transaction_with_behavior(Immediate)` 获取排他锁
3. 在事务内完成所有检查和更新操作

**测试用例**:

- 并发打卡测试：模拟 10 个并发请求，验证只有一个成功
- 已打卡再次打卡测试：验证返回正确错误信息

---

### 2.2 [P0-2] undo_checkin 事务包装

**位置**: `src-tauri/src/commands/circulations/checkin.rs:131-222`

**问题描述**:
多步操作无事务保护，中间失败会导致数据不一致：

1. 获取最新日志
2. 获取 circulation
3. 反转 count/streak
4. 删除日志

**修复方案**:

```rust
pub async fn undo_checkin_circulation(id: String) -> Result<Circulation, String> {
    log_command!("undo_checkin_circulation");

    let state = APP_STATE.get().ok_or("AppState not initialized")?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // 整个操作包装在事务中
    let tx = conn.transaction_with_behavior(
        rusqlite::TransactionBehavior::Immediate
    ).map_err(|e| e.to_string())?;

    // Step 1: 获取最新日志
    let latest_log = get_latest_log_in_tx(&tx, &id)?;

    // Step 2: 获取 circulation
    let mut circ = get_circulation_in_tx(&tx, &id)?;

    // Step 3: 反转数据
    reverse_circulation_data(&mut circ, &latest_log)?;
    update_circulation_in_tx(&tx, &circ)?;

    // Step 4: 删除日志
    delete_log_in_tx(&tx, &latest_log.id)?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok(circ)
}
```

**实现步骤**:

1. 提取事务内操作的辅助函数
2. 使用 Immediate 事务包装整个操作
3. 任何步骤失败自动回滚

---

### 2.3 [P0-3] bulk.ts 类型安全修复

**位置**: `src/lib/api/bulk.ts:12,24,35`

**问题描述**:

```typescript
// 当前代码 - status 接受任意字符串
export async function bulkUpdateTodoStatus(ids: string[], status: string);
```

**修复方案**:

```typescript
// 1. 从 types 导入正确的状态类型
import type { TodoStatus, TaskStatus, StepStatus } from "@/lib/types";

// 2. 定义批量操作状态类型
export type BulkTodoStatus = "pending" | "in-progress" | "done";
export type BulkTaskStatus = "pending" | "in-progress" | "done";
export type BulkStepStatus = "pending" | "completed";

// 3. 更新函数签名
export async function bulkUpdateTodoStatus(
    ids: string[],
    status: BulkTodoStatus
): Promise<void> { ... }

export async function bulkUpdateTaskStatus(
    ids: string[],
    status: BulkTaskStatus
): Promise<void> { ... }

export async function bulkUpdateStepStatus(
    ids: string[],
    status: BulkStepStatus
): Promise<void> { ... }
```

**实现步骤**:

1. 定义严格的 status 联合类型
2. 更新所有 bulk 函数签名
3. 更新测试文件中的 mock 数据

---

## 三、P1 问题修复方案

### 3.1 [P1-4] reset.rs 错误处理修复

**位置**: `src-tauri/src/commands/data/reset.rs:80,86`

**修复方案**:

```rust
// Before:
let count: i32 = tx.query_row("SELECT COUNT(*) ...", [], |row| row.get(0))
    .unwrap_or(0);  // 静默错误

tx.execute("INSERT INTO daily_summary_settings ...").ok();  // 忽略错误

// After:
let count: i32 = tx.query_row("SELECT COUNT(*) ...", [], |row| row.get(0))
    .map_err(|e| format!("Failed to count settings: {}", e))?;

if count == 0 {
    tx.execute("INSERT INTO daily_summary_settings ...")
        .map_err(|e| format!("Failed to insert default settings: {}", e))?;
}
```

---

### 3.2 [P1-5] 数据库 prepare 错误处理

**位置**: `src-tauri/src/commands/circulations/checkin.rs:257,354`

**修复方案**:

```rust
// Before:
let mut stmt = conn.prepare("SELECT ...").unwrap();

// After:
let mut stmt = conn.prepare("SELECT ...")
    .map_err(|e| format!("Failed to prepare statement: {}", e))?;
```

---

### 3.3 [P1-6] validation.rs API 一致性

**位置**: `src-tauri/src/commands/validation.rs:120-129`

**修复方案**:

```rust
// Before: 返回默认值，调用者无法区分无效输入
pub fn validate_and_normalize_color(color: &str) -> String {
    if valid { return color.to_string(); }
    "#3B82F6".to_string()  // 默认值
}

// After: 返回 Result，保持与其他验证函数一致
pub fn validate_color(color: &str) -> Result<String, String> {
    if !color.starts_with('#') || color.len() != 7 {
        return Err(format!("Invalid color '{}'. Must be #RRGGBB", color));
    }
    if !color[1..].chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(format!("Invalid color '{}'. Contains non-hex characters", color));
    }
    Ok(color.to_string())
}

// 提供默认值函数
pub fn normalize_color_or_default(color: &str) -> String {
    validate_color(color).unwrap_or_else(|_| "#3B82F6".to_string())
}
```

---

### 3.4 [P1-7] API 层错误处理标准化

**位置**: `src/lib/api/todos.ts`, `src/lib/api/circulations.ts`

**修复方案**:

创建统一的 Tauri 环境检查和错误处理工具：

```typescript
// src/lib/api/utils.ts

/** 统一的 Tauri 环境检查，抛出一致的错误信息 */
export function ensureTauri(operation: string): void {
  if (!isTauri()) {
    throw new Error(`此操作需要在 Tauri 环境中运行: ${operation}`);
  }
}

/** 统一的 API 调用包装器 */
export async function withTauriError<T>(
  operation: string,
  fn: () => Promise<T>,
): Promise<T> {
  ensureTauri(operation);
  try {
    return await fn();
  } catch (error) {
    throw new Error(
      `${operation} 失败: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
```

更新所有 API 函数：

```typescript
// Before:
export async function getTodos(): Promise<Todo[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri environment");
    return [];
  }
  return invoke("get_todos");
}

// After:
export async function getTodos(): Promise<Todo[]> {
  return withTauriError("获取 Todo 列表", () => invoke("get_todos"));
}

export async function getTodo(id: string): Promise<Todo> {
  return withTauriError("获取 Todo", () => invoke("get_todo", { id }));
}
```

---

### 3.5 [P1-8] statistics.ts Mock 数据提取

**位置**: `src/lib/api/statistics.ts:12-46`

**修复方案**:

```typescript
// src/lib/api/constants.ts
export const MOCK_DASHBOARD_DATA: DashboardData = {
    today: {
        pending: 0,
        in_progress: 0,
        completed: 0,
        overdue: 0,
    },
    week: { ... },
    month: { ... },
    // ...
};

// statistics.ts
import { MOCK_DASHBOARD_DATA } from "./constants";

export async function getDashboardData(): Promise<DashboardData> {
    if (!isTauri()) {
        return MOCK_DASHBOARD_DATA;
    }
    return invoke("get_dashboard_data");
}
```

---

### 3.6 [P1-9] 移除死代码

**位置**: `src/lib/api/client.ts:18-24`

**修复方案**:

选项 A (推荐): 使用 `withTauriError` 并移除原函数
选项 B: 如果不使用，直接删除

```typescript
// 删除未使用的 withTauriError 函数
// 因为新的 utils.ts 提供了更好的实现
```

---

### 3.7 [P1-10] 类型定义修复

**位置**: `src/lib/types/statistics.ts:89,97,105`

**修复方案**:

```typescript
// Before:
status: string;
priority: string;

// After:
import type { Priority } from "./common";

export type StatisticsTodoStatus = "pending" | "in-progress" | "done";
export type StatisticsTaskStatus = "pending" | "in-progress" | "done";
export type StatisticsStepStatus = "pending" | "completed";

interface StatisticsTodo {
  status: StatisticsTodoStatus;
  priority: Priority;
  // ...
}
```

---

## 四、P2 问题修复方案

### 4.1 [P2-11] 魔法数字常量化

**位置**: `src-tauri/src/commands/circulations.rs:126,143`

**修复方案**:

```rust
// 在文件顶部定义常量
const DEFAULT_CIRCULATION_LIMIT: i32 = 20;
const DEFAULT_LOGS_LIMIT: i32 = 50;
const MAX_CIRCULATION_LIMIT: i32 = 100;

// 使用常量
let limit = limit.unwrap_or(DEFAULT_CIRCULATION_LIMIT).min(MAX_CIRCULATION_LIMIT);
```

---

### 4.2 [P2-12] filter_map 错误日志

**位置**: `src-tauri/src/commands/circulations/statistics.rs:44,100`

**修复方案**:

```rust
// Before:
Ok(log_iter.filter_map(|l| l.ok()).collect())

// After:
let logs: Vec<CirculationLog> = log_iter
    .filter_map(|l| {
        match l {
            Ok(log) => Some(log),
            Err(e) => {
                eprintln!("Warning: Failed to deserialize circulation log: {}", e);
                None
            }
        }
    })
    .collect();
Ok(logs)
```

---

### 4.3 [P2-13] count 参数上限验证

**位置**: `src-tauri/src/commands/circulations/checkin.rs:75`

**修复方案**:

```rust
const MAX_CHECKIN_COUNT: i32 = 1000;

let add_count = count
    .unwrap_or(1)
    .max(1)
    .min(MAX_CHECKIN_COUNT);

if count.map(|c| c > MAX_CHECKIN_COUNT).unwrap_or(false) {
    return Err(format!("Count exceeds maximum allowed ({})", MAX_CHECKIN_COUNT));
}
```

---

### 4.4 [P2-14] isTauri 检查集中化

**位置**: 所有 API 文件

**修复方案**:

已在 [P1-7] 中实现 `ensureTauri()` 和 `withTauriError()` 工具函数。

更新所有 API 函数使用统一工具：

```typescript
// 批量替换模式
// Before:
if (!isTauri()) {
  console.warn("Running outside Tauri environment");
  return [];
}

// After:
return withTauriError("操作名称", async () => {
  return invoke("command_name", params);
});
```

---

## 五、P3 问题修复方案

### 5.1 [P3-15] bulk 函数泛型化 (可选)

**位置**: `src/lib/api/bulk.ts`

**修复方案**:

```typescript
// 当前有 3 个几乎相同的函数，可考虑泛型：
type StatusType = BulkTodoStatus | BulkTaskStatus | BulkStepStatus;

async function bulkUpdateStatus(
  entityType: "todo" | "task" | "step",
  ids: string[],
  status: StatusType,
): Promise<void> {
  ensureTauri(`批量更新${entityType}状态`);
  await invoke(`bulk_update_${entityType}_status`, { ids, status });
}
```

**注意**: 这是一个可选重构，保持当前实现也是可接受的。

---

#NP|
#BM|**状态**: N/A - clone 开销在当前上下文可忽略
#BM|- 数据库 I/O 是主要瓶颈（毫秒级），string clone 仅纳秒级
#BM|- 字符串较短（UUID 20-40 字节），Rust SSO 有优化
#BM|- 优化收益 << 1%，引入复杂度 > 收益

---

## 六、实施计划

### 6.1 阶段一：P0 问题修复 (预计 2-3 小时)

| 任务              | 文件       | 预计时间 |
| ----------------- | ---------- | -------- |
| P0-1 checkin 事务 | checkin.rs | 45min    |
| P0-2 undo 事务    | checkin.rs | 30min    |
| P0-3 bulk 类型    | bulk.ts    | 20min    |
| 测试验证          | -          | 30min    |

### 6.2 阶段二：P1 问题修复 (预计 2 小时)

| 任务                  | 文件                | 预计时间 |
| --------------------- | ------------------- | -------- |
| P1-4 reset 错误处理   | reset.rs            | 15min    |
| P1-5 prepare 错误处理 | checkin.rs          | 10min    |
| P1-6 validation API   | validation.rs       | 15min    |
| P1-7 API 错误标准化   | utils.ts + 所有 API | 45min    |
| P1-8 mock 数据提取    | constants.ts        | 10min    |
| P1-9 死代码移除       | client.ts           | 5min     |
| P1-10 类型修复        | statistics.ts       | 10min    |

### 6.3 阶段三：P2 问题修复 (预计 1 小时)

| 任务             | 文件            | 预计时间 |
| ---------------- | --------------- | -------- |
| P2-11 常量化     | circulations.rs | 10min    |
| P2-12 错误日志   | statistics.rs   | 10min    |
| P2-13 count 验证 | checkin.rs      | 10min    |
| P2-14 集中化     | 所有 API        | 20min    |

### 6.4 阶段四：测试与验收

- [ ] 运行完整测试套件
- [ ] 测试覆盖率 >= 90%
- [ ] TypeScript 类型检查通过
- [ ] Rust 编译通过
- [ ] 手动测试关键路径

---

## 七、验收标准

### 7.1 功能验收

- [ ] 所有现有测试通过
- [ ] 新增并发测试通过
- [ ] 类型安全：无 `any` 类型，所有 status 使用联合类型

### 7.2 代码质量验收

- [ ] Rust 编译无警告
- [ ] ESLint 无错误
- [ ] 测试覆盖率 >= 90%

### 7.3 架构验收

- [ ] 错误处理策略统一
- [ ] 无 TOCTOU 竞态条件
- [ ] 所有数据库操作在事务中
- [ ] 无魔法数字/字符串

---

## 八、风险评估

| 风险                       | 影响 | 缓解措施                                      |
| -------------------------- | ---- | --------------------------------------------- |
| 事务改动影响性能           | 中   | 使用 IMMEDIATE 而非 EXCLUSIVE，减少锁持有时间 |
| API 错误处理改动破坏兼容性 | 低   | 保持相同的错误消息格式                        |
| 类型改动导致编译错误       | 低   | 已有测试覆盖，编译器会捕获                    |

---

## 九、相关文档

- `docs/plans/refactoring-architecture-plan.md` - 架构重构计划
- `CHANGELOG.md` - 变更日志
- `AGENTS.md` - 项目规范
