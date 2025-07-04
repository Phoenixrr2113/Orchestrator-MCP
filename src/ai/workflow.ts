/**
 * Workflow automation engine
 * Refactored to use modular structure from alternative-plan.md
 */

import { AIClient } from './client.js';
import { IntelligentRouter } from './router.js';
import type { OrchestratorManager } from '../orchestrator/manager.js';
import { WorkflowEngine as ModularWorkflowEngine } from './workflow/engine.js';

// Re-export types from modular structure
export type { WorkflowStepResult, WorkflowContext } from './workflow/context.js';
export type { WorkflowExecutionResult, WorkflowExecutionOptions } from './workflow/engine.js';
export type { StepExecutionOptions } from './workflow/steps.js';
export type { RecoveryOptions } from './workflow/handlers.js';

/**
 * Workflow automation engine that orchestrates multi-step processes
 * @deprecated Use the modular WorkflowEngine from ./workflow/engine.js instead
 */
export class WorkflowEngine extends ModularWorkflowEngine {
  constructor(aiClient: AIClient, router: IntelligentRouter, orchestrator: OrchestratorManager) {
    super(aiClient, router, orchestrator);
  }
}