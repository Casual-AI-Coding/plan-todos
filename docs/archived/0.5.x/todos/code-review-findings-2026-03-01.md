# 代码审查发现与修复建议

> 生成日期: 2026-03-01
> 审查范围: 整个项目 (~100+ 源文件)
> 版本: v0.5.6

---

## 审查摘要

| 优先级    | 数量 | 状态                          |
| --------- | ---- | ----------------------------- |
| P0 - 严重 | 0    | 无 (本地桌面应用无需身份验证) |
| P1 - 高   | 3    | 需修复                        |
| P2 - 中   | 3    | 建议修复                      |
| P3 - 低   | 2    | 可选改进                      |

---

## P1 - 高优先级问题

### 1. 缺少输入验证

**位置**: `src-tauri/src/commands/todos.rs:75`

**问题描述**: 用户输入参数无验证。title、content、priority、status 字段接受任意字符串，无长度限制或枚举验证。

**影响**:

- 可接受极长字符串 (通过数据库膨胀造成 DoS)
- 可接受无效的 status 值
- 可接受格式错误的数据

**修复建议**:

```rust
// 在 create_todo 中添加验证
if title.len() > 500 {
    return Err("Title exceeds maximum length of 500 characters".to_string());
}
if !["P0", "P1", "P2", "P3"].contains(&priority.as_str()) {
    return Err("Invalid priority value".to_string());
}

// 在 update_todo 中同样添加验证
if let Some(ref t) = title {
    if t.len() > 500 {
        return Err("Title exceeds maximum length of 500 characters".to_string());
    }
}
```

**建议推广到**: 所有 CRUD 命令 (plans, tasks, targets, steps, milestones, circulations)

---

### 2. 静默错误吞没

**位置**: `src-tauri/src/db.rs:242, 263-288, 344`

**问题描述**: 迁移中的 `.ok()` 调用静默忽略错误:

```rust
// Line 239-242
conn.execute(
    "ALTER TABLE circulation_logs ADD COLUMN count INTEGER DEFAULT 1",
    []
)
.ok(); // 静默吞没错误!

// Line 263-288: 多个 ADD COLUMN IF NOT EXISTS 调用
// Line 344: schema_migrations 插入
```

**影响**:

- 迁移失败无法检测
- 数据库 schema 可能不一致
- 生产环境问题难以排查

**修复建议**:

```rust
// 替换 .ok() 为错误日志
if let Err(e) = conn.execute(
    "ALTER TABLE circulation_logs ADD COLUMN count INTEGER DEFAULT 1",
    []
) {
    log::warn!("Migration failed (may be already applied): {}", e);
}

// 或者使用更优雅的方式
conn.execute(...).inspect_err(|e| {
    log::debug!("Migration note: {}", e);
}).ok();
```

---

### 3. 缺少事务包装

**位置**: `src-tauri/src/commands/import.rs`

**问题描述**: import 操作 (merge/replace/update 模式) 执行多条 SQL 语句但无事务包装。如果中途失败，数据将部分导入。

**影响**:

- 导入失败时数据库状态不一致
- 部分数据已导入，部分失败

**修复建议**:

```rust
fn import_merge(
    conn: &rusqlite::Connection,
    data: &ExportDataContent,
) -> Result<ImportResult, String> {
    let tx = conn.unchecked_transaction()?;  // 开始事务

    // ... 所有操作 ...

    tx.commit()?;  // 成功时提交
    Ok(result)
}

// apply same to import_replace and import_update
```

**注意**: replace 模式需先清空表再导入，建议在事务中执行:

```rust
fn import_replace(...) -> Result<ImportResult, String> {
    let tx = conn.unchecked_transaction()?;

    // 清空表
    tx.execute("DELETE FROM entity_tags", [])?;
    tx.execute("DELETE FROM milestones", [])?;
    // ... 其他表 ...

    // 导入数据
    // ...

    tx.commit()?;
    Ok(result)
}
```

---

## P2 - 中优先级问题

### 4. 遗留列未删除

**位置**: `src-tauri/src/db.rs:309, 318, 325, 332`

**问题描述**: Schema 迁移后，旧列 (`plan_id`, `task_id`, `target_id` 在 milestones 表中) 保留未删除。

**影响**:

- 死数据
- 可能造成混淆

**修复建议**:

