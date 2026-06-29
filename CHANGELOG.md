# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.4] - 2026-06-30

### Refactored

**API 层类型化边界错误**:

- `src/lib/api/utils.ts` 新增 `TauriUnavailableError` 和 `TauriOperationError` 类型化错误类，替代裸 `Error` 抛出
- 类型化错误暴露 `operation` 和 `cause` 元数据，便于调用方分类处理
- 提取 `createUnavailableMessage` 和 `createOperationFailureMessage` 工厂函数

**Domain 状态类型收敛**:

- `src/domain/plan/planTypes.ts` 从 `domainTypes.ts` 导入 `PlanStatus` 类型，消除重复定义
- `src/domain/todo/todoTypes.ts` `UpdateTodoInput.status` 使用 `TodoStatus` 类型替代字面量联合
- `src/domain/shared/validation.ts` 从 `domainTypes` 引用验证常量，删除对 `@/config/constants` 的依赖
- 物理删除 `src/config/constants.ts` 中已迁移的验证常量

**Todo 状态验证集中化（Rust）**:

- 新增 `commands/todo_status.rs` 模块，统一定义 `TODO_STATUSES` 和 `validate_todo_status`
- `commands/validation.rs` 引用 `todo_status::TODO_STATUSES`，消除三处重复的状态常量定义
- `batch.rs` 拆分为 `batch/` 子模块（common/plan/target/task/todo），移除内联验证函数
- 移除 `bulk_archive_todos` 命令及其前端的 `bulkArchiveTodos` API（`archived` 不是 canonical todo status）

**BatchActionBar 组件重构**:

- `BatchActionBar.tsx` 从 ~258 行瘦身，提取业务逻辑到 `useBatchActionController` hook
- 提取 `batchActionBarOptions.ts` 配置常量，所有 UI 组件通过 hook 统一管理状态

### Tests

- **Rust todo status 契约测试**: 验证 Rust/前端状态常量一致性，拒绝 `archived`/`completed`/`cancelled` 别名
- **Domain 状态源测试**: `domainStatusSources.test.ts` 覆盖 Plan/Todo 类型收敛的正确性
- **BatchActionBar 组件结构测试**: `BatchActionBar.structure.test.ts` 验证组件所有权和渲染结构
- **ViewsGantt 测试修复**: 修复 fixture 数据超出可视范围的问题
- **类型化边界错误测试**: 验证 typed error 的类身份、operation 元数据和 cause 传递

### Docs

- 新增架构升级计划 `docs/plans/2026-06-30-architecture-upgrade-ultrawork-plan.md`

### Chore

- 更新 `Cargo.lock` 以匹配 v0.9.3 依赖版本

---

## [0.9.3] - 2026-06-30

### Refactored

**实体查询核心层重构 (Entity Query Core Refactoring)**:

- 分离实体查询工厂策略：新增 `entityErrors.ts`（类型化错误）、`entityQueryCache.ts`（缓存策略）、`entityQueryKeys.ts`（查询键工厂）、`entityReorder.ts`（乐观排序工具）
- `EntityHookConfig` 接口添加 `readonly` 修饰符，`extraInvalidateKeys` 改为只读元组
- `createEntityHooks` 的 `apiUpdate` 签名从 `(id, data)` 改为接收整个输入对象 `(input: TUpdateInput)`，统一调用约定
- 各实体查询（circulation, milestone, plan, target, todo）适配新的 `apiUpdate` 签名
- `useEntityOperations` reorder 操作契约收窄，减少不必要的重渲染

### Tests

- **新增实体查询策略测试**: `entityQueryPolicies.test.ts` 覆盖 query keys、cache replacement、乐观排序、类型化错误（5 个测试用例）

### Docs

- 归档自动代码审查报告（2026-05-05, 2026-05-06），含手动验证结论
- 新增架构升级计划文档（2026-06-29）

### Chore

- `.gitignore` 添加 `.omo/` 目录

---

## [0.9.2] - 2026-04-29

### Refactored

**API 层 Fail-Fast 重构**:

- 重构所有 API 模块（search, milestones, notifications, tasks, steps, tags, targets, statistics, dashboard）：当 Tauri 不可用时快速失败，不再使用 mock 数据降级
- 删除 `lib/api/constants.ts` mock 数据常量文件（45 行）
- 删除 `lib/api/utils.ts` fallback 工具函数（37 行）
- 删除 `lib/api/utils.test.ts` 测试文件（100 行）
- 更新所有 API 模块的测试文件以适配新的 fail-fast 行为
- 新增 barrel API 测试文件 `lib/api.test.ts` 验证 fail-fast 行为

**Settings 页面 DataBackupSettings 重构**:

- 重构 `DataBackupSettings.tsx` 组件，添加 export/import 回调函数集成
- 将 `DataBackupSettings` 整合到 `SettingsGeneralView` 通用设置页面
- 更新 `DataBackupSettings.test.tsx` 测试文件以适配新的组件结构

### UI/UX

**Dashboard 和 ViewsView 第三轮微交互与动画**:

- **FadeIn 组件**: 新增 `scale-up` 和 `scale-down` 方向变体
- **StaggeredList 组件**: 修正 stagger 行为，添加 `staggerDelay` 自定义参数和 `customKey` 支持
- **Checkbox 组件**: 添加 Framer Motion 动画，勾选时有弹性动画（spring bounce），hover 时 scale(1.05)
- **ProgressBar 组件**: 添加 Framer Motion，进度变化时使用弹性动画
- **SectionCard 组件**: 添加 hover lift 效果和卡片入场动画
- **TodayTodosCard 组件**: 优化列表项入场动画、交互动画和删除动画
- **OverdueTodosCard 组件**: 添加红色脉冲动画提示
- **ActivePlansCard/ActiveTargetsCard/ActiveMilestonesCard 组件**: 统一使用 StaggeredList，添加 hover lift 效果
- **EntityCard 组件**: 统一卡片动画封装
- **ViewsBoard 组件**: Kanban column 动画优化
- **ViewsCalendar 组件**: Calendar cell 动画优化
- **ViewsGantt 组件**: Gantt bar 动画优化
- **ItemTooltip 组件**: Tooltip 动画增强

**Views 视图增强**:

- 优化 `ViewsCalendar.tsx`：启用 hover tooltip，添加日期格子点击，增加 "+N" 溢出提示
- 优化 `ViewsList.tsx`：添加点击导航，使用 Badge 组件替代内联样式
- 优化 `ViewsGantt.tsx`：渲染 tasks（按 plan 分组），添加 tooltip 悬停，月份中文显示
- 优化 `ViewsBoard.tsx`：使用 Tailwind scrollbar-hide，移除 `<style jsx global>`

---

## [0.9.1] - 2026-04-28

### Refactored

**DDD 架构重构 (Dashboard & ViewsView)**:

- Dashboard.tsx 从 360 行重构为 30 行，采用 DDD 架构分解
- ViewsView.tsx 从 173 行重构为 21 行，采用 DDD 架构分解
- 新增 Dashboard 子组件：StatsRow, EntityCountsRow, CirculationSection, ProgressSection, TodayTodosCard, OverdueTodosCard, ActivePlansCard, ActiveTargetsCard, ActiveMilestonesCard, SectionCard, DashboardSkeleton, DashboardError
- 新增 ViewsView 子组件：ViewHeader, ViewContainer, EntityCard, useViewsViewModel
- 新增 useDashboardViewModel hook，统一管理 Dashboard 视图状态

