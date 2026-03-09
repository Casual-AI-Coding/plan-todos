/**
 * Unified logger utility
 * Checks environment at call time to support dynamic environment changes
 */
export const logger = {
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === "development") {
      console.error(`[ERROR] ${message}`, error);
    }
    // Production: can be extended to send to error monitoring service
  },

  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
};
