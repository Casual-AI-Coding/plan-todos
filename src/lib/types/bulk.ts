/**
 * Bulk Operation Types
 *
 * Type definitions for batch operations.
 * Used for bulk updates and deletes.
 */

/**
 * BatchUpdateResult - 批量更新结果
 * Represents the result of a batch update operation.
 */
export interface BatchUpdateResult {
  updated: number;
  failed: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * BatchDeleteResult - 批量删除结果
 * Represents the result of a batch delete operation.
 */
export interface BatchDeleteResult {
  deleted: number;
  failed: Array<{
    id: string;
    error: string;
  }>;
}