### UI/UX

**Dashboard 视觉增强**:

- 统一卡片样式，使用 SectionCard 组件提供一致的视觉体验
- 优化骨架屏 DashboardSkeleton 加载状态
- 优化错误状态 DashboardError 展示
- 改进今日待办、过期待办、进行中计划/目标/里程碑卡片布局

**ViewsView 视觉增强**:

- 优化 Checkbox、EmptyState、ProgressBar 组件样式
- 新增 Icons/index.tsx 图标组件库
- ViewsBoard、ViewsCalendar、ViewsFilters、ViewsGantt、ViewsList 组件样式优化

**动画与微交互**:

- 新增 FadeIn 动画组件，提供淡入动画效果
- 优化 StaggeredList 交错列表动画
- UI 组件微交互改进

### Tests

- 更新 Dashboard 测试以适配新的 DDD 架构
- 更新 ViewsView 测试以适配新的 DDD 架构

---

## [0.9.0] - 2026-04-28

### Tests

- **Test Coverage Enhancement**: Comprehensive test suite to reach 90% coverage threshold
  - Added new test files for hooks: `useAutoUpdate`, `useCirculationNotifications`, `useEntityFilter`, `useEntityOperations`, `useFontSettings`, `useFormState`, `useGlobalNotificationSettings`, `useGoogleDrive`, `useHotkey`, `useListNavigation`, `useMilestoneLinkLabel`, `useSystemTheme`, `useTasks`, `useTheme`
  - Added new test files for lib: `HotkeyProvider`, `api/bulk`, `api/googleDrive`, `api/notifications`, `api/reorder`, `api/update`, `useHotkeyStore`, `utils/cn`, `utils/compare`
  - Added new test files for services: `recurrenceService`
  - Removed outdated test files (3775 lines removed)
  - Fixed branch coverage to meet 90% threshold
  - Updated `vitest.config.ts` with coverage configuration

---

## [0.8.4] - 2026-04-27

### UI/UX

**Premium Polish Pass on Core UI Components**:

- Add CSS shadow variables (`shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`) across light/dark/system themes
- Implement `card-hover` class with subtle lift effect for interactive cards
- Update Dashboard to use CSS variables for theme-consistent colors
- Enhance `EntityCountCard` with larger `text-xl font-bold` typography and improved padding
- Add decorative circle overlay to `StatCard` with `opacity-[0.04]` for visual depth
- Improve `Sidebar` collapse button with rounded hover state and color-mix background
- Refactor `Badge` component to use `color-mix()` for theme-aware variant styles (default, secondary, destructive, success, warning)
- Add gradient backgrounds and shadows to `Button` variants (primary, danger) with `shadow-sm`
- Apply `rounded-xl` corners and enhanced shadows to `Card` with `backdrop-filter: blur(8px)`
- Enhance `EmptyState` with larger icon container (64x64), gradient background, and `leading-relaxed` description
- Update `Input` with `rounded-xl` styling, `focus:ring-[var(--color-primary)]/20`, and `shadow-xs` error state
- Refactor `ProgressBar` to use CSS variables for colors (`var(--color-primary)`, `var(--color-warning)`, `var(--color-text-muted)`) instead of hardcoded Tailwind classes

### Tests

- Update UI component tests to match new theme-aware styling approach (using `color-mix()` and CSS variables)
- Fix `ProgressBar` tests to query by style attributes instead of utility classes
- Update `EmptyStateCard` tests to use `[role='img']` selector instead of `.text-5xl`
- Update `EntityCountCard` tests for `text-xl font-bold` typography changes

### Security

- **Notification History SQL Injection Prevention**: Use parameterized queries in notification history API to prevent SQL injection attacks

### Fixed

**Error Handling Improvements**:

- Add per-view ErrorBoundary component for better error isolation
- Propagate row parse errors in command handlers instead of silently ignoring them
- Propagate row parse errors in repositories with proper error messages
- Improve migration error handling with better diagnostics

**API Parameter Naming**:

- Correct snake_case parameter names for CRUD APIs (sync, bulk, target endpoints)
- Correct snake_case parameter names for sync/bulk/target operations

**Deep Link Permissions**:

- Add deep-link permissions to Tauri capabilities for desktop OAuth callback

### Added

**Database Health Check**:

- New `db_health_check` command for verifying database connection health
- Returns diagnostic info: table count, foreign keys status, SQLite version
- Useful for sync pre-checks and troubleshooting

### Performance

- **Milestone Progress Optimization**: Optimize milestone progress queries from N+1 to batched queries, significantly reducing database round trips

### Refactored

- Apply rustfmt to Rust source files for consistent code formatting

## [0.8.2] - 2026-04-27

### Refactored

**DDD Architecture Upgrade (Phase 3)**:

- Establish complete domain query layer (`src/domain/`) with service migration across all entity types (Todo, Plan, Target, Milestone, Tag, Circulation)
- Extract `ViewRouter` and `MobileSidebar` from `page.tsx` god component
- Consolidate `TodosView` UI state into `useTodoViewState()` with pure selector functions
- Centralize navigation state in zustand store (`navigation.ts`)
- Extract shared `entityOperations` and `entityQueries` factory functions
- Phase 3A: Complete domain layer query extraction for all entities
- Phase 3B: Consolidate view state into domain layer

**View Routing Refactoring**:

- `ViewRouter` refactoring with improved routing logic and URL sync
- Route configuration updates (`src/config/routes.ts`) with better i18n support
- Navigation guards and active state management improvements

### Added

**Documentation**:

- Added comprehensive DDD architecture upgrade plan (`docs/plans/2026-04-27-ddd-architecture-upgrade-plan.md`)
- Updated DDD frontend upgrade specifications (`docs/specs/ddd-frontend-upgrade.md`)
- Created release notes standard document (`docs/standards/release-notes-standard.md`)
- Updated `docs/AGENTS.md` with project taxonomy, release workflow, and version management guidelines

### Changed

**Test Coverage Enhancement**:

- Added 180+ new tests for `milestoneService` (280 lines added)
- Enhanced `circulationService` and `targetService` test coverage
- Added `todoFilters` and `todoViewState` unit tests
- `circulationService.test.ts` expanded from basic to comprehensive coverage

### Fixed

- Align circulations view test imports with domain query boundary after import cleanup

## [0.8.1] - 2026-04-21

### Refactored

**Documentation Taxonomy Restructuring**:

- Reorganize `docs/` into canonical taxonomy (standards/, guides/, plans/, specs/, archived/)
- Move historical iteration docs into `docs/archived/`
- Establish `docs/AGENTS.md` as the definitive taxonomy guide
- Remove obsolete `docs/superpowers/` paths
- Update all doc references to reflect new structure

**Frontend DDD Domain Layer (Phase 2)**:

- Establish `src/domain/` layer with service migration
- Extract `ViewRouter` and `MobileSidebar` from `page.tsx` god component
- Phase 2B: Extract shared view logic with `useEntityOperations` and `useEntityFilter` hooks
- Phase 2C: Complete Sidebar/BottomNav i18n cleanup
- Create generic CRUD hook factory, eliminating ~550 lines of duplicate code
- Extract config constants, i18n configuration, and navigation config

