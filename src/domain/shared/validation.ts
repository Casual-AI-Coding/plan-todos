import { VALID_PRIORITIES, VALID_STATUSES } from "@/config/constants";
import { requiredMessage, maxLengthMessage, t } from "@/config/i18n";

export interface ValidationError {
  field: string;
  message: string;
}

export { VALID_PRIORITIES, VALID_STATUSES };

export function required(
  value: unknown,
  fieldName: string,
): ValidationError | null {
  if (value === null || value === undefined || value === "") {
    return { field: fieldName, message: requiredMessage(fieldName) };
  }
  if (typeof value === "string" && value.trim() === "") {
    return { field: fieldName, message: requiredMessage(fieldName) };
  }
  return null;
}

export function maxLength(
  value: string,
  max: number,
  fieldName: string,
): ValidationError | null {
  if (value && value.length > max) {
    return { field: fieldName, message: maxLengthMessage(fieldName, max) };
  }
  return null;
}

export function validatePriority(priority: string): ValidationError | null {
  if (
    !VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])
  ) {
    return { field: "priority", message: t.validation.invalidPriority };
  }
  return null;
}

export function validateStatus(status: string): ValidationError | null {
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return { field: "status", message: t.validation.invalidStatus };
  }
  return null;
}

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