```rust
// 在成功迁移后删除遗留列
if has_legacy_data {
    // ... 迁移逻辑 ...

    // 删除遗留列
    conn.execute("ALTER TABLE milestones DROP COLUMN plan_id", [])
        .inspect_err(|e| log::warn!("Drop plan_id: {}", e)).ok();
    conn.execute("ALTER TABLE milestones DROP COLUMN task_id", [])
        .inspect_err(|e| log::warn!("Drop task_id: {}", e)).ok();
    conn.execute("ALTER TABLE milestones DROP COLUMN target_id", [])
        .inspect_err(|e| log::warn!("Drop target_id: {}", e)).ok();

    info!("Dropped legacy milestone columns");
}
```

---

### 5. 导入代码大量重复

**位置**: `src-tauri/src/commands/import.rs`

**问题描述**: merge/replace/update 三种模式中，约 300 行 INSERT 语句几乎完全相同。

**影响**:

- 维护困难
- Bug 风险高

**修复建议**: 抽取为通用函数:

```rust
// 通用 upsert 辅助函数
fn upsert_record<T>(
    tx: &rusqlite::Transaction,
    table: &str,
    id: &str,
    fields: &[(&str, &dyn rusqlite::ToSql)],
) -> Result<(), String> {
    let placeholders: Vec<&str> = fields.iter().map(|(f, _)| *f).collect();
    let sql = format!(
        "INSERT OR REPLACE INTO {} ({}, {}) VALUES ({})",
        table,
        "id".to_string() + &", ".to_repeated_char(fields.len()),
        fields.iter().map(|_| "?").collect::<Vec<_>>().join(", "),
    );
    // ...
}
```

---

### 6. 错误信息丢失上下文

**位置**: `src-tauri/src/commands/todos.rs:28, 56`

**问题描述**: `.map_err(|e| e.to_string())` 将丰富的 rusqlite 错误转换为通用字符串。

**影响**: 生产环境难以调试数据库问题。

**修复建议**: 使用自定义错误类型或保留错误详情:

```rust
// 定义 AppError
#[derive(Debug)]
pub enum AppError {
    Database(rusqlite::Error),
    Validation(String),
    NotFound(String),
}

impl From<rusqlite::Error> for AppError {
    fn from(e: rusqlite::Error) -> Self {
        AppError::Database(e)
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Database(e) => write!(f, "Database error: {}", e),
            AppError::Validation(msg) => write!(f, "Validation error: {}", msg),
            AppError::NotFound(msg) => write!(f, "Not found: {}", msg),
        }
    }
}
```

---

## P3 - 低优先级问题

### 7. API 文件过大

**位置**: `src/lib/api.ts`

**问题描述**: ~1400 行代码在单个文件中。

**建议**: 按功能模块拆分 (`api/todos.ts`, `api/plans.ts`, etc.)

---

### 8. 后端测试覆盖不足

**位置**: `src-tauri/src/tests.rs`

**问题描述**: 大部分测试是前端相关，后端逻辑 (导入模式、边界情况) 缺乏测试。

**建议**: 添加后端集成测试

---

## 修复优先级

| 优先级 | 问题       | 预计工作量            |
| ------ | ---------- | --------------------- |
| P1-1   | 输入验证   | 中 (需推广到所有命令) |
| P1-2   | 静默错误   | 低                    |
| P1-3   | 事务包装   | 中                    |
| P2-1   | 遗留列删除 | 低                    |
| P2-2   | 代码去重   | 高 (重构)             |
| P2-3   | 错误类型   | 中                    |
| P3-1   | API 拆分   | 中                    |
| P3-2   | 后端测试   | 高                    |

---

## 后续建议

1. **引入验证库** - 考虑使用 `validator` crate 或自定义验证 trait
2. **添加后端集成测试** - 测试导入模式、边界情况
3. **添加限流** - 虽为本地应用，但可作为防御纵深
4. **结构化日志** - 当前 `log::info!` 较基础，结构化日志有助于排查问题

---

## 第二轮审查发现 (2026-03-01 补充)

### 前端问题 (TypeScript/React)

#### P1 - 高优先级

| #   | 位置                                  | 问题                                                                          | 建议                              |
| --- | ------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| F1  | `src-tauri/src/commands/search.rs:24` | **SQL 注入风险** - 使用 `format!("%{}%", query)` 直接拼接用户输入到 LIKE 查询 | 使用参数化查询                    |
| F2  | `src/app/layout.tsx`                  | **dangerouslySetInnerHTML** - 存在 XSS 风险                                   | 检查必要性，尽可能避免            |
| F3  | 49个文件，285处                       | **大量内联样式** - 维护性差                                                   | 提取到 CSS modules 或 Tailwind 类 |

