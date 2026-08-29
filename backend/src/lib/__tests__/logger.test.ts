import { describe, it, expect, vi, beforeEach , afterEach} from "vitest";
import { Logger, LogContext } from "../logger.js";

describe("Logger", () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger("info");
    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Log Formatting", () => {
    it("should format info log with message and timestamp", () => {
      logger.info("Test message");

      expect(console.log).toHaveBeenCalled();
      const output = (console.log as any).mock.calls[0][0];
      expect(output).toContain("INFO");
      expect(output).toContain("Test message");
      expect(output).toMatch(/\d{4}-\d{2}-\d{2}T/); // ISO timestamp
    });

    it("should include context in log message", () => {
      const context: LogContext = {
        userId: "user-123",
        endpoint: "/api/test",
        statusCode: 200,
      };

      logger.info("Request completed", context);

      const output = (console.log as any).mock.calls[0][0];
      expect(output).toContain("userId=user-123");
      expect(output).toContain("endpoint=/api/test");
      expect(output).toContain("statusCode=200");
    });

    it("should format warning logs", () => {
      logger.warn("Warning message");

      expect(console.warn).toHaveBeenCalled();
      const output = (console.warn as any).mock.calls[0][0];
      expect(output).toContain("WARN");
      expect(output).toContain("Warning message");
    });

    it("should format error logs with error details", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error);

      expect(console.error).toHaveBeenCalled();
      const output = (console.error as any).mock.calls[0][0];
      expect(output).toContain("ERROR");
      expect(output).toContain("Error occurred");
      expect(output).toContain("Test error");
      expect(output).toContain("Stack:");
    });
  });

  describe("Log Levels", () => {
    it("should handle all log levels", () => {
      const context: LogContext = { userId: "test" };

      logger.info("info", context);
      logger.warn("warn", context);
      logger.error("error", new Error("test"));

      expect(console.log).toHaveBeenCalled(); // info
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it("should include error stack trace in error logs", () => {
      const error = new Error("Something went wrong");
      logger.error("Processing failed", error);

      const output = (console.error as any).mock.calls[0][0];
      expect(output).toContain("Stack:");
      expect(output).toContain("Something went wrong");
    });
  });

  describe("Context Handling", () => {
    it("should handle optional context", () => {
      logger.info("Message without context");
      const output = (console.log as any).mock.calls[0][0];

      expect(output).toContain("Message without context");
      expect(output).not.toContain("undefined");
    });

    it("should format multiple context properties", () => {
      const context: LogContext = {
        userId: "user-789",
        orderId: "order-456",
        productId: "prod-123",
        method: "POST",
        statusCode: 201,
        duration: 45,
      };

      logger.info("Complex request", context);

      const output = (console.log as any).mock.calls[0][0];
      expect(output).toContain("userId=user-789");
      expect(output).toContain("orderId=order-456");
      expect(output).toContain("productId=prod-123");
      expect(output).toContain("method=POST");
      expect(output).toContain("statusCode=201");
      expect(output).toContain("duration=45");
    });
  });

  describe("Error Handling", () => {
    it("should handle error objects in error method", () => {
      const customError = new Error("Custom error message");
      logger.error("Something failed", customError);

      expect(console.error).toHaveBeenCalled();
      const output = (console.error as any).mock.calls[0][0];
      expect(output).toContain("Custom error message");
    });

    it("should format error with context", () => {
      const error = new Error("Database connection failed");
      const context: LogContext = {
        endpoint: "/api/users",
        statusCode: 500,
      };

      logger.error("Request failed", error, context);

      const output = (console.error as any).mock.calls[0][0];
      expect(output).toContain("Request failed");
      expect(output).toContain("Database connection failed");
      expect(output).toContain("endpoint=/api/users");
      expect(output).toContain("statusCode=500");
    });
  });
});
