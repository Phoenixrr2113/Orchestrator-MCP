/**
 * Error and failure handling
 * Extracted from ai/workflow.ts to match planned structure
 */

import type { WorkflowContext, WorkflowStepResult } from './context.js';
import type { RoutingDecision } from '../router.js';
import { createLogger } from '../../utils/logging.js';
import { WorkflowExecutionError } from '../../utils/errors.js';

const logger = createLogger('workflow-handlers');

/**
 * Failure handling strategy
 */
export type FailureStrategy = 
  | 'stop'           // Stop execution immediately
  | 'continue'       // Continue with remaining steps
  | 'retry'          // Retry the failed step
  | 'skip'           // Skip the failed step and continue
  | 'fallback';      // Use fallback step/tool

/**
 * Recovery options for failed steps
 */
export interface RecoveryOptions {
  strategy: FailureStrategy;
  maxRetries?: number;
  retryDelay?: number;
  fallbackTool?: string;
  fallbackParameters?: Record<string, any>;
  continueOnFailure?: boolean;
}

/**
 * Workflow failure handler
 */
export class WorkflowFailureHandler {
  /**
   * Handle step failure based on strategy
   */
  async handleStepFailure(
    failedStep: WorkflowStepResult,
    context: WorkflowContext,
    options: RecoveryOptions
  ): Promise<{
    shouldContinue: boolean;
    recoveryAction?: 'retry' | 'fallback' | 'skip';
    fallbackStep?: RoutingDecision;
  }> {
    logger.warn('Handling step failure', {
      step: failedStep.tool,
      strategy: options.strategy,
      error: failedStep.error
    });

    switch (options.strategy) {
      case 'stop':
        return { shouldContinue: false };

      case 'continue':
        return { shouldContinue: true };

      case 'retry':
        if (this.shouldRetry(failedStep, options)) {
          return { 
            shouldContinue: true, 
            recoveryAction: 'retry' 
          };
        }
        // Fall through to continue if max retries exceeded
        return { shouldContinue: options.continueOnFailure ?? false };

      case 'skip':
        logger.info('Skipping failed step', { step: failedStep.tool });
        return { shouldContinue: true, recoveryAction: 'skip' };

      case 'fallback':
        if (options.fallbackTool) {
          const fallbackStep: RoutingDecision = {
            selectedTool: options.fallbackTool,
            serverName: 'fallback',
            confidence: 0.5,
            reasoning: `Fallback for failed step: ${failedStep.tool}`,
            alternativeTools: [],
            parameters: options.fallbackParameters || {},
          };
          return { 
            shouldContinue: true, 
            recoveryAction: 'fallback',
            fallbackStep 
          };
        }
        return { shouldContinue: options.continueOnFailure ?? false };

      default:
        return { shouldContinue: false };
    }
  }

  /**
   * Handle workflow-level failures
   */
  async handleWorkflowFailure(
    context: WorkflowContext,
    error: Error
  ): Promise<{
    canRecover: boolean;
    recoveryPlan?: {
      restartFromStep?: number;
      modifiedSteps?: RoutingDecision[];
      fallbackWorkflow?: RoutingDecision[];
    };
  }> {
    logger.error('Handling workflow failure', error, {
      completedSteps: context.results.length,
      totalSteps: context.steps.length,
      status: context.status
    });

    // Analyze failure patterns
    const failureAnalysis = this.analyzeFailures(context);
    
    if (failureAnalysis.isRecoverable) {
      return {
        canRecover: true,
        recoveryPlan: await this.generateRecoveryPlan(context, failureAnalysis)
      };
    }

    return { canRecover: false };
  }

  /**
   * Generate partial failure summary
   */
  generateFailureSummary(context: WorkflowContext): {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    successfulSteps: number;
    failureReasons: string[];
    partialResults: any[];
  } {
    const failedResults = context.results.filter(r => !r.success);
    const successfulResults = context.results.filter(r => r.success);

    return {
      totalSteps: context.steps.length,
      completedSteps: context.results.length,
      failedSteps: failedResults.length,
      successfulSteps: successfulResults.length,
      failureReasons: failedResults.map(r => r.error || 'Unknown error'),
      partialResults: successfulResults.map(r => r.result),
    };
  }

