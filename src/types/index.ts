/**
 * Shared types and interfaces
 * Common type definitions used across the orchestrator system
 */

// Re-export types from various modules for convenience
export type { EnhancedServerConfig } from '../config/servers.js';
export type { WorkflowDefinition, WorkflowStepDefinition } from '../config/workflows.js';
export type { WorkflowContext, WorkflowStepResult } from '../ai/workflow/context.js';
export type { WorkflowExecutionResult, WorkflowExecutionOptions } from '../ai/workflow/engine.js';
export type { IntentAnalysis } from '../ai/intent.js';
export type { WorkflowPlan } from '../ai/planning.js';
export type { ToolExecutionResult } from '../ai/synthesis.js';

/**
 * Common result wrapper for operations
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Tool execution metadata
 */
export interface ToolMetadata {
  executionTime: number;
  confidence?: number;
  reasoning?: string;
  retryCount?: number;
  sessionId?: string;
}

/**
 * Server connection status
 */
export interface ServerStatus {
  name: string;
  connected: boolean;
  toolCount: number;
  lastPing?: number;
  error?: string;
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  maxConcurrentTools: number;
  defaultTimeout: number;
  retryAttempts: number;
  enableAI: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * AI processing options
 */
export interface AIProcessingOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  enableFallback?: boolean;
}

/**
 * Tool execution context
 */
export interface ToolExecutionContext {
  sessionId: string;
  userRequest: string;
  previousResults: any[];
  variables: Record<string, any>;
  metadata: ToolMetadata;
}

/**
 * Workflow execution status
 */
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Tool execution status
 */
export type ToolExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Server runtime types
 */
export type ServerRuntime = 'npm' | 'uvx' | 'python' | 'node' | 'git' | 'local';

/**
 * Server categories
 */
export type ServerCategory = 'official' | 'community';

/**
 * Programming languages
 */
export type ProgrammingLanguage = 'typescript' | 'python' | 'rust' | 'go' | 'java' | 'csharp' | 'other';

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Common constants
 */
export const CONSTANTS = {
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRY_ATTEMPTS: 3,
  DEFAULT_CONCURRENCY: 3,
  SESSION_TIMEOUT: 300000, // 5 minutes
  MAX_SESSION_HISTORY: 50,
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  SERVER_CONNECTION_ERROR: 'SERVER_CONNECTION_ERROR',
  TOOL_EXECUTION_ERROR: 'TOOL_EXECUTION_ERROR',
  AI_PROCESSING_ERROR: 'AI_PROCESSING_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  WORKFLOW_EXECUTION_ERROR: 'WORKFLOW_EXECUTION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

/**
 * Tool execution priorities
 */
export enum ToolPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
}

/**
 * Workflow complexity levels
 */
export enum WorkflowComplexity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Type guards
 */
export function isOperationResult<T>(obj: any): obj is OperationResult<T> {
  return typeof obj === 'object' && obj !== null && 'success' in obj;
}

export function isServerStatus(obj: any): obj is ServerStatus {
  return typeof obj === 'object' && obj !== null && 
         'name' in obj && 'connected' in obj && 'toolCount' in obj;
}

export function isToolMetadata(obj: any): obj is ToolMetadata {
  return typeof obj === 'object' && obj !== null && 'executionTime' in obj;
}
