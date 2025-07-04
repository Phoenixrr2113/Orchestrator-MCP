/**
 * Error handling utilities
 * Standardized error types and handling for the orchestrator
 */

/**
 * Base orchestrator error
 */
export class OrchestratorError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'OrchestratorError';
  }
}

/**
 * Server connection error
 */
export class ServerConnectionError extends OrchestratorError {
  constructor(serverName: string, cause?: Error) {
    super(
      `Failed to connect to MCP server: ${serverName}`,
      'SERVER_CONNECTION_ERROR',
      { serverName, cause: cause?.message }
    );
    this.name = 'ServerConnectionError';
  }
}

/**
 * Tool execution error
 */
export class ToolExecutionError extends OrchestratorError {
  constructor(toolName: string, serverName: string, cause?: Error) {
    super(
      `Tool execution failed: ${toolName} on ${serverName}`,
      'TOOL_EXECUTION_ERROR',
      { toolName, serverName, cause: cause?.message }
    );
    this.name = 'ToolExecutionError';
  }
}

/**
 * AI processing error
 */
export class AIProcessingError extends OrchestratorError {
  constructor(operation: string, cause?: Error) {
    super(
      `AI processing failed: ${operation}`,
      'AI_PROCESSING_ERROR',
      { operation, cause: cause?.message }
    );
    this.name = 'AIProcessingError';
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends OrchestratorError {
  constructor(setting: string, reason: string) {
    super(
      `Configuration error: ${setting} - ${reason}`,
      'CONFIGURATION_ERROR',
      { setting, reason }
    );
    this.name = 'ConfigurationError';
  }
}

/**
 * Workflow execution error
 */
export class WorkflowExecutionError extends OrchestratorError {
  constructor(step: string, cause?: Error) {
    super(
      `Workflow execution failed at step: ${step}`,
      'WORKFLOW_EXECUTION_ERROR',
      { step, cause: cause?.message }
    );
    this.name = 'WorkflowExecutionError';
  }
}

/**
 * Check if error is an orchestrator error
 */
export function isOrchestratorError(error: unknown): error is OrchestratorError {
  return error instanceof OrchestratorError;
}

/**
 * Extract error details for logging
 */
export function extractErrorDetails(error: unknown): {
  message: string;
  code?: string;
  context?: Record<string, any>;
  stack?: string;
} {
  if (isOrchestratorError(error)) {
    return {
      message: error.message,
      code: error.code,
      context: error.context,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

/**
 * Check if error is retryable based on common patterns
 */
export function isRetryableError(error: unknown): boolean {
  const errorMessage = extractErrorDetails(error).message.toLowerCase();

  const retryablePatterns = [
    /timeout/i,
    /connection/i,
    /network/i,
    /temporary/i,
    /rate limit/i,
    /503/,
    /502/,
    /504/,
  ];

  return retryablePatterns.some(pattern => pattern.test(errorMessage));
}

/**
 * Categorize error type for better handling
 */
export function categorizeError(error: unknown): 'transient' | 'systematic' | 'configuration' | 'unknown' {
  const errorMessage = extractErrorDetails(error).message.toLowerCase();

  if (isRetryableError(error)) {
    return 'transient';
  }

  if (/configuration|auth|permission|credential/i.test(errorMessage)) {
    return 'configuration';
  }

  if (/validation|parameter|argument/i.test(errorMessage)) {
    return 'systematic';
  }

  return 'unknown';
}

/**
 * Create a safe error response for MCP
 */
export function createErrorResponse(error: unknown): {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
} {
  const details = extractErrorDetails(error);

  return {
    content: [
      {
        type: 'text',
        text: `Error: ${details.message}${details.code ? ` (${details.code})` : ''}`,
      },
    ],
    isError: true,
  };
}
