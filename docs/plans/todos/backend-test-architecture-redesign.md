# 后端测试架构重构设计方案

> **版本**: v1.0  
> **类型**: 架构设计文档  
> **目标**: 解决后端代码无法在测试环境中覆盖的问题  
> **创建日期**: 2026-03-01

---

## 1. 背景与问题

### 1.1 当前问题

后端代码（`src/lib/api.ts` 等）通过 `@tauri-apps/api` 调用 Rust 后端，必须在 Tauri 环境中运行：

```typescript
// src/lib/api.ts
export async function getPlans(): Promise<Plan[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  return await invoke<Plan[]>("get_plans");
}
```

- 测试环境（非 Tauri）中 `isTauri()` 返回 `false`
- 导致所有 API 调用返回空数据/降级数据
- 后端代码被排除在覆盖率统计之外（vitest.config.ts）

### 1.2 当前测试覆盖情况

| 指标       | 前端    | 后端    |
| ---------- | ------- | ------- |
| 覆盖率统计 | ✅ 纳入 | ❌ 排除 |
| 测试数量   | 176     | 100+    |
| 可测试性   | 良好    | 差      |

---

## 2. 解决方案概述

### 2.1 核心思路

将业务逻辑从 Tauri API 调用中分离出来：

```
当前结构:
api.ts → 业务逻辑 + Tauri API 调用混合

目标结构:
api.ts           → Tauri API 包装层（保留，用于运行时）
services/        → 纯业务逻辑（可测试）
  - planService.ts
  - todoService.ts
  - circulationService.ts
  - validation.ts
```

### 2.2 预期收益

| 收益类型 | 说明                              |
| -------- | --------------------------------- |
| 可测试性 | 纯业务逻辑可在 Node.js 环境中测试 |
| 覆盖率   | 后端代码可纳入覆盖率统计          |
| 可维护性 | 关注点分离，代码更清晰            |
| 可复用性 | 业务逻辑可在多个场景复用          |

---

## 3. 重构设计方案

### 3.1 目录结构

```
src/
├── lib/
│   ├── api.ts                    # Tauri API 包装层（运行时）
│   ├── api.test.ts               # 保留，但简化为集成测试
│   │
│   └── services/                 # 新增：纯业务逻辑服务
│       ├── index.ts              # 导出入口
│       │
│       ├── planService.ts        # 计划相关业务逻辑
│       ├── planService.test.ts   # 单元测试
│       │
│       ├── todoService.ts        # 待办相关业务逻辑
│       ├── todoService.test.ts   # 单元测试
│       │
│       ├── circulationService.ts # 打卡相关业务逻辑
│       ├── circulationService.test.ts
│       │
│       ├── targetService.ts      # 目标相关业务逻辑
│       ├── targetService.test.ts
│       │
│       ├── milestoneService.ts   # 里程碑相关业务逻辑
│       ├── milestoneService.test.ts
│       │
│       └── validation.ts         # 通用验证逻辑
│           ├── validation.test.ts
│           ├── planValidation.ts
│           ├── todoValidation.ts
│           └── dateValidation.ts
```

### 3.2 服务层设计模式

每个 Service 包含：

```typescript
// 示例：planService.ts

// 1. 类型定义（可导出供外部使用）
export interface PlanInput {
  title: string;
  description?: string;
  targetId?: string;
  deadline?: string;
}

export interface PlanWithStats extends Plan {
  completedSteps: number;
  totalSteps: number;
  progress: number;
}

// 2. 纯业务逻辑函数（可测试）
export function validatePlan(input: PlanInput): ValidationResult {
  const errors: string[] = [];

  if (!input.title?.trim()) {
    errors.push("标题不能为空");
  }

  if (input.title && input.title.length > 100) {
    errors.push("标题不能超过100个字符");
  }

  if (input.deadline) {
    const deadline = new Date(input.deadline);
    if (isNaN(deadline.getTime())) {
      errors.push("截止日期格式无效");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculatePlanProgress(steps: Step[]): PlanProgress {
  if (!steps || steps.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const completed = steps.filter((s) => s.status === "completed").length;
  const total = steps.length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage };
}

export function sortPlansByDeadline(plans: Plan[]): Plan[] {
  return [...plans].sort((a, b) => {
    // 无截止日期的排最后
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

export function filterPlansByStatus(
  plans: Plan[],
  status: "all" | "active" | "completed",
): Plan[] {
  switch (status) {
    case "active":
      return plans.filter((p) => p.status !== "completed");
    case "completed":
      return plans.filter((p) => p.status === "completed");
    default:
      return plans;
  }
}

// 3. 数据转换函数（可测试）
export function transformPlanToDisplay(plan: Plan): PlanDisplay {
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description || "",
    status: plan.status,
    deadline: plan.deadline ? formatDate(plan.deadline) : null,
    progress: calculatePlanProgress(plan.steps || []),
    createdAt: formatDate(plan.createdAt),
    isOverdue: isOverdue(plan.deadline),
  };
}

// 4. 辅助函数（内部使用）
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("zh-CN");
}

function isOverdue(deadline?: string): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}
```