**Component Architecture**:

- Add `MobileSidebar` component for mobile navigation
- Add `ViewRouter` for centralized view routing logic
- Refactor `Sidebar` with improved i18n support
- Add `useMilestoneLinkLabel` hook for consistent milestone labels

### Fixed

**UI/UX Fixes**:

- Defer completion animation effect updates to prevent jank
- Initialize sidebar state lazily to improve initial load
- Stabilize `CirculationsView` loading state
- Align system `isDark` with effective theme

**Test Stability**:

- Update view assertions for refactored components
- Stabilize `ThemeSelector` test queries
- Align view hook mocks with refactored APIs
- Add toast provider to settings view tests

## [0.8.0] - 2026-04-20

### Refactored

**后端 Repository 层抽象 (Backend Repository Layer)**:

- 新增 `repositories/` 目录，抽象数据访问层
- 新增 `todo_repository.rs` - Todo 数据访问
- 新增 `task_repository.rs` - Task 数据访问
- 新增 `plan_repository.rs` - Plan 数据访问
- 新增 `target_repository.rs` - Target 数据访问
- 新增 `circulation_repository.rs` - Circulation 数据访问
- 新增 `milestone_repository.rs` - Milestone 数据访问
- 新增 `tag_repository.rs` - Tag 数据访问
- 重构 `circulations/mod.rs` 和 `milestones.rs` 使用 Repository 模式
- 重构 `plans.rs`、`tags.rs`、`targets.rs` 使用 Repository 模式
- 重构 `tasks.rs` 使用 Repository 模式

**前端组件化解构 (Frontend Component Decomposition)**:

- `ViewsView.tsx` 从 752 行瘦身为更小的组件化架构
- 提取 `TagBadge` 组件，消除 11 处重复代码
- 提取 `ItemTooltip` 组件，提供统一的悬浮提示

**validation.rs 状态值统一**:

- 统一状态值命名：`in_progress` 改为 `in-progress`

### Fixed

**测试增强 (Test Enhancement)**:

- `updateTodo` 和 `createTodo` 测试添加 `recurrence` 字段验证

## [0.7.3] - 2026-03-24

### Fixed

**通知系统导航 (Notification Navigation)**:

- 修复通知设置页面无法访问的问题
- 添加"通知设置"菜单项链接到 SettingsNotificationsView
- 通知设置页面包含：主开关、桌面通知、提示音、默认提醒时间、免打扰模式、渠道优先级、保留设置

## [0.7.2] - 2026-03-22

### Added

**拖拽排序 (Drag-Drop Sorting)**:

- Todos/Plans/Targets 列表支持拖拽排序
- 后端新增 `sort_order` 字段到数据库模型
- 新增 `reorder_todos`, `reorder_plans`, `reorder_targets` 命令
- 新增 `update_*_sort_order` 单项排序更新命令
- 前端集成 `SortableList` 组件到三个列表视图
- 导出功能包含 `sort_order` 字段

**右键菜单 (Context Menu)**:

- 新增 `ContextMenu` UI 组件系列
- `ContextMenuTrigger` - 右键触发器
- `ContextMenuContent` - 带动画的菜单内容
- `ContextMenuItem` - 支持 default/danger 变体
- TodoItem: 切换状态、删除操作
- PlanItem: 归档、删除操作
- TargetItem: 展开/折叠、删除操作

**批量标签管理 (Batch Tags)**:

- 新增 `bulk_add_tags`, `bulk_remove_tags` 后端命令
- 新增 `TagSelector` 组件用于标签选择
- BatchActionBar 集成标签管理功能
- 支持新建标签并设置颜色
- 10 种预设颜色供选择

**键盘导航 (Keyboard Navigation)**:

- 新增 `useListNavigation` hook
- Arrow Up/Down 或 j/k 导航列表项
- Home/End 跳转到首/末项
- Enter 选择，Shift+Enter 激活
- Escape 重置焦点

**快捷操作栏 (Quick Action Bar)**:

- 新增 `QuickActionBar` 组件
- 悬停显示快捷操作按钮
- 切换状态、归档、删除等操作
- 动画显示/隐藏效果

**列表密度切换 (List Density Toggle)**:

- 新增 `useListDensity` store
- 三种密度模式：紧凑、标准、舒适
- 通过 CSS 变量控制间距和字体大小
- 设置持久化到本地存储

**完成动画 (Completion Animation)**:

- 新增 `CompletionAnimation` 组件 - 打勾动画
- 新增 `ConfettiCelebration` 组件 - 彩带庆祝效果
- Framer Motion 弹簧动画
- 可配置持续时间和粒子数量

---

## [0.7.1] - 2026-03-22

### Added

**同步状态管理 (Sync State Management)**:

- 新增 `SyncState` 模块 (Rust) - 原子化的同步状态追踪
- 新增 `get_sync_progress` 命令 - 实时查询同步进度
- 同步引擎集成 SyncState，支持进度百分比和状态文本

**同步触发与进度追踪**:

- `trigger_sync` 命令返回 `SyncResult` 结构体
- 支持同步进度实时更新：总条目数、已处理数、当前操作
- 前端 `useSyncProgress` hook 封装进度状态管理

**冲突管理**:

- 冲突检测和记录机制
- 新增冲突管理 API：`get_conflicts`, `resolve_conflict`
- 冲突数据结构：实体类型、字段、本地值、远程值

**前端组件**:

- `SyncStatusIndicator` - 同步状态指示器组件
- `ConflictList` - 冲突列表组件
- `ConflictCard` - 冲突卡片组件
- 集成到同步设置页面 (`SettingsSyncView`)

**测试通知功能**:

- 新增 `send_test_notification` 命令
- 设置页面添加"测试通知"按钮，验证通知渠道配置

### Changed

- 依赖更新：next 16.1.6 → 16.1.7
- 依赖更新：rustls-webpki 0.103.9 → 0.103.10
- 依赖更新：flatted 3.3.3 → 3.4.2

---

## [0.7.0] - 2026-03-22

### Added

**自动更新检查 (Auto Update Check)**:

- 应用启动时自动检查更新（限制每 24 小时一次）
- 设置 > 关于页面添加"检查更新"按钮
- 支持"跳过此版本"功能
- 显示更新内容摘要和下载链接

**批量编辑 (Batch Edit)**:

- Todos/Plans/Targets 列表视图支持多选模式
- 全选/取消全选功能
- 批量操作工具栏：状态、优先级、截止日期修改
- 批量归档和删除功能
- 后端新增批量操作 API：`bulk_update_todos`, `bulk_archive_todos`, `bulk_update_plans`, `bulk_delete_plans`, `bulk_update_targets`, `bulk_delete_targets`

**快捷键系统 (Hotkey System)**:

- 应用内全局快捷键支持
- 默认快捷键：
  - `Ctrl+N` - 新建 Todo
  - `Ctrl+K` - 打开搜索
  - `Ctrl+1-6` - 切换视图
  - `Ctrl+,` - 打开设置
  - `Escape` - 关闭弹窗/取消选择
- 设置 > 通用 > 快捷键自定义配置
- 冲突检测防止重复绑定
- 输入框内不触发快捷键

**重复任务 (Recurring Todos)**:

- 支持重复类型：每日、每周、每月、每年
- 高级模式：每月第 N 个周 X（如"每月第二个周二"）
- 结束条件：日期截止、次数上限
- 完成后自动创建下一个实例
- 数据库新增字段：`recurrence`, `recurrence_from`, `recurrence_index`

**Google Drive 同步**:

- OAuth 2.0 PKCE 安全认证流程
- 备份上传到 Google Drive（带时间戳）
- 从云端备份恢复数据库
- 查看云端备份文件列表
- 断开连接功能
- Deep Link 支持 OAuth 回调

### Changed

- 后端新增 `tauri-plugin-deep-link` 插件
- `todos` 表新增 `recurrence`, `recurrence_from`, `recurrence_index` 列
- 导出数据包含重复任务字段

### Fixed

- 修复 `SettingsNotificationsView.tsx` useEffect 中 setState 警告
- 修复 `RecurrenceForm.tsx` useEffect 中 setState 警告

---

## [0.6.3] - 2026-03-21

### Added

**主题系统增强 (Theme System Enhancements)**:

- 新增 Style 分类 - 10 个特色主题：
  - 黑神话 (Black Myth) - 中国神话风格，金/深红/翡翠绿配色
  - 赛博朋克 (Cyberpunk) - 未来霓虹风格，青/洋红/黑配色
  - 万圣节 (Halloween) - 恐怖节日氛围，橙/黑/紫配色
  - 圣诞节 (Christmas) - 节日喜庆风格，红/绿/白/金配色
  - 手账风 (Handwritten) - 温暖手写风格，米色/棕色配色
  - 田园风 (Cottagecore) - 自然田园浪漫，柔粉/麦色配色
  - 蒸汽波 (Vaporwave) - 复古未来主义，粉/紫/青配色
  - 暗黑学院 (Dark Academia) - 学术复古文学，深棕/象牙配色
  - 可爱风 (Kawaii) - 日系软萌可爱，粉/薄荷绿配色
  - 复古90s (Retro 90s) - 90年代怀旧风，亮紫/青/粉配色
- 新增自定义主题 (Customized) 功能：
  - 支持调整 6 个 CSS 变量：主色、次色、背景、卡片背景、文字、次要文字
  - 实时预览效果，左右并排布局
  - 草稿/保存分离模式，避免误操作
  - 未保存修改提示和放弃修改功能
- 新增字体大小调整功能：
  - 设置 > 通用 > 字体大小
  - 范围 12px ~ 24px，支持滑块和按钮调节
  - 实时预览，全局生效

**云同步 Phase 6 (Cloud Sync)**:

- 新增同步引擎核心模块 (Rust)：
  - `sync/engine.rs` - 同步引擎主控
  - `sync/change_tracker.rs` - 变更追踪
  - `sync/conflict.rs` - 冲突解决策略
  - `sync/circuit_breaker.rs` - 熔断机制
  - `sync/retry.rs` - 重试机制
  - `sync/delta.rs` - 增量同步
- 新增前端同步 API 和 Hook
- 新增同步配置页面 `SettingsSyncView`

**菜单结构调整**:

- 提取"数据管理"为顶级菜单（从设置中移出）
- 提取"通知"为顶级菜单（从设置中移出）
- 新增数据管理独立页面 `DataManagementView`

### Changed

- 主题选择器 UI 重构，支持 5 个分类 Tab
- 优化自定义主题 UX，添加草稿/保存分离模式
- 修复主题卡片文字颜色可见性问题

### Fixed

- 修复 Dark/Light 分类混入 Style 主题问题
- 修复 Custom 主题出现在 Dark 分类问题
- 修复字体大小调整未全局生效问题

---

## [0.6.2] - 2026-03-15

### Added

**全局通知设置功能 (Global Notification Settings)**:

- 新增 `SettingsNotificationsView` 页面 - 全局通知设置入口
- 新增 `SettingsCirculationNotificationsView` 页面 - 打卡通知配置
- 新增 `global_notification_settings` 数据表 - 存储全局通知设置
- 新增 `circulation_notification_settings` 数据表 - 存储打卡项通知设置
- 新增 `notification_channels` 数据表 - 存储通知渠道配置
- 新增全局通知设置 API:
  - `get_global_notification_settings` - 获取全局通知设置
  - `update_global_notification_settings` - 更新全局通知设置
- 新增打卡通知设置 API:
  - `get_global_circulation_notification_settings` - 获取打卡全局通知设置
  - `update_global_circulation_notification_settings` - 更新打卡全局通知设置
  - `get_circulations_with_notification_settings` - 获取打卡项及其通知设置
  - `update_circulation_notification_settings` - 更新单个打卡项通知设置

**UI 组件**:

- 新增 `MasterToggle` 组件 - 主开关组件
- 新增 `DefaultReminderSettings` 组件 - 默认提醒设置
- 新增 `DoNotDisturbSettings` 组件 - 免打扰设置
- 新增 `ChannelPrioritySettings` 组件 - 渠道优先级设置
- 新增 `NotificationChannelsSection` 组件 - 通知渠道区块
- 新增 `RetentionSettings` 组件 - 通知保留设置

**Hooks**:

- 新增 `useGlobalNotificationSettings` Hook - 全局通知设置状态管理
- 新增 `useCirculationNotifications` Hook - 打卡通知设置状态管理

### Changed

- 设置页面增加"通知设置"入口
- 侧边栏增加"打卡通知"设置入口

---

## [0.6.1] - 2026-03-14

### Added

**通知中心功能 (Notification Center)**:

- 新增 `NotificationCenterView` 页面 - 查看所有待处理和已发送的通知
- 新增 `NotificationBell` 组件 - 侧边栏通知铃铛，显示未读通知数量
- 新增 `NotificationModal` 组件 - 通知详情弹窗
- 新增 `notification_history` 数据表 - 存储通知历史记录
- 新增后台通知轮询服务 (`background/mod.rs`) - 自动检测到期提醒
- 新增通知相关 API:
  - `get_notification_history` - 获取通知历史
  - `send_and_record_notification` - 发送并记录通知
  - `get_due_reminders` - 获取到期提醒 (支持多时间点)
  - `set_notification_settings` / `get_notification_settings` - 通知设置管理
  - `mark_notification_sent` - 标记通知已发送
- 新增通知去重机制和实体清理逻辑
- 新增 `useNotificationPolling` Hook - 前端通知轮询

**测试覆盖增强**:

- 新增 49 个测试文件，约 1000+ 个测试用例
- **Views 测试** (16 个文件): TodosView, PlansView, TargetsView, Dashboard, StatisticsView, CirculationsView, MilestonesView, Settings 各页面等
- **Hooks 测试** (14 个文件): useTodos, usePlans, useTargets, useTasks, useTheme, useStatistics 等
- **Features 组件测试** (19 个文件): TargetForm, PlanForm, CirculationForm, TargetItem, PlanItem, StatCard, EmptyStateCard, SortableList 等

**UI 组件**:

- 新增 `Badge` 组件
- 新增 `Card` 组件
- 新增 `ScrollArea` 组件
- 新增 `Tabs` 组件
- 新增通知相关图标

### Fixed