#### P2 - 中优先级

| #   | 位置                          | 问题                                                        | 建议                                       |
| --- | ----------------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| F4  | `src/hooks/useTodos.ts:66-73` | **N+1 查询** - useTodo 通过 getTodos() 获取全部再客户端过滤 | 直接调用 `getTodo(id)` 或新增 Rust 命令    |
| F5  | 全局                          | **React Query 未配置** - 无全局错误处理和重试               | 添加 QueryErrorResetBoundary 和 retry 配置 |
| F6  | 全局                          | **缺少 Error Boundary** - React 组件无错误边界              | 添加 Error Boundary 组件                   |

#### P3 - 低优先级

| #   | 位置               | 问题                                      | 建议             |
| --- | ------------------ | ----------------------------------------- | ---------------- |
| F7  | 13处文件           | **eslint-disable 滥用**                   | 移除或修复规则   |
| F8  | `src/lib/store.ts` | **Zustand store 死代码** - 定义但从未使用 | 删除或集成到组件 |
| F9  | 多个组件           | **组件文件过大** (>300行)                 | 拆分组件         |

### 后端问题 (Rust)

#### P1 - 高优先级

| #   | 位置                         | 问题                               | 建议                  |
| --- | ---------------------------- | ---------------------------------- | --------------------- |
| B1  | `commands/search.rs:248-252` | **SQL 注入** - 字符串拼接 SQL      | 使用参数化查询        |
| B2  | 多个命令文件                 | **缺少输入验证** - 无长度/格式校验 | 添加 validation crate |
| B3  | `db.rs` 多处                 | **静默错误吞没** - `.ok()`         | 改为 log::warn!       |

#### P2 - 中优先级

| #   | 位置        | 问题                         | 建议                                  |
| --- | ----------- | ---------------------------- | ------------------------------------- | --------------- | ------------------ |
| B4  | `import.rs` | **无事务保护**               | 参考 tags.rs:set_entity_tags 使用事务 |
| B5  | 多个命令    | **错误信息丢失** - `map_err( | e                                     | e.to_string())` | 使用自定义错误类型 |

### 数据库问题

| #   | 位置             | 问题                                                   | 建议                  |
| --- | ---------------- | ------------------------------------------------------ | --------------------- |
| D1  | `entity_tags` 表 | **缺少复合索引** - (entity_type, entity_id) 查询无索引 | 添加 INDEX            |
| D2  | 搜索功能         | **LIKE 查询无全文索引**                                | 考虑 FTS5 或LIMIT结果 |

### 架构问题

| #   | 位置             | 问题                                              | 建议                       |
| --- | ---------------- | ------------------------------------------------- | -------------------------- |
| A1  | 项目全局         | **无 Next.js API Routes** - 全部通过 Tauri invoke | 如需 Web 版需添加 API      |
| A2  | `src/lib/api.ts` | **API 层过大** - 1400+ 行                         | 拆分为 api/todos.ts 等模块 |
| A3  | 全局             | **缺少 Zod 验证** - 无 schema 验证                | 引入 zod 并添加验证        |

---

## 第三轮审查建议

### 建议深入检查

1. **安全审计** - 检查所有用户输入是否正确转义
2. **性能基准** - 大量数据下的搜索性能
3. **移动端适配** - 检查响应式布局
4. **无障碍访问** - a11y 检查
5. **日志系统** - 完善日志记录点

### 后续维护建议

1. 添加 CI 检查 (lint, typecheck, test)
2. 定期代码审查流程
3. 文档自动化 (API docs, component docs)
4. 监控和错误追踪集成

---

## 第三轮深入审查 (2026-03-01 补充)

### 1. 安全审计

| #   | 位置                           | 问题                                                | 严重程度 | 建议                                           |
| --- | ------------------------------ | --------------------------------------------------- | -------- | ---------------------------------------------- |
| S1  | `src-tauri/src/db.rs:372, 380` | 使用 `format!` 拼接表名（参数来自函数，非用户输入） | 低       | 确认参数来源，避免直接拼接                     |
| S2  | `src/app/layout.tsx:60`        | `dangerouslySetInnerHTML` 使用                      | 中       | 主题脚本来自硬编码，非用户输入，但建议定期审计 |
| S3  | -                              | 命令注入                                            | ✅ 无    | 未发现                                         |
| S4  | -                              | 路径遍历                                            | ✅ 无    | build 脚本使用硬编码路径，安全                 |
| S5  | -                              | 硬编码密钥                                          | ✅ 无    | 仅发现占位符，无实际密钥                       |

