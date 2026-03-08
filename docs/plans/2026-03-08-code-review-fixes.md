# 代码审查修复实施方案

**创建日期**: 2026-03-08
**审查范围**: 全项目代码审查
**总问题数**: 13 个 (P1: 5, P2: 5, P3: 3)

---

## 问题清单与修复方案

### P1 - 高优先级

#### 1. [Rust] SQL 注入风险 - `src-tauri/src/commands/import.rs:313`

**问题**:

```rust
for table in &tables {
    if let Err(e) = tx.execute(&format!("DELETE FROM {}", table), []) {
```

表名通过 `format!()` 拼接到 SQL 语句中。

**风险评估**:

- 当前表名来自硬编码数组，非用户输入，风险较低
- 但这是不安全的编码模式，应修复以符合安全最佳实践

**修复方案**:

```rust
// 添加表名白名单验证
const VALID_TABLES: &[&str] = &[
    "entity_tags", "milestones", "steps", "tasks", "todos",
    "targets", "plans", "daily_summary_settings", "notification_plugins", "tags"
];

fn validate_table_name(table: &str) -> Result<&'static str, String> {
    VALID_TABLES.iter()
        .find(|&&t| t == table)
        .copied()
        .ok_or_else(|| format!("Invalid table name: {}", table))
}

// 使用时
for table in &tables {
    let validated = validate_table_name(table)?;
    if let Err(e) = tx.execute(&format!("DELETE FROM {}", validated), []) {
```

**涉及文件**:

- `src-tauri/src/commands/import.rs`

---

#### 2. [TS] 类型重复定义 (SRP 违规) - `src/lib/services/todoService.ts`

**问题**:
服务层定义了 `Todo` 接口，与 `src/lib/types/todo.ts` 定义不一致：

- 字段命名风格不同 (camelCase vs snake_case)
- 必填/可选不一致 (priority?, status? vs priority, status)

**修复方案**:

1. 删除服务层的类型定义
2. 从 `types/` 导入类型
3. 如需不同形状，使用 Pick/Omit/Partial 工具类型

```typescript
// 修复后
import type { Todo, Tag } from "@/lib/types";

// 如需服务层特定类型
export type TodoFilterInput = Pick<Todo, "priority" | "status">;
```

**涉及文件**:

- `src/lib/services/todoService.ts`
- 可能需要检查使用该类型的组件

---

#### 3. [TS] 类型重复定义 - `src/lib/services/planService.ts`

**问题**:
`Plan`, `Step`, `PlanProgress` 在服务层重复定义，与 `types/plan.ts` 不一致。

**修复方案**:

1. 删除服务层类型定义
2. 从 `types/plan.ts` 导入
3. 服务层函数保持不变，仅修改类型来源

```typescript
// 修复后
import type { Plan } from "@/lib/types";

// PlanProgress 如果 types/ 没有，则保留在服务层
export interface PlanProgress {
  completed: number;
  total: number;
  percentage: number;
}
```

**涉及文件**:

- `src/lib/services/planService.ts`
- `src/lib/types/plan.ts` (检查是否需要添加 Step 类型)

---

#### 4. [TS] 类型重复定义 - `src/lib/services/targetService.ts`

**问题**:
`Target`, `TargetProgress` 在服务层重复定义。

**修复方案**:
同上，删除重复定义，从 `types/target.ts` 导入。

**涉及文件**:

- `src/lib/services/targetService.ts`

---

#### 5. [TS] 空 catch 块 - `src/lib/api/client.ts:68-70`

**问题**:

```typescript
} catch {
  return null;
}
```

`tryInvoke` 吞掉所有异常，无法追踪错误。

**修复方案**:

```typescript
export async function tryInvoke<T>(
  command: string,
  args?: InvokeArgs,
): Promise<T | null> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    // 记录错误到控制台（开发环境）或日志系统
    if (process.env.NODE_ENV === "development") {
      console.debug(`[API] tryInvoke failed: ${command}`, error);
    }
    return null;
  }
}
```

**涉及文件**:

- `src/lib/api/client.ts`

---

### P2 - 中优先级

