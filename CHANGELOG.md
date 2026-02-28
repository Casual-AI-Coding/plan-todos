# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- 添加迭代计划文档 (docs/plans/iteration-plan.md)
- 重组文档目录，归档旧版本文档到 docs/plans/archived/

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
