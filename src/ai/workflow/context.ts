/**
 * Context management across servers
 * Extracted from ai/workflow.ts to match planned structure
 */

import type { RoutingDecision } from '../router.js';

/**
 * Workflow step execution result
 */
export interface WorkflowStepResult {
  stepIndex: number;
  tool: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  metadata?: Record<string, any>;
}

/**
 * Workflow execution context
 */
export interface WorkflowContext {
  originalRequest: string;
  steps: RoutingDecision[];
  results: WorkflowStepResult[];
  variables: Record<string, any>;
  startTime: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
}

/**
 * Context manager for workflow execution
 */
export class WorkflowContextManager {
  /**
   * Create a new workflow context
   */
  createContext(originalRequest: string, steps: RoutingDecision[]): WorkflowContext {
    return {
      originalRequest,
      steps,
      results: [],
      variables: {},
      startTime: Date.now(),
      status: 'pending',
    };
  }

  /**
   * Update context status
   */
  updateStatus(context: WorkflowContext, status: WorkflowContext['status']): void {
    context.status = status;
  }

  /**
   * Add step result to context
   */
  addStepResult(context: WorkflowContext, result: WorkflowStepResult): void {
    context.results.push(result);
  }

  /**
   * Set context variable
   */
  setVariable(context: WorkflowContext, key: string, value: any): void {
    context.variables[key] = value;
  }

  /**
   * Get context variable
   */
  getVariable(context: WorkflowContext, key: string): any {
    return context.variables[key];
  }

  /**
   * Check if workflow is complete
   */
  isComplete(context: WorkflowContext): boolean {
    return context.results.length >= context.steps.length;
  }

  /**
   * Check if workflow has failed
   */
  hasFailed(context: WorkflowContext): boolean {
    return context.status === 'failed' || 
           context.results.some(result => !result.success);
  }

  /**
   * Get workflow summary
   */
  getSummary(context: WorkflowContext): {
    totalSteps: number;
    completedSteps: number;
    successfulSteps: number;
    failedSteps: number;
    totalTime: number;
    status: string;
  } {
    const totalSteps = context.steps.length;
    const completedSteps = context.results.length;
    const successfulSteps = context.results.filter(r => r.success).length;
    const failedSteps = context.results.filter(r => !r.success).length;
    const totalTime = Date.now() - context.startTime;

    return {
      totalSteps,
      completedSteps,
      successfulSteps,
      failedSteps,
      totalTime,
      status: context.status,
    };
  }

  /**
   * Extract data from previous steps for use in subsequent steps
   */
  extractStepData(context: WorkflowContext, stepIndex?: number): Record<string, any> {
    const relevantResults = stepIndex !== undefined 
      ? context.results.slice(0, stepIndex)
      : context.results;

    const extractedData: Record<string, any> = {};
    
    relevantResults.forEach((result, index) => {
      if (result.success && result.result) {
        extractedData[`step_${index}_result`] = result.result;
        extractedData[`${result.tool}_result`] = result.result;
      }
    });

    return { ...extractedData, ...context.variables };
  }
}