- **代码审查修复**: 修复 `unwrap_err()` 使用、移除未使用变量等 P2 问题
- **数据库迁移**: 修复嵌套迁移代码问题，正确创建 `notification_history` 表
- **API 修复**: 通知历史 API 改为直接返回数组而非分页结果
- **前端集成**: 修复 TodosView/PlansView 中 reminder 设置未保存的问题
- **ESLint 修复**: 修复测试文件中的 TypeScript 类型错误

### Changed

- NotificationCenterView 重新设计，符合项目设计系统
- 使用 CSS 变量 (`--color-text`, `--color-primary` 等) 统一主题
- 使用 `StaggeredList` 组件实现动画效果
- 使用 `EmptyStateCard` 组件处理空状态

---

## [0.6.0] - 2026-03-13

### Added

**Reminder UI 功能**:

- 新增 `ReminderSettings` 组件 - 多时间点提醒设置，支持预设选项和自定义输入
- 新增 `ReminderQuickButton` 组件 - 快捷提醒按钮，一键设置提醒时间
- 新增 `ReminderBadge` 组件 - 提醒状态徽章显示
- 为 `Todo`、`Plan`、`Target` 类型添加 `reminder_times?: number[]` 字段
- 集成到 `TodoForm`/`TodoItem`、`PlanForm`/`PlanItem`、`TargetForm`/`TargetItem`

**测试覆盖增强**:

- 新增 `logger.test.ts` - 日志工具测试 (100% 覆盖)
- 新增 `ScaleIn.test.tsx`、`Skeleton.test.tsx`、`ProgressRing.test.tsx` - UI 组件测试
- 补充 `bulk.test.ts` - 批量操作 API 测试
- 补充 `tags.test.ts` - 标签 API 边界测试
- 补充 `Button.test.tsx` - 按钮组件边界测试
- 补充 `TodoItem.test.tsx` - React.memo 优化测试

### Changed

**WCAG 无障碍改进**:

- 触摸目标最小尺寸 44×44px (WCAG 2.5.5)
- 添加 `aria-label`、`role`、`keyboard` 支持到交互组件
- 添加 `prefers-reduced-motion` 媒体查询支持 (WCAG 2.3.3)
- 改进表单标签和输入关联

**CSS/UI 优化**:

- 添加 `--color-backdrop` CSS 变量
- StatCard 组件简化
- Input 错误状态修复
- CSS layer 修复

### Fixed

- 代码审查 P0/P1 问题修复
- 测试覆盖率提升至 92%+

---

## [0.5.11] - 2026-03-10

### Security

- **SQL 注入修复**: `import.rs` 添加 `VALID_TABLES` 白名单和 `validate_table_name()` 函数，防止恶意表名注入

### Changed

**类型系统重构**:

- 删除服务层重复类型定义 (`Todo`, `Plan`, `Step`, `Target`)
- 统一从 `@/lib/types` 导入类型定义
- 字段命名统一: `deadline` → `end_date`, `dueDate` → `due_date`
- `targetService.ts` 使用更清晰的 `ServiceTarget` 接口

**日志系统**:

- 新建 `src/lib/utils/logger.ts` 统一日志工具
- 支持动态环境检查，开发环境输出日志，生产环境静默
- 替换 4 个文件中的 `console.*` 调用

**错误处理**:

- `tryInvoke` 添加开发环境调试日志
- `ErrorBoundary` 使用统一 logger

**用户体验**:

- `CirculationDetailView` 中 `alert()` 替换为 `toast.error()`，改善交互体验

**性能优化**:

- `TodoItem.areEqual` 移除 `JSON.stringify`，改用浅比较

### Added

**测试覆盖**:

- 新增 `src/lib/api/utils.test.ts` - 20 个测试用例
- 新增 `src/lib/api/client.test.ts` - 21 个测试用例

**文档**:

- `useGlassSettings.ts` 添加 useEffect 设计意图注释

### Fixed

- 修复 `todos.test.ts` 中 `getTodosByTag` 断言不完整问题
- 修复多个测试文件适配 logger 更改

---

## [0.5.10] - 2026-03-06

### Changed

**Architecture - OCP Refactoring**:

- Refactored notification_plugins module using Trait + Registry pattern
- Resolved OCP violation: adding new notification plugins now only requires implementing NotificationSender trait
- Added PluginRegistry for centralized plugin management
- Improved thread safety with proper Send + Sync bounds

### Added

- NotificationSender trait with async support
- PluginRegistry for plugin lifecycle management
- Unit tests for notification plugins module

### Fixed

**P1 - 数据安全**:

- Fixed database initialization error: added "tags" and "entity_tags" to VALID_TABLES whitelist
- Prevented "Invalid table name: tags" panic during startup

**P2 - 图标更新**:

- Regenerated all platform icons with new logo design
- Added automated icon generation script (`scripts/generate-icons.js`)

---

## [0.5.9] - 2026-03-04

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.9] - 2026-03-04

### Fixed

**P1 - 数据安全**:

- `checkin_circulation` / `undo_checkin_circulation` 使用 IMMEDIATE 事务，修复 TOCTOU 竞态条件
- `reset.rs` 传播错误而非静默吞没
- `checkin.rs` 添加 count 参数上限验证 (防止越界)

**P2 - 日志改进**:

- `statistics.rs` 反序列化失败时添加警告日志

**P3 - 类型严格化**:

- 批量操作添加严格 status/priority 类型校验

**CI**:

- `release.yml` 添加 Android 图标复制步骤，修复 APK 图标缺失问题

### Changed

**代码重构**:

- `circulations.rs` 魔法数字 → 命名常量 (MAX_DAILY_COUNT, MAX_TOTAL_COUNT)
- `validation.rs` 颜色验证 API 返回 `Result` 类型

**API 层标准化**:

- 引入 `ensureTauri` / `withTauriError` 工具函数
- 所有 API 模块统一错误处理模式
- 提取 mock 数据到 `constants.ts`

---

## [0.5.8] - 2026-03-03

### Added

**Tag 过滤功能**:

- 新增 `get_entities_by_tag` 命令 - 按标签查询实体
- 前端标签过滤组件
- Todo 列表支持按标签筛选

### Fixed

**P1 - 数据安全**:

- `reset.rs` 数据重置添加事务包装，确保原子性

**P2 - 性能优化**:

- `statistics.rs` 批量查询优化，解决 N+1 问题
- `validation.rs` 集中化验证逻辑，消除代码重复

**P3 - 类型一致性**:

- 统一前端类型导入路径为 `@/lib/types`
- 修复测试类型定义与实际 API 匹配

### Changed

**测试覆盖率提升**:

- 覆盖率从 79% 提升到 98.18%
- 测试数量从 418 增加到 523
- 新增 16 个 API 层测试文件

---

## [0.5.7] - 2026-03-02

### Added

**服务层重构**:

- 新增 `src/lib/services/` 目录，实现前后端业务逻辑解耦
- `validation.ts` - 通用验证函数（17 个测试）
- `planService.ts` - 计划进度计算、排序（9 个测试）
- `todoService.ts` - Todo 过滤、分组、排序（10 个测试）
- `circulationService.ts` - 打卡统计、趋势（8 个测试）
- `targetService.ts` - 目标进度、分类（11 个测试）
- `milestoneService.ts` - 里程碑管理（11 个测试）

**UI/UX 改进**:

- ErrorBoundary 全局错误边界组件
- Icons 统一图标管理组件
- 交互工具类 (cursor-pointer, hover, focus)
- React Query 配置优化

