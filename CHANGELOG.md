# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
