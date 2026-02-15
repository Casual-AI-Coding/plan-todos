# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.11] - 2026-02-15

### Fixed
- GitHub Actions workflow: fixed multi-platform release files path pattern

---

## [0.3.10] - 2026-02-15

### Added
- Multi-platform CI release: Ubuntu (deb, rpm, appimage), Windows (nsis, msi), macOS (dmg, app)
- GitHub Actions workflow improvements: fixed artifact upload issues

### Fixed
- Bundle targets configuration in tauri.conf.json

---

## [0.3.9] - 2026-02-15

### Refactored
- Milestone 模型重构: 移除 `plan_id`, `task_id`, `target_id` 字段，改用统一的 `biz_type` + `biz_id` 字段
- `biz_type` 支持: `'plan' | 'task' | 'target' | 'circulation'`
- 添加 `schema_migrations` 表追踪数据库迁移，确保迁移只执行一次
- 更新所有后端 SQL 查询 (milestones, export, import)
- 修复单元测试中的 Milestone 初始化

### Fixed
- 修复 export.rs 和 import.rs 中未使用的导入警告
- 修复 import_replace 和 import_update 中未使用的 mut 变量

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
