// src/lib/services/validation.test.ts
import { describe, it, expect } from "vitest";
import {
  required,
  maxLength,
  validatePriority,
  validateStatus,
  validateTodo,
} from "./validation";

describe("validation", () => {
  describe("required", () => {
    it("should return error for null", () => {
      expect(required(null, "title")).toEqual({
        field: "title",
        message: "title不能为空",
      });
    });

    it("should return error for undefined", () => {
      expect(required(undefined, "title")).toEqual({
        field: "title",
        message: "title不能为空",
      });
    });

    it("should return error for empty string", () => {
      expect(required("", "title")).toEqual({
        field: "title",
        message: "title不能为空",
      });
    });

    it("should return null for valid value", () => {
      expect(required("test", "title")).toBeNull();
    });
  });

  describe("maxLength", () => {
    it("should return error when exceeding max length", () => {
      expect(maxLength("a".repeat(501), 500, "title")).toEqual({
        field: "title",
        message: "title不能超过500个字符",
      });
    });

    it("should return null for valid length", () => {
      expect(maxLength("a".repeat(500), 500, "title")).toBeNull();
    });
  });

  describe("validatePriority", () => {
    it("should return error for invalid priority", () => {
      expect(validatePriority("P5")).toEqual({
        field: "priority",
        message: "无效的优先级",
      });
    });

    it("should return null for valid priority", () => {
      expect(validatePriority("P1")).toBeNull();
    });
  });

  describe("validateStatus", () => {
    it("should return error for invalid status", () => {
      expect(validateStatus("invalid")).toEqual({
        field: "status",
        message: "无效的状态",
      });
    });

    it("should return null for valid status", () => {
      expect(validateStatus("pending")).toBeNull();
    });
  });

  describe("validateTodo", () => {
    it("should validate complete todo data", () => {
      const errors = validateTodo({
        title: "",
        priority: "P5",
        status: "invalid",
      });
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should return empty errors for valid todo", () => {
      const errors = validateTodo({
        title: "Test Todo",
        priority: "P1",
        status: "pending",
      });
      expect(errors).toEqual([]);
    });
  });
});
