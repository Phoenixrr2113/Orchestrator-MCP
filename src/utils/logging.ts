/**
 * Logging utilities
 * Centralized logging for the orchestrator system
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

/**
 * Simple logger for orchestrator operations
 */
export class Logger {
  private context: Record<string, any> = {};

  constructor(private component: string) {}

  /**
   * Add context to all log entries
   */
  withContext(context: Record<string, any>): Logger {
    const newLogger = new Logger(this.component);
    newLogger.context = { ...this.context, ...context };
    return newLogger;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, { ...context, error });
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: `[${this.component}] ${message}`,
      context: { ...this.context, ...context },
    };

    // Log to stderr to avoid interfering with MCP protocol
    const logMessage = this.formatLogEntry(entry);
    console.error(logMessage);
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const emoji = this.getLevelEmoji(entry.level);
    let message = `${emoji} ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      message += ` ${JSON.stringify(entry.context)}`;
    }
    
    return message;
  }

  /**
   * Get emoji for log level
   */
  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🔍';
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      default: return '📝';
    }
  }
}

/**
 * Create a logger for a specific component
 */
export function createLogger(component: string): Logger {
  return new Logger(component);
}
