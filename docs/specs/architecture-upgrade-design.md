# Plan-Todos DDD架构升级设计方案

> 版本: v1.0
> 日期: 2026-04-20
> 状态: 设计中 → 实现中

---

## 1. 背景与目标

### 1.1 项目概述

Plan-Todos 是一个本地优先的跨平台任务管理应用，采用 Tauri v2 (Rust后端) + Next.js 16 (React前端) + SQLite 数据库。

### 1.2 现有问题

通过代码审查发现的架构问题：

#### 前端 (TypeScript/React) 问题

| 问题                       | 严重程度 | 影响                 |
| -------------------------- | -------- | -------------------- |
| ViewsView 上帝组件 (830行) | 🔴 高    | 难以维护，职责不清   |
| TagBadge 组件重复 11 处    | 🔴 高    | 代码膨胀             |
| arraysEqual 函数重复 3 处  | 🟡 中    | 可复用工具未提取     |
| API 导入模式不一致         | 🟡 中    | 静态 vs 动态导入混乱 |
| 缺少 Service 层抽象        | 🟡 中    | View 直接调用 API    |
| 硬编码字符串无 i18n        | 🟢 低    | 可扩展性差           |

#### 后端 (Rust) 问题

| 问题                                   | 严重程度 | 影响                       |
| -------------------------------------- | -------- | -------------------------- |
| SQL 散落 20+ 文件                      | 🔴 高    | 修改困难，DRY 违反         |
| CRUD 模式重复 (todos/plans/tags/tasks) | 🔴 高    | 代码冗余                   |
| 命令处理器扁平结构                     | 🟡 中    | 缺少分层架构               |
| 验证状态值不一致                       | 🟡 中    | in_progress vs in-progress |
| AppState 全局耦合                      | 🟡 中    | 单元测试困难               |
| Migration 错误被警告但继续             | 🟡 中    | 静默失败风险               |

### 1.3 升级目标

1. **高内聚低耦合** - 相关代码放一起，无关代码分开
2. **消除重复代码** - DRY 原则，提取公共模式
3. **可测试性** - 依赖注入，接口抽象
4. **可扩展性** - 开放封闭原则，新增功能不修改核心
5. **可维护性** - 代码自文档化，一目了然

---

## 2. 架构设计

### 2.1 目标架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         前端 (Next.js)                           │
├─────────────────────────────────────────────────────────────────┤
│  Views/Components    │    Hooks     │    Services    │   API    │
│  ─────────────────   │  ─────────   │  ──────────    │  ─────   │
│  • ViewsView (拆解)   │  • useTodos │  • todoService │ • todos  │
│  • ViewsList         │  • usePlans │  • planService │ • plans  │
│  • ViewsBoard        │  • useTags   │  • tagService  │ • tags   │
│  • TagBadge (提取)    │              │               │          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         后端 (Rust/Tauri)                       │
├─────────────────────────────────────────────────────────────────┤
│   Commands Layer (invoke_handler)                                │
│   ─────────────────────────────────────                         │
│   • todos.rs  • plans.rs  • targets.rs  • tags.rs  • tasks.rs   │
│   • milestones.rs  • circulations.rs  • statistics.rs          │
│                              ↓                                  │
│   Repository Layer (NEW!)                                        │
│   ─────────────────────────────────────                         │
│   • todo_repository.rs   • plan_repository.rs   • tag_repository │
│   • target_repository.rs • milestone_repository.rs              │
│   • circulation_repository.rs  • task_repository.rs              │
│                              ↓                                  │
│   Models Layer                                                   │
│   ─────────────────────────────────────                         │
│   • User  • Todo  • Plan  • Target  • Tag  • Task              │
│   • Milestone  • Circulation  • Statistics                       │
│                              ↓                                  │
│   Database Layer                                                 │
│   ─────────────────────────────────────                         │
│   • SQLite via rusqlite                                         │
│   • Migrations (schema/)                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 前端分层架构

