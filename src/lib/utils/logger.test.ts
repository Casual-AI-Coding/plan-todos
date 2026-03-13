import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  const originalEnv = process.env.NODE_ENV;
  const consoleSpy = {
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
    debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
    info: vi.spyOn(console, "info").mockImplementation(() => {}),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    (process.env as { NODE_ENV: string }).NODE_ENV = originalEnv;
  });

  describe("in development environment", () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = "development";
    });

    it("should call console.warn with formatted message", () => {
      logger.warn("test warning");
      expect(consoleSpy.warn).toHaveBeenCalledWith("[WARN] test warning");
    });

    it("should call console.warn with extra args", () => {
      logger.warn("test warning", "arg1", "arg2");
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "[WARN] test warning",
        "arg1",
        "arg2",
      );
    });

    it("should call console.error with formatted message and error", () => {
      const error = new Error("test error");
      logger.error("error occurred", error);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[ERROR] error occurred",
        error,
      );
    });

    it("should call console.error without error parameter", () => {
      logger.error("error occurred");
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[ERROR] error occurred",
        undefined,
      );
    });

    it("should call console.debug with formatted message", () => {
      logger.debug("debug message");
      expect(consoleSpy.debug).toHaveBeenCalledWith("[DEBUG] debug message");
    });

    it("should call console.debug with extra args", () => {
      logger.debug("debug message", { key: "value" });
      expect(consoleSpy.debug).toHaveBeenCalledWith("[DEBUG] debug message", {
        key: "value",
      });
    });

    it("should call console.info with formatted message", () => {
      logger.info("info message");
      expect(consoleSpy.info).toHaveBeenCalledWith("[INFO] info message");
    });

    it("should call console.info with extra args", () => {
      logger.info("info message", 123, true);
      expect(consoleSpy.info).toHaveBeenCalledWith(
        "[INFO] info message",
        123,
        true,
      );
    });
  });

  describe("in production environment", () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = "production";
    });

    it("should NOT call console.warn", () => {
      logger.warn("test warning");
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it("should NOT call console.error", () => {
      logger.error("error occurred", new Error("test"));
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it("should NOT call console.debug", () => {
      logger.debug("debug message");
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it("should NOT call console.info", () => {
      logger.info("info message");
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });

  describe("in test environment", () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = "test";
    });

    it("should NOT call console methods in test environment", () => {
      logger.warn("test warning");
      logger.error("test error");
      logger.debug("test debug");
      logger.info("test info");

      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });
});