### Fixed

**后端安全与稳定性**:

- SQL 注入防护 - 使用参数化查询替代字符串拼接
- XSS 防护 - dangerouslySetInnerHTML 脚本外部化
- 输入验证 - Rust validation.rs 模块
- 事务处理 - import 操作添加 commit/rollback 逻辑
- 错误日志 - 移除静默吞没，添加日志记录

**性能优化**:

- N+1 查询修复 - useTodos 直接调用 API
- React.memo - TodoItem 添加自定义比较函数
- 移除死代码 - 删除未使用的 Zustand store

**无障碍改进**:

- aria-label 支持
- 键盘导航支持

**UI 修复**:

- SearchBar 响应式适配

**Bug 修复**:

- 修复 seed_test_data 使用 INSERT OR IGNORE 避免重复数据失败
- 修复 reset_data 遗漏 schema_migrations 表清理
- SearchBar 响应式适配

### Changed

- 测试覆盖率从 ~90% 提升至 95.43%
- 移除未使用的 Zustand store

---

## [0.5.6] - 2026-03-01

### Fixed

**Mobile UI Fixes**:

- Dashboard bottom content blocked by navigation bar (paddingBottom 4rem)
- Sidebar background transparency issue (z-index z-[60])
- Dark theme text unreadable in theme selector (white text)
- Statistics heatmap cutoff and overlap (horizontal scroll + padding)
- Dashboard card layout optimization (2 columns on mobile)
- Chinese/English terminology unification (计划/目标)
- TypeScript icon fix (📘)
- About page navigation logic (back button)
- Button text too long (+ 新建 Plan → + 新建)
- Filter bar spacing optimization (mb-4 → mb-2)
- Check update button styling
- Tech stack cards centered vertically and horizontally

**Test Enhancement**:

- Added Button component variant/size tests
- Added HoverCard style/event tests
- Added RippleEffect click effect tests

### Added

**Documentation**:

- Mobile UI fix design document
- Task progress checklist
- Backend test architecture redesign plan (v1.0)

---

## [0.5.5] - 2026-02-28

### Added

**UI/UX Enhancement - Design System**:

- Extended shadow system with 5 levels (sm, md, lg, xl, glow) for all 9 themes
- Glass effect enhancements (borderGlow, innerShadow) in theme registry
- CSS variables for animation timing (--animation-easing-spring, --animation-duration-\*)

**UI/UX Enhancement - Animation Components**:

- `RippleEffect`: Click ripple animation for buttons/cards
- `StaggeredList` / `StaggeredListItem`: Staggered entrance animations for lists
- `HoverCard`: Enhanced hover effects with shadow/glow
- `PageSlide`: Page transition animations
- All animations use spring easing (cubic-bezier: 0.22, 1, 0.36, 1)

**UI/UX Enhancement - Button Component**:

- Click ripple effect using Framer Motion
- Hover scale and glow effects
- Loading spinner animation
- Icon support with proper spacing

**UI/UX Enhancement - Modal Component**:

- Spring animation (scale + fade + y translation)
- Blur backdrop effect using --glass-blur
- All theme colors via CSS variables
- Added "xl" width option

**UI/UX Enhancement - Data Visualization**:

- `GaugeChart`: Circular progress indicator with animated fill
- `TrendChart`: Line/area/bar chart for trend visualization
- `HeatmapCalendar`: GitHub-style activity heatmap
- All charts support theme colors via CSS variables

### Changed

- Theme registry extended with `shadows` and `glass` objects
- globals.css extended with shadow variables and utility classes
- Button component refactored with Framer Motion
- Modal component enhanced with AnimatePresence

### Technical

- All components use theme CSS variables for colors
- Full TypeScript strict mode support
- Framer Motion for all animations
- Test coverage for new components

---

## [0.5.4] - 2026-02-24

### Added

**React Query + Zustand 基础设施**:

- `@tanstack/react-query`: 数据获取、缓存、乐观更新
- `zustand`: 集中式状态管理
- `QueryProvider`: React Query Provider 配置
- `src/lib/store.ts`: Zustand 全局状态 Store

**React Query Hooks**:

- `useTodos`: Todo CRUD 操作 + 乐观更新
- `usePlans`: Plan CRUD 操作 + 乐观更新
- `useTags`: Tag CRUD 操作
- `useTargets`: Target CRUD 操作 + 乐观更新
- `useMilestones`: Milestone CRUD 操作
- `useTasks`: Task CRUD 操作
- `useDashboard`: Dashboard 数据获取
- `useStatistics`: 统计数据获取
- `useCirculations`: Circulation CRUD 操作
- `useDailySummarySettings`: 日常摘要设置
- `useNotificationPlugins`: 通知插件管理

**ViewsView 组件提取**:

- `ViewsFilters`: 筛选器组件
- `ViewsList`: 列表视图组件
- `ViewsBoard`: 看板视图组件
- `ViewsCalendar`: 日历视图组件
- `ViewsGantt`: 甘特图视图组件

**Rust 后端**:

- `get_circulation_logs_batch`: 批量获取 circulation logs，解决 N+1 查询问题

**CI/CD**:

- 添加 iOS 构建 workflow (实验性支持)
- 支持 Xcode Personal Team 签名和 App Store Connect API 签名

### Changed

**视图迁移到 React Query** (11 个视图):

- Dashboard: 移除手动 useEffect，使用 useDashboard
- TodosView: 移除手动 useEffect，使用 useTodos
- PlansView: 重构为 React Query + 提取 PlanCard 子组件
- TargetsView: 重构为 React Query + 提取 TargetCard 子组件
- MilestonesView: 移除手动 useEffect，使用 useMilestones
- StatisticsView: 移除手动 useEffect，使用 useStatistics
- SettingsTagsView: 移除手动 useEffect，使用 useTags
- SettingsChannelsView: 移除手动 useEffect，使用 useNotificationPlugins
- SettingsDailySummaryView: 移除手动 useEffect，使用 useDailySummarySettings
- CirculationsView: 重构为 React Query + 批量 API
- ViewsView: 重构为 React Query + useQueries

### Fixed

**React Hooks 违规修复**:

- TargetsView: 提取 TargetCard 子组件，修复 hooks-in-callback 错误
- ViewsView: 使用 useQueries 修复 hooks-in-loop 错误
- PlansView: 提取 PlanCard 子组件，修复 hooks-in-callback 错误

**CirculationsView 无限循环修复** (2026-02-25):

- 移除重复的 useEffect，修复 "Maximum update depth exceeded" 错误
- 移除 useMemo 包裹的 useSensors，修复 "Do not call Hooks inside useMemo" 错误

**ESLint 错误修复**:

- SettingsDailySummaryView、page.tsx、Sidebar、useSystemTheme: 添加 eslint-disable 注释修复 setState-in-effect 警告

**类型修复**:

- useCirculations: 修正 CirculationType 和 PeriodicFrequency 类型定义
- SettingsChannelsView: 移除无效的 plugin_type 参数
- SettingsDailySummaryView: 修正 includePending 参数名

## [0.5.3] - 2026-02-23

### Added