**结论**: 项目安全状况良好，主要风险点已在前两轮识别。

---

### 2. 性能分析

| #   | 位置                                 | 问题                                     | 建议                          |
| --- | ------------------------------------ | ---------------------------------------- | ----------------------------- |
| P1  | `src/hooks/useTodos.ts:66-73`        | N+1 查询 - 获取全部 todos 后在客户端过滤 | 添加 Rust 命令 `get_todo(id)` |
| P2  | SQLite 搜索                          | LIKE 查询无 LIMIT，无全文索引            | 添加 LIMIT + 考虑 FTS5        |
| P3  | `src/components/TodoItem.tsx`        | 缺少 React.memo                          | 包装组件避免不必要重渲染      |
| P4  | `src/components/CirculationList.tsx` | 大数据列表无虚拟化                       | 考虑 react-window 虚拟滚动    |

**性能基准建议**:

- 1000 条 todo 数据下的搜索响应时间
- 大量 circulation 数据的渲染性能

---

### 3. 移动端适配

| #   | 位置                           | 问题                                    | 建议                   |
| --- | ------------------------------ | --------------------------------------- | ---------------------- |
| M1  | `src/components/SearchBar.tsx` | 硬编码 `w-80` (320px)，小屏手机可能溢出 | 改为 `w-full max-w-xs` |
| M2  | `globals.css`                  | 107 处硬编码 `px` 值                    | 大部分用于阴影，可接受 |
| M3  | Tailwind 响应式                | ✅ 25 个文件使用响应式类                | 良好                   |
| M4  | viewport meta                  | ✅ 4 处已配置                           | 良好                   |
| M5  | BottomNav                      | `h-14` (56px) 良好                      | -                      |

---

### 4. 无障碍访问 (a11y)

| #   | 位置           | 问题                                          | 建议                     |
| --- | -------------- | --------------------------------------------- | ------------------------ |
| A1  | 多个组件       | **图标按钮无 aria-label** - 仅图标无文字      | 添加 `aria-label="..."`  |
| A2  | `TodoItem.tsx` | **无键盘导航** - 点击事件无对应键盘处理       | 添加 `onKeyDown`         |
| A3  | 表单           | **缺少 form 标签语义**                        | 使用 `<label for="...">` |
| A4  | 语义 HTML      | ✅ 使用了 header, main, footer                | 良好                     |
| A5  | ARIA           | ✅ 部分使用了 `aria-checked`, `aria-selected` | 可扩展                   |

**具体位置**:

- `src/components/BottomNav.tsx` - 需要 aria-label
- `src/components/TodoItem.tsx` - 需要键盘支持
- `src/components/IconButton.tsx` - 需要 aria-label

---

### 5. 日志系统

| #   | 位置      | 问题                                           | 建议                       |
| --- | --------- | ---------------------------------------------- | -------------------------- |
| L1  | Rust 后端 | 仅 6 个文件有日志                              | 扩展到所有命令             |
| L2  | 前端      | 仅 2 个文件有 console 日志                     | 考虑使用 logger 库         |
| L3  | 错误日志  | 大部分 `map_err(\|e\| e.to_string())` 吞没详情 | 使用结构化日志记录完整错误 |

**建议日志级别**:

- `log::error!` - 失败的操作
- `log::warn!` - 可恢复的错误（如迁移）
- `log::info!` - 重要操作（导入/导出）
- `log::debug!` - 调试信息

---

## 第三轮审查总结

| 类别     | 发现数 | 需修复 | 良好   |
| -------- | ------ | ------ | ------ |
| 安全     | 5      | 0      | 5      |
| 性能     | 4      | 4      | 0      |
| 移动端   | 5      | 1      | 4      |
| 无障碍   | 5      | 3      | 2      |
| 日志     | 3      | 3      | 0      |
| **总计** | **22** | **11** | **11** |

### 优先修复项

1. **P1: 性能问题** - N+1 查询、添加 LIMIT
2. **P2: 无障碍** - 图标按钮 aria-label、键盘导航
3. **P3: 移动端** - SearchBar 宽度调整
4. **P4: 日志** - 扩展日志覆盖

### 已确认良好的方面

- ✅ 无命令注入漏洞
- ✅ 无路径遍历风险
- ✅ Tailwind 响应式类使用良好
- ✅ 语义 HTML 结构良好
- ✅ viewport meta 已配置