#### 6. [TS] console 残留 - 多处

**问题位置**:

- `src/lib/api/utils.ts:81` - `console.warn(message)`
- `src/hooks/useTheme.ts:100` - `console.warn(...)`
- `src/app/views/CirculationDetailView.tsx:49,59` - `console.error(e)`

**修复方案**:

1. 创建统一的日志工具 `src/lib/utils/logger.ts`
2. 替换所有 console 调用

```typescript
// src/lib/utils/logger.ts
const isDev = process.env.NODE_ENV === "development";

export const logger = {
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, error?: unknown) => {
    if (isDev) console.error(`[ERROR] ${message}`, error);
    // 生产环境可发送到错误监控服务
  },
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) console.debug(`[DEBUG] ${message}`, ...args);
  },
};
```

**涉及文件**:

- 新建: `src/lib/utils/logger.ts`
- 修改: `src/lib/api/utils.ts`, `src/hooks/useTheme.ts`, `src/app/views/CirculationDetailView.tsx`

---

#### 7. [TS] 测试覆盖不足

**问题**:

- `src/lib/api/utils.ts` - 无测试
- `src/lib/api/client.ts` - 无测试

**修复方案**:
创建测试文件覆盖核心功能。

**涉及文件**:

- 新建: `src/lib/api/utils.test.ts`
- 新建: `src/lib/api/client.test.ts`

---

#### 8. [TS] 测试断言不完整 - `src/lib/api/todos.test.ts`

**问题**:
`getTodosByTag` 测试只有 `expect(mockTodos);` 无实际断言。

**修复方案**:
检查现有测试并修复断言。

**涉及文件**:

- `src/lib/api/todos.test.ts`

---

#### 9. [TS] useEffect 依赖问题 - `src/hooks/useGlassSettings.ts:38`

**问题分析**:
当前代码:

```typescript
useEffect(() => {
  document.documentElement.style.setProperty("--glass-blur", `${glassBlur}px`);
  document.documentElement.style.setProperty(
    "--glass-opacity",
    `${glassOpacity / 100}`,
  );
}, []); // 空依赖数组
```

**评估**:
设计意图是仅在组件挂载时设置初始值，后续通过 `setGlassBlur`/`setGlassOpacity` 同步更新。这种设计是合理的，但代码注释不清晰。

**修复方案**:
添加注释说明设计意图，或将初始设置移到 useState 初始化中。

```typescript
// 方案1: 添加注释说明设计意图
// Set initial CSS variables on mount only (subsequent updates handled by setters)
useEffect(() => {
  ...
}, []); // Intentionally empty - only run once on mount

// 方案2: 将初始设置移到初始化函数中
function initializeGlassStyles() {
  const blur = getInitialBlur();
  const opacity = getInitialOpacity();
  document.documentElement.style.setProperty("--glass-blur", `${blur}px`);
  document.documentElement.style.setProperty("--glass-opacity", `${opacity / 100}`);
  return { blur, opacity };
}
```

**涉及文件**:

- `src/hooks/useGlassSettings.ts`

---

#### 10. [React] 大型组件需要拆分

**问题**:

- `src/components/layout/Sidebar.tsx` (399 行)
- `src/components/views/ViewsList.tsx` (276 行)

**修复方案**:
按职责拆分为子组件，保持单一职责原则。

**Sidebar.tsx 拆分**:

- `SidebarHeader.tsx` - Logo 和收起按钮
- `SidebarMenu.tsx` - 菜单项列表
- `SidebarFooter.tsx` - 底部操作区

**涉及文件**:

- `src/components/layout/Sidebar.tsx`
- 新建: `src/components/layout/Sidebar/` 目录下的子组件

---

### P3 - 低优先级

#### 11. [React] 使用 alert() 提示错误 - `src/app/views/CirculationDetailView.tsx:50`

**问题**:

```typescript
alert(e instanceof Error ? e.message : "打卡失败");
```

**修复方案**:
使用 Toast 通知组件替换 alert。

**涉及文件**:

- `src/app/views/CirculationDetailView.tsx`
- 可能需要: 检查是否有现有的 Toast 组件

---

