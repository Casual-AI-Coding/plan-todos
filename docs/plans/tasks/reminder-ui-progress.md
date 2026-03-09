# Reminder UI 实现进度跟踪

> 版本: v0.6.0
> 开始日期: 2026-03-10
> 设计文档: [2026-03-10-v0.6.0-reminder-ui-design.md](../2026-03-10-v0.6.0-reminder-ui-design.md)

---

## 任务总览

| Phase                     | 任务数 | 完成  | 进行中 | 待开始 |
| ------------------------- | ------ | ----- | ------ | ------ |
| Phase 1: 基础组件         | 4      | 4     | 0      | 0      |
| Phase 2: Todo 集成        | 3      | 1     | 1      | 1      |
| Phase 3: Plan/Target 集成 | 4      | 0     | 0      | 4      |
| Phase 4: 测试与验收       | 3      | 0     | 0      | 3      |
| **总计**                  | **14** | **5** | **1**  | **8**  |

---

## Phase 1: 基础组件

### Task 1.1: 创建 ReminderSettings 组件

- **状态**: ✅ 已完成
- **涉及文件**: `src/components/features/ReminderSettings.tsx`
- **描述**: 创建提醒设置区块组件，支持多选预设时间和自定义时间
- **Commit**: adbf16a
- **Review**: ✅ 通过
### Task 1.2: 创建 ReminderQuickButton 组件

- **状态**: ✅ 已完成
- **涉及文件**: `src/components/features/ReminderQuickButton.tsx`
- **描述**: 创建快捷提醒按钮组件，点击弹出提醒设置弹窗
- **Commit**: a1487e7
- **Review**: ✅ 通过
### Task 1.3: 创建 ReminderBadge 组件

- **状态**: ✅ 已完成
- **涉及文件**: `src/components/features/ReminderBadge.tsx`
- **描述**: 创建提醒状态徽章组件，显示提醒数量和状态
- **Commit**: 501da82
- **Review**: ✅ 通过
### Task 1.4: 添加组件单元测试

- **状态**: ✅ 已完成
- **涉及文件**: `src/components/features/__tests__/ReminderBadge.test.tsx`
- **描述**: 为 ReminderBadge 组件添加单元测试 (17个测试用例)
- **Commit**: 9dac3e1
- **Review**: ✅ 通过
---

## Phase 2: Todo 集成

### Task 2.1: 修改 TodoForm 集成提醒设置

- **状态**: ✅ 已完成
- **涉及文件**: `src/components/features/TodoForm.tsx`
- **描述**: 在 TodoForm 中集成 ReminderSettings 区块
- **Commit**: 80294c6
- **Review**: ✅ 通过
### Task 2.2: 修改 TodoItem 添加快捷按钮

- **状态**: ⏳ 待开始
- **涉及文件**: `src/components/features/TodoItem.tsx`
- **描述**: 在 TodoItem 中添加 ReminderQuickButton
- **Commit**: -
- **Review**: -

### Task 2.3: 更新 Todo 相关测试

- **状态**: ⏳ 待开始
- **涉及文件**: `src/components/features/__tests__/TodoForm.test.tsx`
- **描述**: 更新 TodoForm 和 TodoItem 的测试用例
- **Commit**: -
- **Review**: -

---

## Phase 3: Plan/Target 集成

### Task 3.1: 修改 PlanForm 集成提醒设置

- **状态**: ⏳ 待开始
- **涉及文件**: `src/components/features/PlanForm.tsx`
- **描述**: 在 PlanForm 中集成 ReminderSettings 区块
- **Commit**: -
- **Review**: -

### Task 3.2: 修改 PlanItem 添加快捷按钮

- **状态**: ⏳ 待开始
- **涉及文件**: `src/components/features/PlanItem.tsx`
- **描述**: 在 PlanItem 中添加 ReminderQuickButton
- **Commit**: -
- **Review**: -

### Task 3.3: 修改 TargetForm 集成提醒设置

- **状态**: ⏳ 待开始
- **涉及文件**: `src/components/features/TargetForm.tsx`
- **描述**: 在 TargetForm 中集成 ReminderSettings 区块
- **Commit**: -
- **Review**: -

### Task 3.4: 修改 TargetItem 添加快捷按钮

- **状态**: ⏳ 待开始
- **涉及文件**: `src/components/features/TargetItem.tsx`
- **描述**: 在 TargetItem 中添加 ReminderQuickButton
- **Commit**: -
- **Review**: -

---

## Phase 4: 测试与验收

### Task 4.1: 手动功能测试

- **状态**: ⏳ 待开始
- **描述**: 手动测试所有提醒功能
- **测试项**:
  - [ ] TodoForm 中可设置多个提醒时间
  - [ ] TodoItem 上显示提醒状态图标
  - [ ] 点击图标可快捷修改提醒
  - [ ] Plan 表单和列表项支持提醒设置
  - [ ] Target 表单和列表项支持提醒设置
  - [ ] 自定义时间输入功能正常
- **Commit**: -
- **Review**: -

### Task 4.2: 补充 E2E 测试

- **状态**: ⏳ 待开始
- **涉及文件**: `e2e/reminder.spec.ts`
- **描述**: 添加 E2E 测试覆盖提醒功能
- **Commit**: -
- **Review**: -

### Task 4.3: 代码审查

- **状态**: ⏳ 待开始
- **描述**: 最终代码审查和优化
- **Commit**: -
- **Review**: -

---

## 验收标准

### 功能验收

- [ ] TodoForm 中可设置多个提醒时间
- [ ] TodoItem 上显示提醒状态图标
- [ ] 点击图标可快捷修改提醒
- [ ] Plan 表单和列表项支持提醒设置
- [ ] Target 表单和列表项支持提醒设置
- [ ] 自定义时间输入功能正常

### 质量验收

- [ ] 单元测试覆盖率 ≥ 90%
- [ ] TypeScript 无类型错误
- [ ] ESLint 无错误
- [ ] 构建成功

---

## 实现日志

| 时间       | 任务         | 状态 | 备注         |
| ---------- | ------------ | ---- | ------------ |
| 2026-03-10 | 创建进度文档 | ✅   | 开始实现流程 |