**全局搜索**: Sidebar 集成 SearchBar，支持 Ctrl+K 快捷键打开搜索
**4 个新主题**: Spring (春意)、Catppuccin、Tokyo Night、One Dark
**系统主题跟随**: 添加 useSystemTheme hook，自动跟随操作系统深色/浅色模式
**ThemeSelector 改进**: 4列网格布局，所有主题都可调整透明度/模糊度
**淡入动画**: Dashboard、Todos、Plans、Targets、Milestones 视图添加 FadeIn 动画
**Skeleton 组件**: 添加骨架屏加载组件

### Changed

**主题过渡动画**: 使用 cubic-bezier(0.22, 1, 0.36, 1) 缓动函数，过渡更平滑
**主题透明度**: 所有主题支持透明度/模糊度调节（之前仅玻璃主题）
**删除 SettingsView**: 移除未使用的独立设置页面

### Fixed

**移动端 z-index 修复**: 汉堡菜单、Sidebar overlay 的层级问题
**SearchBar 溢出**: 修复移动端搜索框溢出问题 (w-64 → w-full)
**新主题不生效**: 修复新主题 CSS 变量未正确应用透明度的问题

---

## [0.5.2] - 2026-02-23

### Fixed

- **移动端刘海遮挡修复**: Header、Sidebar、Main Content 添加 safe-area padding
- **移动端 Sidebar 优化**: 添加关闭按钮和顶部安全区域
- **移动端滚动条隐藏**: 隐藏 body 和 webkit 滚动条
- **移动端底部导航高度**: 从 h-16 调整为 h-14 (56px)
- **移动端视图间距优化**: Dashboard、Todos 等页面添加响应式 padding

---

## [0.5.1] - 2026-02-23

### Fixed

- **移动端安全区域适配**: 修复刘海屏/全面屏设备上的 UI 遮挡问题
  - 顶部刘海区域不再遮挡汉堡菜单
  - 底部虚拟导航键不再遮挡 BottomNav
  - 侧边栏不被刘海遮挡
  - 使用 CSS `env()` 函数自动适配不同系统设置

---

## [0.5.0] - 2026-02-23

### Added

- **移动端响应式布局**: 完全重构移动端导航和布局
  - 移动端引入汉堡菜单，点击展开侧边栏 overlay
  - 平板端侧边栏自动收起
  - 桌面端保持原有 Sidebar + TitleBar 布局

### Changed

- **Dashboard 响应式网格**:
  - 统计卡片: 移动端1列 → 平板2列 → 桌面3列
  - EntityCount: 移动端3列 → 平板5列 → 桌面7列
  - Plans/Targets: 移动端1列 → 平板/桌面2列

### Fixed

- **Android 视口问题**: 添加 viewport meta 和 CSS 修复，解决 UI 旋转90度问题
- **玻璃效果透明度**: 修复启动时不加载透明度设置的问题，现在启动时立即应用

---

## [0.4.6] - 2026-02-23

### Added

- **自定义窗口标题栏**: 桌面端应用添加自定义窗口标题栏，完全取代原生窗口装饰
  - 标题栏高度 36px，显示应用图标和标题
  - 窗口控制按钮（最小化、最大化/还原、关闭）
  - 支持拖拽移动窗口
  - 双击标题栏可最大化/还原窗口
  - 标题栏颜色随主题变化

### Changed

- **桌面端视觉样式**: 桌面端应用整体添加圆角、边框和阴影
  - 整个应用容器统一圆角 (rounded-lg)
  - 边框 (border border-[var(--color-border)])
  - 阴影 (shadow-lg)
  - 移动端保持原有布局不变

---

## [0.4.5] - 2026-02-23

### Added

- **生成测试数据**: 在设置页面添加「生成测试数据」按钮，可快速生成示例数据用于测试
  - 6 个标签 (工作、生活、学习、健康、娱乐、财务)
  - 10 个待办事项
  - 3 个计划
  - 15 个任务
  - 5 个目标
  - 10 个步骤
  - 5 个里程碑
  - 8 个打卡 (6 个周期性 + 2 个计数型)
  - 30 条打卡记录
- **重置数据**: 在设置页面添加「重置数据」按钮，支持选择保留标签和设置

### Changed

- **设置页面**: 重构设置-通用页面，添加数据操作区域

---

## [0.4.4] - 2026-02-23

### Changed

- **组件拆分**: 将大组件拆分为可复用的小组件，提高代码可维护性
  - TodosView → TodoItem, TodoForm, TodoFilters
  - Dashboard → StatCard, EntityCountCard, CirculationStatsCard, QuickActions
  - SettingsView → ThemeSelector, LanguageSelector, DataBackupSettings, AboutCard

### Fixed

- **Hydration 错误 (Sidebar)**: 修复 Sidebar 组件服务端/客户端渲染不一致问题
- **Hydration 错误 (page.tsx)**: 修复页面 sidebar 状态导致的水合错误
- **Android 数据库路径**: 修复 Android 应用闪退问题，使用 Tauri v2 path API 获取正确的应用数据目录

---

## [0.4.3] - 2026-02-22

### Added

- **拖拽排序**: 今日打卡页面支持拖拽排序，使用 dnd-kit 实现网格拖拽
- **折叠侧边栏 Hover 弹窗**: 折叠侧边栏时，悬停有子菜单的项显示弹窗
- **动态版本号**: Settings 页面从 package.json 读取版本号

### Changed

- **dnd-kit 替换 @hello-pangea/dnd**: 使用更现代的 dnd-kit 库
- **Sidebar 弹窗逻辑**: 优化 hover 弹窗显示逻辑，添加延迟隐藏防止闪烁

### Fixed

- **拖拽不能工作**: 修复拖拽事件未正确绑定的问题
- **侧边栏弹窗消失**: 修复鼠标从菜单移到弹窗时弹窗消失的问题

---

## [0.4.2] - 2026-02-21

### Added

- **4个新主题**: Dracula、Nord、Monokai、Warm (暖色调) 主题
- **空状态组件**: EmptyState、EmptyStateCard 组件
- **Toast 通知**: 在 Plans、Targets、Milestones、Todos 等页面添加操作成功/失败提示
- **进度环组件**: ProgressRing 组件，支持 Dashboard 和打卡详情页

### Changed

- **主题透明度**: 所有主题支持透明度调节 (5-100%)
- **主题模糊度**: 所有主题支持模糊效果调节
- **数字显示**: 大数字使用 K/W/M 格式，悬停显示完整数值
- **毛玻璃主题**: 替换为暖色调主题，更温馨舒适

### Fixed

- **Warm 主题**: 修复 CSS 变量未应用的问题
- **打卡详情**: 进度环仅在计数类型显示，周期类型隐藏
- **数字溢出**: 修复大数字显示溢出问题

---

## [0.4.1] - 2026-02-20

### Added

- **主题系统**: 添加6个主题支持 (浅色、深色、Dracula、Nord、Monokai、毛玻璃)
- **ThemeRegistry**: 集中的主题配置文件，方便添加新主题
- **移动端响应式布局**: 添加底部导航栏，移动端自动隐藏侧边栏
- **骨架屏组件**: Skeleton、SkeletonText、SkeletonCard、SkeletonList 加载组件

### Changed

- **修复 Hydration 错误**: 使用 inline script 在 React 加载前设置主题
- **CSS 变量**: 所有视图使用 CSS 变量替代硬编码颜色，支持主题切换
- **Sidebar**: 使用 CSS 变量适配主题
- **设置页面**: 使用 ThemeSelector 组件