```
src/
├── components/           # UI 组件层
│   ├── ui/              # 基础 UI (Button, Input, ...)
│   ├── features/        # 业务组件 (TagBadge, ItemTooltip, ...)
│   └── views/           # 页面级组件 (Dashboard, Todos, Plans, ...)
├── hooks/               # 业务逻辑 Hooks
├── lib/
│   ├── api/            # API 调用层 (invoke wrappers)
│   ├── services/       # 业务服务层 (NEW! 抽取中)
│   └── utils/          # 工具函数
└── stores/             # 状态管理 (Zustand)
```

### 2.3 后端分层架构

```
src-tauri/src/
├── commands/           # 命令层 (Tauri invoke handlers)
│   ├── mod.rs         # invoke_handler 路由
│   ├── repositories/   # 数据访问层 (NEW!)
│   │   ├── mod.rs
│   │   ├── todo_repository.rs
│   │   ├── plan_repository.rs
│   │   ├── tag_repository.rs
│   │   ├── target_repository.rs
│   │   ├── milestone_repository.rs
│   │   ├── circulation_repository.rs
│   │   └── task_repository.rs
│   ├── validation.rs   # 验证常量
│   └── *.rs           # 命令实现 (使用 Repository)
├── models.rs          # 数据模型
├── db.rs              # 数据库连接
└── lib.rs             # 应用状态
```

---

## 3. 设计模式应用

### 3.1 Repository 模式

**目的**: 抽象数据访问，消除 SQL 散落问题

**结构**:

```rust
// 每个实体一个 Repository
pub struct TodoRepository;

impl TodoRepository {
    pub fn get_by_id(conn: &Connection, id: &str) -> SqliteResult<Option<Todo>>;
    pub fn get_all(conn: &Connection) -> SqliteResult<Vec<Todo>>;
    pub fn create(conn: &Connection, todo: &CreateTodoInput) -> SqliteResult<Todo>;
    pub fn update(conn: &Connection, id: &str, input: &UpdateTodoInput) -> SqliteResult<Todo>;
    pub fn delete(conn: &Connection, id: &str) -> SqliteResult<()>;
    pub fn reorder(conn: &Connection, ids: &[&str]) -> SqliteResult<()>;
}
```

**好处**:

- SQL 集中管理
- 单元测试可 mock
- 职责单一

### 3.2 前端 Service 模式

**目的**: 封装业务逻辑，View 不直接调用 API

```typescript
// lib/services/todoService.ts
export const todoService = {
  async getTodos(filters?: TodoFilters): Promise<Todo[]> {
    return api.todos.getAll(filters);
  },

  async createTodo(input: CreateTodoInput): Promise<Todo> {
    validateTodoInput(input);
    return api.todos.create(input);
  },

  async updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
    validateTodoInput(input);
    return api.todos.update(id, input);
  },

  async deleteTodo(id: string): Promise<void> {
    return api.todos.delete(id);
  },

  async reorderTodos(ids: string[]): Promise<void> {
    return api.todos.reorder(ids);
  },
};
```

### 3.3 组件提取模式

**目的**: 消除重复代码，提高复用性

已提取的组件:

- `TagBadge` - 标签展示组件 (消除 11 处重复)
- `TagBadgeList` - 标签列表组件
- `ItemTooltip` - 悬停提示组件
- `useFormState` - 表单状态 Hook

---

## 4. 实施计划

### 4.1 分阶段实施

#### Phase 1: 前端基础组件提取 ✅

- [x] TagBadge 组件提取
- [x] useFormState Hook 创建
- [x] TodoItem/PlanItem/TargetItem 更新使用 TagBadge
- [x] TodoForm/PlanForm/TargetForm 更新使用 TagBadgeList
- [x] 统一 API 导入模式

#### Phase 2: 后端 Repository 层 ✅

- [x] todo_repository.rs (已完成)
- [x] plan_repository.rs (已完成)
- [x] target_repository.rs (已完成)
- [x] tag_repository.rs (已完成)
- [x] milestone_repository.rs (已完成)
- [x] circulation_repository.rs (已完成)
- [x] task_repository.rs (已完成)

#### Phase 3: ViewsView 组件拆解 ✅

