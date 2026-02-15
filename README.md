# Plan Todos

> 本地优先的跨平台任务管理应用

![Version](https://img.shields.io/badge/version-0.3.9-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Android-green)
![Framework](https://img.shields.io/badge/framework-Tauri%20v2-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

## 简介

Plan Todos 是一款本地优先的跨平台任务管理应用，融合短期 TODO 与长期 PLAN，帮助用户追踪日常事务与长期目标。

数据存储在本地 SQLite 数据库中，不依赖云服务，保护隐私。

## 特性

### 核心功能
- **Dashboard** - 今日概览、统计数据、进度追踪
- **待办清单 (Todos)** - 日常任务管理，支持优先级、标签
- **计划 (Plans)** - 长期规划与目标分解
- **目标 (Targets)** - 具体可衡量的目标
- **里程碑 (Milestones)** - 关键节点追踪
- **统计分析** - 完成率、效率评分、趋势分析

### 数据管理
- **导入/导出** - JSON 格式数据备份，支持 merge/replace/update 三种模式
- **本地存储** - SQLite 数据持久化，数据不上云
- **标签系统** - 给 Todo/Plan/Target 添加标签分类

### 平台支持
- Windows (NSIS/MSI 安装包)
- macOS (DMG 安装包)
- Linux (DEB/RPM/AppImage)
- Android (APK/AAB)

## 技术栈

| 组件 | 技术 |
|------|------|
| 核心框架 | Tauri v2 (Rust) |
| 前端 | Next.js 16 + React 19 |
| 语言 | TypeScript |
| 数据库 | SQLite (本地文件) |
| 测试 | Vitest |
| UI | Tailwind CSS |
| 构建 | GitHub Actions (多平台自动构建) |

## 快速开始

### 环境要求

- Node.js 18+
- Rust 1.70+
- npm 9+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 前端开发 (Next.js)
npm run dev

# Tauri 开发 (桌面应用)
npm run tauri:dev
```

### 构建发布

```bash
# 构建 Tauri 应用
npm run tauri:build

# Android 开发
npm run tauri:android:init   # 初始化 Android 项目
npm run tauri:android:dev   # 开发模式
npm run tauri:android:build # 构建 APK/AAB
```

## 项目结构

```
plan-todos/
├── src/                    # 前端源码
│   ├── app/               # Next.js App Router
│   │   └── views/         # 页面视图
│   ├── components/       # React 组件
│   │   └── ui/           # UI 组件库
│   └── lib/              # 工具函数
├── src-tauri/             # Rust 后端
│   └── src/
│       ├── main.rs        # 入口
│       ├── db.rs         # 数据库操作
│       └── dashboard.rs  # Dashboard API
├── docs/                  # 设计文档
│   └── plans/            # 迭代计划
└── public/               # 静态资源
```

## 主要视图

| 视图 | 说明 |
|------|------|
| Dashboard | 今日概览、统计数据、进度追踪 |
| Todos | 待办清单管理 |
| Plans | 计划管理 |
| Targets | 目标追踪 |
| Milestones | 里程碑管理 |
| Statistics | 数据统计分析 |
| Settings | 应用设置 |

## 迭代计划

详见 [docs/plans/iteration-plan.md](./docs/plans/iteration-plan.md)

- **Phase 1**: Dashboard 连接真实数据 + 数据持久化
- **Phase 2**: 增强功能 (待规划)
- **Phase 3**: Circulation 打卡概念 (待规划)

## 测试

```bash
# 运行所有测试
npm run test

# 监听模式
npm run test:watch

# 带覆盖率
npm run test:coverage
```

## 代码质量

```bash
# TypeScript 检查
npm run typecheck

# ESLint 检查
npm run lint

# 代码格式化
npm run format
```

## 版本历史

详见 [CHANGELOG.md](./CHANGELOG.md)

## 许可证

MIT License