### 3.3 API 层重构

重构后的 API 层只负责 Tauri 调用：

```typescript
// src/lib/api.ts 重构后

import * as planService from "./services/planService";
import * as todoService from "./services/todoService";

// 导出服务层（供外部使用）
export { planService, todoService };

// Tauri API 调用（运行时使用）
export async function getPlans(): Promise<Plan[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  return await invoke<Plan[]>("get_plans");
}

// API 层组合服务层的结果
export async function getPlansWithStats(): Promise<PlanWithStats[]> {
  const plans = await getPlans();
  return plans.map((plan) => ({
    ...plan,
    ...planService.calculatePlanProgress(plan.steps || []),
  }));
}
```

---

## 4. 验证逻辑设计

### 4.1 通用验证器

```typescript
// src/lib/services/validation.ts

// 字符串验证
export function required(
  value: unknown,
  fieldName: string,
): ValidationError | null {
  if (value === null || value === undefined || value === "") {
    return { field: fieldName, message: `${fieldName}不能为空` };
  }
  return null;
}

export function maxLength(
  value: string,
  max: number,
  fieldName: string,
): ValidationError | null {
  if (value && value.length > max) {
    return { field: fieldName, message: `${fieldName}不能超过${max}个字符` };
  }
  return null;
}

// 日期验证
export function validDate(
  value: unknown,
  fieldName: string,
): ValidationError | null {
  if (!value) return null;
  const date = new Date(value as string);
  if (isNaN(date.getTime())) {
    return { field: fieldName, message: `${fieldName}日期格式无效` };
  }
  return null;
}

export function futureDate(
  value: unknown,
  fieldName: string,
): ValidationError | null {
  if (!value) return null;
  const date = new Date(value as string);
  if (date < new Date()) {
    return { field: fieldName, message: `${fieldName}必须是未来日期` };
  }
  return null;
}

// 数字验证
export function positiveNumber(
  value: unknown,
  fieldName: string,
): ValidationError | null {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return { field: fieldName, message: `${fieldName}必须是正数` };
  }
  return null;
}

// 组合验证器
export function validateField(
  value: unknown,
  fieldName: string,
  rules: ValidationRule[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const error = rule(value, fieldName);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}
```

### 4.2 领域特定验证

```typescript
// src/lib/services/planValidation.ts
import {
  validateField,
  required,
  maxLength,
  validDate,
  futureDate,
} from "./validation";

export function validatePlanInput(input: PlanInput): ValidationResult {
  const errors: ValidationError[] = [];

  // 标题验证
  errors.push(
    ...validateField(input.title, "标题", [
      required,
      (v) => maxLength(v as string, 100, "标题"),
    ]),
  );

  // 描述验证
  if (input.description) {
    errors.push(
      ...validateField(input.description, "描述", [
        (v) => maxLength(v as string, 500, "描述"),
      ]),
    );
  }

  // 截止日期验证
  if (input.deadline) {
    errors.push(...validateField(input.deadline, "截止日期", [validDate]));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## 5. 测试设计

### 5.1 单元测试示例

```typescript
// src/lib/services/planService.test.ts
import { describe, it, expect } from "vitest";
import {
  validatePlan,
  calculatePlanProgress,
  sortPlansByDeadline,
  filterPlansByStatus,
} from "./planService";