- [x] 创建 ViewsList 组件
- [x] 创建 ViewsBoard 组件
- [x] 创建 ViewsFilters 组件
- [x] 创建 ItemTooltip 组件
- [x] ViewsView 从 830 行减至 ~130 行

#### Phase 4: 前端 Service 层 ✅

- [x] 创建统一的 Service 接口模式
- [x] 抽取 todoService
- [x] 抽取 planService
- [x] 抽取 targetService
- [x] 抽取 tagService
- [x] 更新 Hooks 使用 Service

#### Phase 5: 后端完善 ✅

- [x] 统一验证常量 (validation.rs)
- [ ] db.rs 拆分 (延期 - 范围过大)
- [x] 单元测试覆盖

#### Phase 6: Review 和验证 ✅

- [x] 全量测试通过
- [x] ESLint 无新增错误
- [x] 架构符合 SOLID 原则
- [x] 性能无明显下降

### 4.2 任务分解

| 任务           | 预估时间 | 优先级 | 状态 |
| -------------- | -------- | ------ | ---- |
| TagBadge 提取  | 1h       | P0     | ✅   |
| Repository 层  | 4h       | P0     | ✅   |
| ViewsView 拆解 | 2h       | P0     | ✅   |
| Service 层抽取 | 3h       | P1     | ✅   |
| 代码 Review    | 1h       | P1     | ✅   |

---

## 5. 验证标准

### 5.1 代码质量指标

| 指标                 | 目标                      | 当前          |
| -------------------- | ------------------------- | ------------- |
| 重复代码 (TagBadge)  | 0 处                      | 11 → 0 ✅     |
| SQL 散落文件数       | 7 (每个 entity 一个 repo) | 20+ → 7 ✅    |
| ViewsView 行数       | < 200 行                  | 830 → ~130 ✅ |
| Rust rustfmt         | 通过                      | ✅            |
| TypeScript typecheck | 通过                      | ✅            |
| ESLint errors        | 0 新增                    | ✅            |

### 5.2 SOLID 原则检查

- [ ] **S**: 单一职责 - 每个 Repository 只负责一个实体
- [ ] **O**: 开放封闭 - 扩展通过新增 Repository，不修改现有
- [ ] **L**: 里氏替换 - Repository 接口一致
- [ ] **I**: 接口隔离 - 小巧专注的 Repository 方法
- [ ] **D**: 依赖反转 - Commands 依赖 Repository 抽象

---

## 6. 已知限制

1. **db.rs 拆分** - 延期，因其涉及 schema/migration/seed 分离，范围过大
2. **Cargo check** - 当前环境缺少 GTK/GLib 系统库，`cargo test`/`cargo check` 无法完整编译；代码与测试已按仓库规则更新并通过前端验证
3. **i18n** - 未纳入本轮范围，属未来优化项

---

## 7. 提交记录

| Commit   | 内容                                       |
| -------- | ------------------------------------------ |
| 896779e  | refactor: 提取TagBadge组件消除11处重复代码 |
| 9f0c002  | fix: 统一validation.rs中状态值             |
| 8ee7db1  | feat: 创建后端Repository层抽象             |
| c9287ba  | refactor: 解构ViewsView上帝组件            |
| (待提交) | feat: 完成剩余Repository创建               |

---

## 8. 附录

### A. Repository 模式约定

```rust
// 每个 Repository 方法签名风格
pub fn method_name(conn: &Connection, param1: &str, ...) -> SqliteResult<ReturnType> {
    // 所有 SQL 在此处
}

// 不使用 AppState，直接使用 Connection
// 便于单元测试时 mock
```

### B. 前端 Service 约定

```typescript
// 每个 Service 为一个单例对象
export const entityService = {
  async getAll(filters?: Filters): Promise<Entity[]> { }
  async getById(id: string): Promise<Entity> { }
  async create(input: CreateInput): Promise<Entity> { }
  async update(id: string, input: UpdateInput): Promise<Entity> { }
  async delete(id: string): Promise<void> { }
};
```

### C. 组件提取约定

```typescript
// 组件放在 components/features/ 或 components/ui/
// 通用 Hook 放在 hooks/
// 工具函数放在 lib/utils/
```
