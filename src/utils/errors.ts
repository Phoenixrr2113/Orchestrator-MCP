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
