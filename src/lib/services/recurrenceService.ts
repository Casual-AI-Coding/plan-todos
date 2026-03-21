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
  isBefore,
  isEqual,
} from "date-fns";
import type { Recurrence, Todo } from "@/lib/types/todo";

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
  // Check end conditions
  if (recurrence.maxOccurrences !== undefined) {
    if (currentIndex >= recurrence.maxOccurrences) {
      return null;
    }
  }

  let nextDate: Date;

  switch (recurrence.type) {
    case "daily":
      nextDate = addDays(currentDate, recurrence.interval);
      break;
    case "weekly":
      nextDate = addWeeks(currentDate, recurrence.interval);
      // Handle daysOfWeek for weekly recurrence
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        // Find the next day of week
        let attempts = 0;
        while (attempts < 7) {
          nextDate = addDays(nextDate, 1);
          const dayOfWeek = nextDate.getDay();
          if (recurrence.daysOfWeek.includes(dayOfWeek)) {
            break;
          }
          attempts++;
        }
      }
      break;
    case "monthly":
      nextDate = addMonths(currentDate, recurrence.interval);
      // Handle dayOfMonth for monthly recurrence
      if (recurrence.dayOfMonth !== undefined) {
        // Adjust to the specified day of month
        const targetDay = recurrence.dayOfMonth;
        const currentDay = nextDate.getDate();
        if (targetDay < currentDay) {
          // If target day has passed, the addMonths already moved to next month
          // Set to the target day
          nextDate.setDate(targetDay);
        } else if (targetDay !== currentDay) {
          nextDate.setDate(targetDay);
        }
      }
      break;
    case "yearly":
      nextDate = addYears(currentDate, recurrence.interval);
      break;
    case "custom":
      // For custom, use daily interval as default
      nextDate = addDays(currentDate, recurrence.interval);
      break;
    default:
      nextDate = addDays(currentDate, recurrence.interval);
  }

  // Check endDate condition
  if (recurrence.endDate) {
    const endDate = new Date(recurrence.endDate);
    if (isAfter(nextDate, endDate) || isEqual(nextDate, endDate)) {
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