### Technical

- 使用 `suppressHydrationWarning` 防止服务端/客户端渲染不匹配
- useTheme hook 支持 SSR

---

## [0.4.0] - 2026-02-19

### Added

- **打卡详情弹窗**: 点击卡片标题或"详情"按钮打开弹窗
- **计数打卡手动输入**: 支持手动输入打卡次数
- **打卡卡片4列网格布局**: 今日打卡页面使用4列网格布局
- **计数打卡多次打卡**: 计数类型打卡每日可重复多次打卡
- **打卡进度精确统计**: 今日打卡卡片显示打卡次数和累计进度，打卡记录显示每次的增量

### Changed

- 打卡卡片UI优化: 周期打卡(绿色/琥珀色)和计数打卡(蓝色)区分更明显
- 按钮样式优化: 已完成/待打卡/计数打卡按钮颜色区分明显
- 打卡记录表格优化: 周期类型显示周期，计数类型显示进度增量
- 打卡详情页统计卡片优化

### Fixed

- 修复计数打卡显示错误: 之前显示的是总进度，现在正确显示今日次数和今日进度
- 后端支持: Tauri checkin_circulation 命令支持 count 参数

---

## [0.3.9] - 2026-02-15

### Added

- **多平台发布支持**: GitHub Actions 自动构建和发布 Ubuntu (deb, rpm, appimage), Windows (nsis, msi), macOS (dmg, app), Android (apk, aab)
- **GitHub Release 自动化**: 使用 `softprops/action-gh-release` 自动创建 release 并上传构建产物

### Refactored

- Milestone 模型重构: 移除 `plan_id`, `task_id`, `target_id` 字段，改用统一的 `biz_type` + `biz_id` 字段
- `biz_type` 支持: `'plan' | 'task' | 'target' | 'circulation'`
- 添加 `schema_migrations` 表追踪数据库迁移，确保迁移只执行一次
- 更新所有后端 SQL 查询 (milestones, export, import)
- 修复单元测试中的 Milestone 初始化

### Fixed

- 修复 export.rs 和 import.rs 中未使用的导入警告
- 修复 import_replace 和 import_update 中未使用的 mut 变量
- 修复 release workflow 中 tauri-action artifact 识别问题
- 修复 productName 包含空格导致的问题
- 修复 GitHub Actions rust-toolchain action 名称错误

---

## [0.3.8] - 2026-02-15

### Added

- 应用图标: 添加 plan-todos-logo 作为应用图标

---

## [0.3.7] - 2026-02-15

### Added

- Import/Export 功能: 支持导出全部数据 (todos, tasks, plans, targets, steps, milestones, tags, entity_tags, settings)
- Import 支持三种模式: merge (跳过冲突), replace (清空后导入), update (upsert 模式)
- 导出数据格式: JSON，包含版本号和导出时间戳
- 后端: export_data 和 import_data API
- 前端: 设置 > 通用 页面集成导入导出组件

### Fixed

- 侧边栏菜单缩进修复:
  - Level 1: ml-4, Level 2: ml-8 (保持 2x 关系)
  - Level 2 max-width 调整为匹配 ml-8 缩进
- 修复 React StrictMode 导致重复 API 调用问题:
  - 添加 isLoaded ref 防止重复加载
  - 影响视图: Dashboard, Todos, Plans, Targets, Tags, Milestones, Statistics, Views
- 侧边栏子菜单对齐: 无子菜单的项不显示箭头占位符

---

## [0.3.6] - 2026-02-15

### Added

- Tags 标签功能: 支持给 Todo/Plan/Target 添加标签
- 后端: 创建 tags 表和 entity_tags 关联表
- 后端: Rust tags API (get_tags, create_tag, update_tag, delete_tag)
- 后端: Entity tags API (get_entity_tags, set_entity_tags, get_entities_by_tag)
- 前端: 设置页面添加标签管理 (Settings > 标签管理)
- 前端: Todo/Plan/Target 列表显示标签徽章
- 前端: Todo/Plan/Target 创建/编辑表单添加标签选择器
- 前端: Todo/Plan/Target 列表添加标签筛选器 (支持多选 OR 逻辑)
- 侧边栏: 添加标签管理导航入口 (设置 > 通用和通知之间)
- 标签描述字段: tags 表增加 description 字段

### Fixed

- 数据库迁移: 修复 priority 字段重复添加问题
- 数据库: 启用 SQLite foreign keys 支持级联删除
- 后端验证: 标签名称/颜色输入验证
- 前端: 重复标签名称检查

### Refactored

- Todo 页面筛选 UI 重构:
  - 第一行: 状态 tabs 在左，视图切换在右
  - 第二行: 优先级下拉框、标签下拉框、搜索框
  - 下拉框提升 z-index 防止遮挡
  - 搜索框添加清空按钮

### Changed

- 更新 iteration-plan.md Phase 2 状态

---

## [0.3.5] - 2026-02-14

### Added

- Priority 优先级功能: 给 Todo/Task/Step 添加 P0-P3 优先级
- 后端: 数据库添加 priority 字段 (默认 P2)
- 后端: Rust models 和 CRUD 操作支持 priority
- 前端: Todo 创建/编辑表单添加优先级选择器
- 前端: Todo 列表显示优先级颜色徽章
- 前端: Todo 列表添加优先级筛选器
- 添加 Priority 类型测试

### Changed

- 更新 iteration-plan.md Phase 2 状态

---

## [0.3.1] - 2026-02-14

### Added

- Dashboard 使用单一 `getDashboard()` API 替代多个独立调用
- 后端聚合所有 Dashboard 数据: overview, week, counts, today_todos, overdue_todos, completed_today, active_plans, active_targets, active_milestones
- SQLite 数据持久化到本地文件 (dirs::data_local_dir()/plan-todos/data.db)
- 更新 iteration-plan.md 包含 Phase 1 详细设计
- 更新 api.ts 添加 Dashboard interface 和 getDashboard 函数

### Changed

- 前端 Dashboard.tsx 从 3 个 API 调用改为 1 个
- api.test.ts 适配新的 Dashboard interface

### Documentation

- 添加迭代计划文档 (docs/archived/iteration-plan.md)
- 重组文档目录，归档旧版本文档到 docs/archived/

---

## [0.3.0] - 2026-02-13

### Added

- 添加 Search 和 Calendar 组件
- 添加 Settings 子菜单 UI
- 添加通知系统 (Phase 5)
- 批量操作 API (批量更新/删除)
- 单实体查询 API
- Dashboard API (今日概览)
- 数据库索引和统计 API

### Fixed

- 侧边栏 UI 改进 (字体大小、缩进、菜单箭头位置)
- About 页面布局 (2 列网格)
- About 菜单位置调整

---

## [0.2.0] - 2026-02-12

### Added

- 外部通知插件集成
- API 日志记录 (执行时间、状态)

---

## [0.1.0] - 2026-02-11

### Added

- 初始版本发布
- 基础 Todo 管理功能
- Plans、Targets、Milestones 视图
- 统计页面
- 设置页面 (General, Channels, Daily Summary, About)
- 侧边栏导航
- 基础 UI 组件库 (Button, Card, Checkbox, Input, Modal, ProgressBar, SearchBar)
