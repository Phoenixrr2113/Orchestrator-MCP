/**
 * Step execution logic
 * Extracted from ai/workflow.ts to match planned structure
 */

import type { RoutingDecision } from '../router.js';
import type { OrchestratorManager } from '../../orchestrator/manager.js';
import type { WorkflowStepResult, WorkflowContext } from './context.js';
import { toolTracker } from '../toolTracker.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('workflow-steps');

/**
 * Step execution options
 */
export interface StepExecutionOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  continueOnFailure?: boolean;
}

/**
 * Step executor for workflow automation
 */
export class WorkflowStepExecutor {
  constructor(private orchestrator: OrchestratorManager) {}

  /**
   * Execute a single workflow step
   */
  async executeStep(
    step: RoutingDecision,
    stepIndex: number,
    context: WorkflowContext,
    options: StepExecutionOptions = {}
  ): Promise<WorkflowStepResult> {
    const startTime = Date.now();
    
    logger.debug('Executing workflow step', {
      step: step.selectedTool,
      index: stepIndex,
      confidence: step.confidence
    });

    // Track tool execution
    const executionId = toolTracker.startToolExecution(step.selectedTool, step.parameters);

    try {
      // Prepare parameters with context data
      const enrichedParameters = this.enrichParameters(step.parameters, context);
      
      // Execute the tool with timeout, passing the execution ID to avoid duplicate tracking
      const result = await this.executeWithTimeout(
        step.selectedTool,
        enrichedParameters,
        options.timeout || 30000,
        executionId
      );

      const executionTime = Date.now() - startTime;

      // Mark execution as successful
      toolTracker.endToolExecution(executionId, true, result);

      logger.debug('Step executed successfully', {
        step: step.selectedTool,
        executionTime,
        resultSize: JSON.stringify(result).length
      });

      return {
        stepIndex,
        tool: step.selectedTool,
        success: true,
        result,
        executionTime,
        metadata: {
          confidence: step.confidence,
          reasoning: step.reasoning,
          parameters: enrichedParameters,
        },
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Mark execution as failed
      toolTracker.endToolExecution(executionId, false, undefined, errorMessage);

      logger.error('Step execution failed', error as Error, {
        step: step.selectedTool,
        executionTime
      });

      // Retry logic
      if (options.retryAttempts && options.retryAttempts > 0) {
        logger.info('Retrying step execution', {
          step: step.selectedTool,
          attemptsLeft: options.retryAttempts
        });
        
        if (options.retryDelay) {
          await this.delay(options.retryDelay);
        }
        
        return this.executeStep(step, stepIndex, context, {
          ...options,
          retryAttempts: options.retryAttempts - 1,
        });
      }

      return {
        stepIndex,
        tool: step.selectedTool,
        success: false,
        error: errorMessage,
        executionTime,
        metadata: {
          confidence: step.confidence,
          reasoning: step.reasoning,
          parameters: step.parameters,
        },
      };
    }
  }

  /**
   * Execute multiple steps in sequence
   */
  async executeSteps(
    steps: RoutingDecision[],
    context: WorkflowContext,
    options: StepExecutionOptions = {}
  ): Promise<WorkflowStepResult[]> {
    const results: WorkflowStepResult[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      logger.info('Executing workflow step', {
        step: i + 1,
        total: steps.length,
        tool: step.selectedTool
      });

      const result = await this.executeStep(step, i, context, options);
      results.push(result);

      // Update context with result
      context.results.push(result);

      // Check if we should continue on failure
      if (!result.success && !options.continueOnFailure) {
        logger.warn('Stopping workflow due to step failure', {
          failedStep: step.selectedTool,
          stepIndex: i
        });
        break;
      }

      // Add small delay between steps to avoid overwhelming servers
      if (i < steps.length - 1) {
        await this.delay(100);
      }
    }

    return results;
  }

  /**
   * Execute steps in parallel (with concurrency limit)
   */
  async executeStepsParallel(
    steps: RoutingDecision[],
    context: WorkflowContext,
    options: StepExecutionOptions & { concurrency?: number } = {}
  ): Promise<WorkflowStepResult[]> {
    const concurrency = options.concurrency || 3;
    const results: WorkflowStepResult[] = [];

    // Execute steps in batches
    for (let i = 0; i < steps.length; i += concurrency) {
      const batch = steps.slice(i, i + concurrency);
      
      logger.info('Executing workflow batch', { 
        batch: Math.floor(i / concurrency) + 1,
        batchSize: batch.length,
        totalSteps: steps.length 
      });

      const batchPromises = batch.map((step, batchIndex) =>
        this.executeStep(step, i + batchIndex, context, options)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, batchIndex) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          context.results.push(result.value);
        } else {
          const failedResult: WorkflowStepResult = {
            stepIndex: i + batchIndex,
            tool: batch[batchIndex].selectedTool,
            success: false,
            error: result.reason?.message || 'Unknown error',
            executionTime: 0,
          };
          results.push(failedResult);
          context.results.push(failedResult);
        }
      });
    }

    return results;
  }

  /**
   * Enrich parameters with context data
   */
  private enrichParameters(
    parameters: Record<string, any>,
    context: WorkflowContext
  ): Record<string, any> {
    const enriched = { ...parameters };

    // Replace template variables with context data
    const contextData = this.extractContextData(context);
    
    for (const [key, value] of Object.entries(enriched)) {
      if (typeof value === 'string' && value.includes('{{')) {
        enriched[key] = this.replaceTemplateVariables(value, contextData);
      }
    }

    return enriched;
  }

  /**
   * Extract relevant data from context for parameter enrichment
   */
  private extractContextData(context: WorkflowContext): Record<string, any> {
    const data: Record<string, any> = {
      originalRequest: context.originalRequest,
      ...context.variables,
    };

    // Add results from previous steps
    context.results.forEach((result, index) => {
      if (result.success && result.result) {
        data[`step_${index}_result`] = result.result;
        data[`${result.tool}_result`] = result.result;
      }
    });

    return data;
  }

  /**
   * Replace template variables in strings
   */
  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  /**
   * Execute tool with timeout
   */
  private async executeWithTimeout(
    tool: string,
    parameters: Record<string, any>,
    timeoutMs: number,
    executionId?: string
  ): Promise<any> {
    return Promise.race([
      this.orchestrator.callTool(tool, parameters, executionId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Tool execution timeout: ${tool}`)), timeoutMs)
      ),
    ]);
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