  /**
   * Check if step should be retried
   */
  private shouldRetry(
    failedStep: WorkflowStepResult,
    options: RecoveryOptions
  ): boolean {
    const maxRetries = options.maxRetries || 3;
    const currentRetries = failedStep.metadata?.retryCount || 0;
    
    // Check if error is retryable
    const isRetryableError = this.isRetryableError(failedStep.error);
    
    return currentRetries < maxRetries && isRetryableError;
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(error?: string): boolean {
    if (!error) return false;

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

    return retryablePatterns.some(pattern => pattern.test(error));
  }

  /**
   * Analyze failure patterns in workflow
   */
  private analyzeFailures(context: WorkflowContext): {
    isRecoverable: boolean;
    failureType: 'transient' | 'systematic' | 'configuration' | 'unknown';
    affectedTools: string[];
    commonErrors: string[];
  } {
    const failedResults = context.results.filter(r => !r.success);
    const affectedTools = [...new Set(failedResults.map(r => r.tool))];
    const errors = failedResults.map(r => r.error || 'Unknown').filter(Boolean);
    const commonErrors = this.findCommonErrors(errors);

    // Determine failure type
    let failureType: 'transient' | 'systematic' | 'configuration' | 'unknown' = 'unknown';
    
    if (commonErrors.some(error => this.isRetryableError(error))) {
      failureType = 'transient';
    } else if (affectedTools.length === 1 && failedResults.length > 1) {
      failureType = 'systematic';
    } else if (errors.some(error => /configuration|auth|permission/i.test(error))) {
      failureType = 'configuration';
    }

    const isRecoverable = failureType === 'transient' || 
                         (failureType === 'systematic' && affectedTools.length < context.steps.length);

    return {
      isRecoverable,
      failureType,
      affectedTools,
      commonErrors,
    };
  }

  /**
   * Generate recovery plan for failed workflow
   */
  private async generateRecoveryPlan(
    context: WorkflowContext,
    analysis: ReturnType<typeof this.analyzeFailures>
  ): Promise<{
    restartFromStep?: number;
    modifiedSteps?: RoutingDecision[];
    fallbackWorkflow?: RoutingDecision[];
  }> {
    if (analysis.failureType === 'transient') {
      // For transient failures, restart from first failed step
      const firstFailedIndex = context.results.findIndex(r => !r.success);
      return { restartFromStep: firstFailedIndex };
    }

    if (analysis.failureType === 'systematic') {
      // For systematic failures, try to replace problematic tools
      const modifiedSteps = context.steps.map(step => {
        if (analysis.affectedTools.includes(step.selectedTool)) {
          // Try to find alternative tool
          return this.findAlternativeTool(step);
        }
        return step;
      });

      return { modifiedSteps };
    }

    return {};
  }

  /**
   * Find alternative tool for failed step
   */
  private findAlternativeTool(originalStep: RoutingDecision): RoutingDecision {
    // Simple fallback mapping - in practice this would be more sophisticated
    const fallbackMap: Record<string, string> = {
      'playwright': 'puppeteer',
      'puppeteer': 'playwright',
      'fetch': 'web_fetch',
      'web_fetch': 'fetch',
    };

    const fallbackTool = fallbackMap[originalStep.selectedTool];

    if (fallbackTool) {
      return {
        ...originalStep,
        selectedTool: fallbackTool,
        confidence: originalStep.confidence * 0.8, // Reduce confidence for fallback
        reasoning: `Fallback for ${originalStep.selectedTool}: ${originalStep.reasoning}`,
      };
    }

    return originalStep;
  }

  /**
   * Find common error patterns
   */
  private findCommonErrors(errors: string[]): string[] {
    const errorCounts = new Map<string, number>();
    
    errors.forEach(error => {
      const normalized = error.toLowerCase().trim();
      errorCounts.set(normalized, (errorCounts.get(normalized) || 0) + 1);
    });

    return Array.from(errorCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([error, _]) => error);
  }
}