#### 12. [React] ErrorBoundary console.error - `src/components/ui/ErrorBoundary.tsx:29`

**问题**: 错误边界记录错误到控制台。

**评估**: 可接受，但建议集成错误监控服务。

**修复方案**:
可选优化：使用 logger 工具统一处理。

---

#### 13. [React] JSON.stringify 性能问题 - TodoItem.tsx

**问题**: 使用 `JSON.stringify` 比较数组效率低。

**修复方案**:
使用浅比较或专门的比较函数。

```typescript
// 使用 lodash.isEqual 或实现浅比较
function areEqual(prevProps: TodoItemProps, nextProps: TodoItemProps) {
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.status === nextProps.todo.status &&
    prevProps.todo.priority === nextProps.todo.priority
    // 其他关键字段
  );
}
```

**涉及文件**:

- `src/components/todo/TodoItem.tsx`

---

## 额外建议实施

### 架构改进

#### A1. 统一类型定义管理

**目标**: 所有实体类型在 `src/lib/types/` 目录集中管理。

**步骤**:

1. 审查 `types/` 目录现有类型定义
2. 添加缺失的类型（如 `Step`, `PlanProgress`, `TargetProgress`）
3. 删除服务层的重复定义
4. 更新所有导入

---

#### A2. 服务层重构

**目标**: 服务层只包含业务逻辑，不定义类型。

**步骤**:

1. 识别服务层中的类型定义
2. 迁移到 `types/` 目录
3. 更新导入语句
4. 添加必要的工具类型（Pick, Omit, Partial）

---

#### A3. API 层测试完善

**目标**: 核心 API 层 100% 测试覆盖。

**步骤**:

1. 创建 `client.test.ts` 测试 ApiError, invoke, tryInvoke, createMockClient
2. 创建 `utils.test.ts` 测试 ensureTauri, withTauriError, withTauriFallback
3. 修复现有测试的断言问题

---

### 安全加固

#### S1. Rust 后端输入验证

**目标**: 所有用户输入验证和转义。

**步骤**:

1. 创建 `src-tauri/src/validation.rs` 模块（如不存在）
2. 添加输入验证函数
3. 在命令中使用验证

---

#### S2. Tauri 命令权限控制

**目标**: 考虑添加命令级别的权限控制。

**评估**: 当前应用是本地应用，权限控制优先级较低。可作为后续迭代项。

---

#### S3. 导出数据脱敏

**目标**: 检查导出功能是否泄露敏感数据。

**步骤**:

1. 审查 `src-tauri/src/commands/export.rs`
2. 确认无敏感数据导出
3. 如有必要，添加数据过滤

---

## 实施顺序

### 阶段 1: 安全修复 (P1 优先)

1. P1-1: SQL 注入修复
2. P1-5: 空 catch 块修复
3. P1-2/3/4: 类型重复定义修复

### 阶段 2: 代码质量 (P2)

4. P2-6: 创建 logger 工具
5. P2-7: 添加 API 层测试
6. P2-8: 修复测试断言
7. P2-9: useEffect 注释/重构
8. P2-10: 组件拆分（可选，作为后续迭代）

### 阶段 3: 低优先级优化 (P3)

9. P3-11: alert() 替换为 Toast
10. P3-12: ErrorBoundary 优化
11. P3-13: JSON.stringify 性能优化

### 阶段 4: 架构改进

12. A1/A2: 类型统一和服务层重构
13. A3: API 层测试完善

---

## 风险评估

| 修改         | 风险             | 缓解措施                   |
| ------------ | ---------------- | -------------------------- |
| 类型定义迁移 | 可能有遗漏的导入 | 全局搜索使用点，测试覆盖   |
| SQL 修复     | 可能影响功能     | 保持表名白名单与实际表一致 |
| 组件拆分     | 可能影响样式     | 分步拆分，保持功能不变     |

---

## 验收标准

1. 所有 P1 问题修复完成
2. TypeScript 类型检查通过 (`npm run typecheck`)
3. 所有测试通过 (`npm run test`)
4. 构建成功 (`npm run build`)
5. 无新增 ESLint 错误 (`npm run lint`)
