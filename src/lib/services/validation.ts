// src/lib/services/validation.ts
export interface ValidationError {
  field: string;
  message: string;
}

/** 有效优先级列表 */
export const VALID_PRIORITIES = ["P0", "P1", "P2", "P3"] as const;

/** 有效状态列表 */
export const VALID_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export function required(
  value: unknown,
  fieldName: string,
): ValidationError | null {
  if (value === null || value === undefined || value === "") {
    return { field: fieldName, message: `${fieldName}不能为空` };
  }
  // 检查纯空白字符串
  if (typeof value === "string" && value.trim() === "") {
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

export function validatePriority(priority: string): ValidationError | null {
  if (
    !VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])
  ) {
    return { field: "priority", message: "无效的优先级" };
  }
  return null;
}

export function validateStatus(status: string): ValidationError | null {
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return { field: "status", message: "无效的状态" };
  }
  return null;
}

/**
 * 领域验证器 - 执行部分验证
 * 注意：undefined 字段会被跳过，只验证提供的字段
 */
export function validateTodo(data: {
  title?: string;
  priority?: string;
  status?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.title !== undefined) {
    const titleError = required(data.title, "title");
    if (!titleError) {
      const lengthError = maxLength(data.title, 500, "title");
      if (lengthError) errors.push(lengthError);
    } else {
      errors.push(titleError);
    }
  }

  if (data.priority !== undefined) {
    const priorityError = validatePriority(data.priority);
    if (priorityError) errors.push(priorityError);
  }

  if (data.status !== undefined) {
    const statusError = validateStatus(data.status);
    if (statusError) errors.push(statusError);
  }

  return errors;
}
