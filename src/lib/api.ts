/**
 * API Functions for Plan Todos Application
 *
 * @deprecated Import API functions from @/lib/api instead
 *
 * This file re-exports all API functions from the new api/ directory
 * for backward compatibility.
 */

// Re-export all API functions from new api directory
export * from "./api/index";

// Re-export types from types directory (for backward compatibility)
export * from "./types";

// Re-export services
export { services } from "./services";