describe("planService", () => {
  describe("validatePlan", () => {
    it("should return error when title is empty", () => {
      const result = validatePlan({ title: "" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("标题不能为空");
    });

    it("should return error when title exceeds 100 characters", () => {
      const result = validatePlan({ title: "a".repeat(101) });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("标题不能超过100个字符");
    });

    it("should return valid for correct input", () => {
      const result = validatePlan({ title: "My Plan" });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate deadline format", () => {
      const result = validatePlan({ title: "Test", deadline: "invalid-date" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("截止日期格式无效");
    });
  });

  describe("calculatePlanProgress", () => {
    it("should return 0 for empty steps", () => {
      const result = calculatePlanProgress([]);
      expect(result.percentage).toBe(0);
    });

    it("should calculate correct percentage", () => {
      const steps = [
        { id: "1", status: "completed" },
        { id: "2", status: "pending" },
        { id: "3", status: "completed" },
        { id: "4", status: "pending" },
      ] as Step[];

      const result = calculatePlanProgress(steps);
      expect(result.completed).toBe(2);
      expect(result.total).toBe(4);
      expect(result.percentage).toBe(50);
    });
  });

  describe("sortPlansByDeadline", () => {
    it("should sort by deadline ascending", () => {
      const plans = [
        { id: "1", deadline: "2025-03-10" },
        { id: "2", deadline: "2025-03-01" },
        { id: "3", deadline: "2025-03-05" },
      ] as Plan[];

      const sorted = sortPlansByDeadline(plans);
      expect(sorted[0].id).toBe("2");
      expect(sorted[1].id).toBe("3");
      expect(sorted[2].id).toBe("1");
    });

    it("should put plans without deadline at end", () => {
      const plans = [
        { id: "1", deadline: "2025-03-10" },
        { id: "2", deadline: undefined },
        { id: "3", deadline: "2025-03-01" },
      ] as Plan[];

      const sorted = sortPlansByDeadline(plans);
      expect(sorted[0].id).toBe("3");
      expect(sorted[1].id).toBe("1");
      expect(sorted[2].id).toBe("2");
    });
  });
});
```

### 5.2 验证测试示例

```typescript
// src/lib/services/validation.test.ts
import { describe, it, expect } from "vitest";
import {
  required,
  maxLength,
  validDate,
  futureDate,
  positiveNumber,
} from "./validation";

describe("validation", () => {
  describe("required", () => {
    it("should return error for null", () => {
      expect(required(null, "name")).not.toBeNull();
    });

    it("should return error for undefined", () => {
      expect(required(undefined, "name")).not.toBeNull();
    });

    it("should return error for empty string", () => {
      expect(required("", "name")).not.toBeNull();
    });

    it("should return null for valid value", () => {
      expect(required("test", "name")).toBeNull();
    });
  });

  describe("validDate", () => {
    it("should return null for empty value", () => {
      expect(validDate(null, "date")).toBeNull();
    });

    it("should return error for invalid date", () => {
      expect(validDate("not-a-date", "date")).not.toBeNull();
    });

    it("should return null for valid date", () => {
      expect(validDate("2025-03-01", "date")).toBeNull();
    });
  });
});
```

---

## 6. 实施计划

### 6.1 阶段划分

| 阶段    | 任务                                        | 预估工作量 |
| ------- | ------------------------------------------- | ---------- |
| Phase 1 | 创建 services/ 目录结构                     | 0.5d       |
| Phase 2 | 抽取 validation.ts 通用验证                 | 1d         |
| Phase 3 | 抽取 planService.ts 计划服务                | 1.5d       |
| Phase 4 | 抽取 todoService.ts 待办服务                | 1.5d       |
| Phase 5 | 抽取其他服务 (circulation/target/milestone) | 2d         |
| Phase 6 | 重构 api.ts 集成服务层                      | 1d         |
| Phase 7 | 编写单元测试                                | 2d         |
| Phase 8 | 更新覆盖率配置                              | 0.5d       |

**总计预估**: 约 10 人日

### 6.2 实施顺序建议

1. **先易后难**: 先抽取通用验证逻辑，再处理业务逻辑
2. **逐个服务**: 一个服务一个服务地重构
3. **测试驱动**: 每个服务先写测试，再实现
4. **保持兼容**: API 层保持原有接口，内部调用服务层

---

## 7. 风险与注意事项

### 7.1 潜在风险

| 风险         | 影响     | 缓解措施             |
| ------------ | -------- | -------------------- |
| 工作量大     | 时间延期 | 分阶段实施           |
| 破坏现有功能 | 生产问题 | 充分测试，渐进式重构 |
| API 行为变化 | 回归     | 保留原有 API 接口    |

### 7.2 注意事项

- **保持向后兼容**: 现有调用方无需修改
- **渐进式重构**: 可以逐步迁移，不要求一次性完成
- **测试覆盖**: 新增代码必须有对应测试
- **文档注释**: 导出函数必须添加 JSDoc 注释

---

## 8. 验收标准

完成重构后应满足：

- [ ] 所有纯业务逻辑可在 Node.js 环境中测试
- [ ] 后端代码纳入覆盖率统计（目标 ≥90%）
- [ ] 现有 API 接口保持不变
- [ ] 每个服务模块有对应的单元测试
- [ ] 验证逻辑有完整测试覆盖
- [ ] 代码可通过 `npm run typecheck` 和 `npm run lint`

---

## 9. 相关文档

- [移动端UI适配修复设计文档](./2025-02-28-v0.5.6-mobile-ui-fix.md)
- [现有 API 文档](./api-design.md)
- [数据库 schema](./database-schema.md)

---

**文档版本**: v1.0  
**作者**: Claude  
**创建日期**: 2026-03-01
