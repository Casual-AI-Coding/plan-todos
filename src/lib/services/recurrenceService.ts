/**
 * Recurrence Service
 *
 * Service for handling recurring todo calculations.
 */

import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isAfter,
  isEqual,
  isValid,
} from "date-fns";
import type { Recurrence, Todo } from "@/lib/types/todo";

// Valid days of week (0-6, 0 = Sunday)
const VALID_DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6];

/**
 * Validate recurrence configuration
 * @param recurrence - The recurrence configuration to validate
 * @returns True if valid, throws error if invalid
 */
export function validateRecurrence(recurrence: Recurrence): boolean {
  // Validate interval
  if (!Number.isInteger(recurrence.interval) || recurrence.interval < 1) {
    throw new Error("Interval must be a positive integer");
  }

  // Validate daysOfWeek for weekly recurrence
  if (recurrence.type === "weekly" && recurrence.daysOfWeek) {
    if (
      !Array.isArray(recurrence.daysOfWeek) ||
      recurrence.daysOfWeek.length === 0
    ) {
      throw new Error(
        "daysOfWeek must be a non-empty array for weekly recurrence",
      );
    }
    for (const day of recurrence.daysOfWeek) {
      if (!VALID_DAYS_OF_WEEK.includes(day)) {
        throw new Error(
          `Invalid day of week: ${day}. Must be 0-6 (Sunday-Saturday)`,
        );
      }
    }
    // Remove duplicates
    const uniqueDays = [...new Set(recurrence.daysOfWeek)];
    if (uniqueDays.length !== recurrence.daysOfWeek.length) {
      console.warn("Duplicate days in daysOfWeek will be ignored");
    }
  }

  // Validate dayOfMonth for monthly recurrence
  if (recurrence.type === "monthly" && recurrence.dayOfMonth !== undefined) {
    if (
      !Number.isInteger(recurrence.dayOfMonth) ||
      recurrence.dayOfMonth < 1 ||
      recurrence.dayOfMonth > 31
    ) {
      throw new Error("dayOfMonth must be an integer between 1 and 31");
    }
  }

  // Validate endDate
  if (recurrence.endDate) {
    const endDate = new Date(recurrence.endDate);
    if (!isValid(endDate)) {
      throw new Error("Invalid endDate format");
    }
  }

  // Validate maxOccurrences
  if (recurrence.maxOccurrences !== undefined) {
    if (
      !Number.isInteger(recurrence.maxOccurrences) ||
      recurrence.maxOccurrences < 1
    ) {
      throw new Error("maxOccurrences must be a positive integer");
    }
  }

  return true;
}

/**
 * Calculate the next due date based on recurrence configuration.
 * @param recurrence - The recurrence configuration
 * @param currentDate - The current due date
 * @param currentIndex - The current occurrence index
 * @returns The next due date, or null if recurrence has ended
 */
export function calculateNextDueDate(
  recurrence: Recurrence,
  currentDate: Date,
  currentIndex: number,
): Date | null {
  // Validate input date
  if (!isValid(currentDate)) {
    console.error("Invalid currentDate provided to calculateNextDueDate");
    return null;
  }

  // Check end conditions
  if (recurrence.maxOccurrences !== undefined) {
    if (currentIndex >= recurrence.maxOccurrences) {
      return null;
    }
  }

  let nextDate: Date;

  switch (recurrence.type) {
    case "daily":
      nextDate = addDays(currentDate, Math.max(1, recurrence.interval));
      break;
    case "weekly":
      nextDate = addWeeks(currentDate, Math.max(1, recurrence.interval));
      // Handle daysOfWeek for weekly recurrence
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        // Find the next day of week (max 7 days to search)
        let attempts = 0;
        while (attempts < 7) {
          nextDate = addDays(nextDate, 1);
          const dayOfWeek = nextDate.getDay();
          if (recurrence.daysOfWeek.includes(dayOfWeek)) {
            break;
          }
          attempts++;
        }
        // If no matching day found after 7 attempts, use the calculated date
        if (attempts >= 7) {
          console.warn(
            "Could not find matching day of week in weekly recurrence",
          );
        }
      }
      break;
    case "monthly":
      nextDate = addMonths(currentDate, Math.max(1, recurrence.interval));
      // Handle dayOfMonth for monthly recurrence
      if (recurrence.dayOfMonth !== undefined) {
        // Clamp to valid day (28 for February, 30/31 for others)
        const targetDay = Math.min(recurrence.dayOfMonth, 28);
        nextDate.setDate(targetDay);
      }
      break;
    case "yearly":
      nextDate = addYears(currentDate, Math.max(1, recurrence.interval));
      break;
    case "custom":
      // For custom, use daily interval as default
      nextDate = addDays(currentDate, Math.max(1, recurrence.interval));
      break;
    default:
      nextDate = addDays(currentDate, Math.max(1, recurrence.interval));
  }

  // Check endDate condition
  if (recurrence.endDate) {
    const endDate = new Date(recurrence.endDate);
    if (!isValid(endDate)) {
      console.warn("Invalid endDate in recurrence config");
    } else if (isAfter(nextDate, endDate) || isEqual(nextDate, endDate)) {
      return null;
    }
  }

  return nextDate;
}

