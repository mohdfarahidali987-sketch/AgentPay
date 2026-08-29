import { env } from "../config/env.js";

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  userId?: string;
  orderId?: string;
  productId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
}

/**
 * Structured logger for consistent logging across the app
 * Can be easily swapped with Winston or Pino
 */
export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = "info") {
    this.level = level;
  }

  private format(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context
      ? ` [${Object.entries(context)
          .map(([k, v]) => `${k}=${v}`)
          .join(" ")}]`
      : "";

    const errorStr = error
      ? `\n  Error: ${error.message}\n  Stack: ${error.stack}`
      : "";

    return `[${timestamp}] ${level.toUpperCase()}${contextStr}: ${message}${errorStr}`;
  }

  info(
    message: string,
    context?: LogContext
  ): void {
    console.log(this.format("info", message, context));
  }

  warn(
    message: string,
    context?: LogContext
  ): void {
    console.warn(
      this.format("warn", message, context)
    );
  }

  error(
    message: string,
    error?: Error,
    context?: LogContext
  ): void {
    console.error(
      this.format("error", message, context, error)
    );
  }

  debug(
    message: string,
    context?: LogContext
  ): void {
    if (env.NODE_ENV === "development") {
      console.log(
        this.format("debug", message, context)
      );
    }
  }
}

export const logger = new Logger();
