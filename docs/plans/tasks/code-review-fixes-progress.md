# 代码审查修复任务清单

**创建日期**: 2026-03-08
**计划文档**: [2026-03-08-code-review-fixes.md](../2026-03-08-code-review-fixes.md)
**总任务数**: 16 个

---

## 任务清单

### 阶段 1: 安全修复 (P1)

| #   | 任务                                             | 状态      | 提交 | 备注                                    |
| --- | ------------------------------------------------ | --------- | ---- | --------------------------------------- |
| 1   | P1-1: Rust SQL 注入修复 - import.rs              | ✅ 已完成 | 618b7cf | 添加表名白名单验证                      |
| 2   | P1-2: TypeScript 类型重复定义 - todoService.ts   | ✅ 已完成 | d93e252 | 删除重复 Todo 类型，从 types/ 导入      |
| 3   | P1-3: TypeScript 类型重复定义 - planService.ts   | ✅ 已完成 | 20eefb2 | 删除重复 Plan/Step 类型，从 types/ 导入 |
| 4   | P1-4: TypeScript 类型重复定义 - targetService.ts | ✅ 已完成 | ddf96f0 | 删除重复 Target 类型，从 types/ 导入    |
| 5   | P1-5: TypeScript 空 catch 块修复 - client.ts     | ✅ 已完成 | 903f2b5 | tryInvoke 添加错误日志                  |

| #   | 任务                                           | 状态      | 提交 | 备注                                             |
| --- | ---------------------------------------------- | --------- | ---- | ------------------------------------------------ |
| 6   | P2-6: 创建统一日志工具 - logger.ts             | ✅ 已完成 | 341d582 | 新建 src/lib/utils/logger.ts             |
| 7   | P2-7a: 添加 API 测试 - utils.test.ts           | ✅ 已完成 | 276639d | 测试 ensureTauri, withTauriError 等              |
| 8   | P2-7b: 添加 API 测试 - client.test.ts          | ✅ 已完成 | 93b7b8e | 测试 ApiError, invoke, tryInvoke 等              |
| 9   | P2-8: 修复测试断言 - todos.test.ts             | ✅ 已完成 | 30f5e5a | 修复 getTodosByTag 断言                          |
| 10  | P2-9: useEffect 依赖注释 - useGlassSettings.ts | ✅ 已完成 | bcbc1b9 | 添加设计意图注释                                 |
| 11  | P2-10: 替换 console 调用为 logger              | ✅ 已完成 | 15f95fd | utils.ts, useTheme.ts, CirculationDetailView.tsx |

### 阶段 3: 低优先级优化 (P3)

| #   | 任务                             | 状态      | 提交 | 备注                       |
| --- | -------------------------------- | --------- | ---- | -------------------------- |
| 12  | P3-11: alert() 替换为 Toast      | ✅ 已完成 | 2aa935a | CirculationDetailView.tsx  |
| 13  | P3-12: ErrorBoundary 使用 logger | ✅ 已完成 | 4897ee6 | ErrorBoundary.tsx          |
| 14  | P3-13: JSON.stringify 性能优化   | ✅ 已完成 | 168a1f1 | TodoItem.tsx areEqual 函数 |

### 阶段 4: 架构改进

| 15  | A1: 检查 types 目录类型完整性     | ✅ 已完成 | N/A      | PlanProgress/TargetProgress 无需移动     |
| 16  | A3: 运行测试确认覆盖率            | ⏳ 待开始 | -    | npm run test, npm run test:coverage        |
| --- | ---------------------------------- | --------- | ---- | ------------------------------------- |
| 15  | A1: 检查并补充 types/ 目录缺失类型 | ⏳ 待开始 | -    | Step, PlanProgress, TargetProgress 等 |
| 16  | A3: 运行测试确认覆盖率             | ⏳ 待开始 | -    | 确保 API 层测试通过                   |

---

## 执行进度
- **开始时间**: 2026-03-08
- **当前阶段**: 阶段4 架构改进
- **已完成**: 15 / 16
- **进度**: 93.75%
- **进度**: 87.5%

## 验收检查清单
- **当前阶段**: 阶段3 低优先级优化
- **已完成**: 13 / 16
- **进度**: 81.25%
- **进度**: 75%
## 验收检查清单

- [ ] TypeScript 类型检查通过 (`npm run typecheck`)
- [ ] 所有测试通过 (`npm run test`)
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] 构建成功 (`npm run build`)

---

## 状态说明

- ⏳ 待开始
- 🔄 进行中
- ✅ 已完成
- ❌ 阻塞
- ⏭️ 跳过