/**
 * Check if a todo should create a next occurrence when completed.
 * @param todo - The todo to check
 * @returns Whether a next occurrence should be created
 */
export function shouldCreateNextOccurrence(todo: Todo): boolean {
  return !!todo.recurrence && todo.status === "done";
}

/**
 * Create the next occurrence of a recurring todo.
 * @param todo - The completed todo
 * @returns The next todo in the recurrence chain, or null if no more occurrences
 */
export function createNextOccurrence(todo: Todo): Partial<Todo> | null {
  if (!todo.recurrence || !todo.due_date) {
    return null;
  }

  const currentDate = new Date(todo.due_date);
  const nextIndex = (todo.recurrence_index ?? 0) + 1;

  const nextDueDate = calculateNextDueDate(
    todo.recurrence,
    currentDate,
    nextIndex,
  );

  if (!nextDueDate) {
    return null;
  }

  return {
    title: todo.title,
    content: todo.content,
    due_date: nextDueDate.toISOString(),
    status: "pending",
    priority: todo.priority,
    recurrence: todo.recurrence,
    recurrence_from: todo.recurrence_from ?? todo.id,
    recurrence_index: nextIndex,
  };
}

/**
 * Serialize recurrence config to JSON string for storage.
 * @param recurrence - The recurrence configuration
 * @returns JSON string
 */
export function serializeRecurrence(recurrence: Recurrence): string {
  return JSON.stringify(recurrence);
}

/**
 * Deserialize recurrence config from JSON string.
 * @param json - The JSON string
 * @returns The recurrence configuration
 */
export function deserializeRecurrence(json: string | null): Recurrence | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as Recurrence;
  } catch {
    return null;
  }
}

/**
 * Check if a recurrence has ended based on endDate or maxOccurrences.
 * @param recurrence - The recurrence configuration
 * @param currentIndex - The current occurrence index
 * @returns Whether the recurrence has ended
 */
export function hasRecurrenceEnded(
  recurrence: Recurrence,
  currentIndex: number,
): boolean {
  if (
    recurrence.maxOccurrences !== undefined &&
    currentIndex >= recurrence.maxOccurrences
  ) {
    return true;
  }
  if (recurrence.endDate) {
    const now = new Date();
    const endDate = new Date(recurrence.endDate);
    return isAfter(now, endDate) || isEqual(now, endDate);
  }
  return false;
}

/**
 * Format recurrence for display.
 * @param recurrence - The recurrence configuration
 * @returns Human-readable string describing the recurrence
 */
export function formatRecurrence(recurrence: Recurrence): string {
  const interval = recurrence.interval;

  switch (recurrence.type) {
    case "daily":
      return interval === 1 ? "Every day" : `Every ${interval} days`;
    case "weekly":
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days = recurrence.daysOfWeek.map((d) => dayNames[d]).join(", ");
        return interval === 1
          ? `Weekly on ${days}`
          : `Every ${interval} weeks on ${days}`;
      }
      return interval === 1 ? "Every week" : `Every ${interval} weeks`;
    case "monthly":
      if (recurrence.dayOfMonth !== undefined) {
        return interval === 1
          ? `Monthly on day ${recurrence.dayOfMonth}`
          : `Every ${interval} months on day ${recurrence.dayOfMonth}`;
      }
      return interval === 1 ? "Every month" : `Every ${interval} months`;
    case "yearly":
      return interval === 1 ? "Every year" : `Every ${interval} years`;
    case "custom":
      return `Every ${interval} days`;
    default:
      return "Unknown recurrence";
  }
}
