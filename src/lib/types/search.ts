/**
 * Search Types
 *
 * Type definitions for Search functionality.
 */

/**
 * SearchResult - 搜索结果
 * Represents a single search result item.
 */
export interface SearchResult {
  entity_type: string;
  id: string;
  title: string;
  content: string | null;
  status: string;
}
