/**
 * Tag Types
 *
 * Type definitions for Tag entity.
 * Tags are used to categorize and label various entities.
 */

/**
 * Tag - 标签
 * Represents a tag that can be attached to various entities.
 */
export interface Tag {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

/**
 * Parameters for creating a new Tag.
 */
export interface CreateTagParams {
  name: string;
  color?: string;
  description?: string;
}

/**
 * Parameters for updating an existing Tag.
 */
export interface UpdateTagParams {
  name?: string;
  color?: string;
  description?: string;
}
