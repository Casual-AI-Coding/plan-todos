/**
 * API Exports
 *
 * Unified exports for all API modules.
 */

// Client utilities
export * from "./client";

// Entity APIs
export * from "./plans";
export * from "./tasks";
export * from "./targets";
export * from "./steps";
export * from "./todos";
export * from "./milestones";
export * from "./circulations";
export * from "./tags";

// Feature APIs
export * from "./search";
export * from "./dashboard";
export * from "./statistics";
export * from "./bulk";
export * from "./notifications";
export * from "./data";
export * from "./export";

// Window controls (also in original api.ts)
export {
  minimizeWindow,
  toggleMaximize,
  closeWindow,
  isMaximized,
} from "./window";
