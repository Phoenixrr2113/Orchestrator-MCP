/**
 * Core workflow execution engine
 * Extracted from ai/workflow.ts to match planned structure
 */

import { AIClient } from '../client.js';
import { IntelligentRouter, type RoutingDecision } from '../router.js';
import type { OrchestratorManager } from '../../orchestrator/manager.js';
import { WorkflowContextManager, type WorkflowContext } from './context.js';
import { WorkflowStepExecutor, type StepExecutionOptions } from './steps.js';
import { WorkflowFailureHandler, type RecoveryOptions } from './handlers.js';
import { synthesizeResults } from '../synthesis.js';
import { toolTracker } from '../toolTracker.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('workflow-engine');

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  success: boolean;
  finalResult: string;
  context: WorkflowContext;
  metadata: {
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
    executionTime: number;
    recoveryAttempts: number;
  };
}

/**
 * Workflow execution options
 */
export interface WorkflowExecutionOptions extends StepExecutionOptions {
  parallel?: boolean;
  concurrency?: number;
  failureStrategy?: RecoveryOptions;
  maxRecoveryAttempts?: number;
}

/**
 * Core workflow automation engine
 */
export class WorkflowEngine {
  private contextManager: WorkflowContextManager;
  private stepExecutor: WorkflowStepExecutor;
  private failureHandler: WorkflowFailureHandler;

  constructor(
    private aiClient: AIClient,
    private router: IntelligentRouter,
    private orchestrator: OrchestratorManager
  ) {
    this.contextManager = new WorkflowContextManager();
    this.stepExecutor = new WorkflowStepExecutor(orchestrator);
    this.failureHandler = new WorkflowFailureHandler();
  }

  /**
   * Execute a complete AI-driven workflow
   */
  async executeWorkflow(
    userRequest: string,
    options: WorkflowExecutionOptions = {}
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    let recoveryAttempts = 0;
    const maxRecoveryAttempts = options.maxRecoveryAttempts || 2;

    logger.info('Starting workflow execution', { request: userRequest });

    // Start tool tracking session
    const sessionId = toolTracker.startSession(userRequest);

    try {
      // Plan the workflow using AI
      const steps = await this.planWorkflow(userRequest);

      if (steps.length === 0) {
        throw new Error('No workflow steps could be planned for this request');
      }

      // Create execution context
      const context = this.contextManager.createContext(userRequest, steps);
      this.contextManager.updateStatus(context, 'running');

      // Execute workflow with recovery
      let executionResult = await this.executeWithRecovery(context, options);

      // Handle partial failures with recovery attempts
      while (!executionResult.success && recoveryAttempts < maxRecoveryAttempts) {
        recoveryAttempts++;
        logger.info('Attempting workflow recovery', { attempt: recoveryAttempts });

        const recoveryResult = await this.attemptRecovery(context, options);
        if (recoveryResult.canRecover) {
          executionResult = await this.executeWithRecovery(context, options);
        } else {
          break;
        }
      }

      // Generate final result
      const finalResult = await this.generateFinalResult(context, executionResult.success);
      
      // Update final status
      this.contextManager.updateStatus(
        context, 
        executionResult.success ? 'completed' : 'failed'
      );

      const summary = this.contextManager.getSummary(context);
      
      logger.info('Workflow execution completed', {
        success: executionResult.success,
        totalSteps: summary.totalSteps,
        successfulSteps: summary.successfulSteps,
        executionTime: summary.totalTime,
        recoveryAttempts
      });

      // End tool tracking session
      toolTracker.endSession(executionResult.success ? 'completed' : 'failed');

      return {
        success: executionResult.success,
        finalResult,
        context,
        metadata: {
          totalSteps: summary.totalSteps,
          successfulSteps: summary.successfulSteps,
          failedSteps: summary.failedSteps,
          executionTime: summary.totalTime,
          recoveryAttempts,
        },
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Workflow execution failed', error as Error, { executionTime });

      // End tool tracking session with failure
      toolTracker.endSession('failed');

      return {
        success: false,
        finalResult: `Workflow execution failed: ${error}`,
        context: this.contextManager.createContext(userRequest, []),
        metadata: {
          totalSteps: 0,
          successfulSteps: 0,
          failedSteps: 1,
          executionTime,
          recoveryAttempts,
        },
      };
    }
  }

  /**
   * Plan workflow steps using AI
   */
  private async planWorkflow(userRequest: string): Promise<RoutingDecision[]> {
    logger.debug('Planning workflow steps', { request: userRequest });

    try {
      // Use the intelligent router to plan the workflow
      const availableServers = this.orchestrator.getConnectedServers();
      const routingDecisions = await this.router.routeRequest(userRequest, availableServers);

      logger.debug('Workflow planned', {
        steps: routingDecisions.length,
        tools: routingDecisions.map(r => r.selectedTool)
      });

      return routingDecisions;
    } catch (error) {
      logger.error('Failed to plan workflow', error as Error);
      throw new Error(`Workflow planning failed: ${error}`);
    }
  }

  /**
   * Execute workflow with built-in recovery
   */
  private async executeWithRecovery(
    context: WorkflowContext,
    options: WorkflowExecutionOptions
  ): Promise<{ success: boolean; results: any[] }> {
    try {
      let results;

      if (options.parallel) {
        results = await this.stepExecutor.executeStepsParallel(
          context.steps,
          context,
          options
        );
      } else {
        results = await this.stepExecutor.executeSteps(
          context.steps,
          context,
          options
        );
      }

      const successfulResults = results.filter(r => r.success);
      const success = successfulResults.length === results.length;

      return { success, results: successfulResults.map(r => r.result) };

    } catch (error) {
      logger.error('Workflow execution error', error as Error);
      return { success: false, results: [] };
    }
  }

  /**
   * Attempt to recover from workflow failure
   */
  private async attemptRecovery(
    context: WorkflowContext,
    options: WorkflowExecutionOptions
  ): Promise<{ canRecover: boolean }> {
    logger.info('Attempting workflow recovery');

    try {
      const lastError = context.results
        .filter(r => !r.success)
        .pop()?.error;

      const recoveryResult = await this.failureHandler.handleWorkflowFailure(
        context,
        new Error(lastError || 'Unknown workflow failure')
      );

      if (recoveryResult.canRecover && recoveryResult.recoveryPlan) {
        // Apply recovery plan
        if (recoveryResult.recoveryPlan.restartFromStep !== undefined) {
          // Remove results from failed step onwards
          context.results = context.results.slice(0, recoveryResult.recoveryPlan.restartFromStep);
        }

        if (recoveryResult.recoveryPlan.modifiedSteps) {
          context.steps = recoveryResult.recoveryPlan.modifiedSteps;
        }

        if (recoveryResult.recoveryPlan.fallbackWorkflow) {
          context.steps = recoveryResult.recoveryPlan.fallbackWorkflow;
          context.results = []; // Start fresh with fallback workflow
        }

        return { canRecover: true };
      }

      return { canRecover: false };

    } catch (error) {
      logger.error('Recovery attempt failed', error as Error);
      return { canRecover: false };
    }
  }

  /**
   * Generate final result from workflow execution
   */
  private async generateFinalResult(
    context: WorkflowContext,
    success: boolean
  ): Promise<string> {
    try {
      if (success) {
        // Synthesize successful results
        const toolResults = context.results.map(result => ({
          tool: result.tool,
          result: result.result,
          success: result.success,
          error: result.error,
        }));

        return await synthesizeResults(this.aiClient, context.originalRequest, toolResults);
      } else {
        // Generate failure summary
        const failureSummary = this.failureHandler.generateFailureSummary(context);
        
        return `Workflow partially completed with ${failureSummary.successfulSteps}/${failureSummary.totalSteps} successful steps.\n\n` +
               `Failures: ${failureSummary.failureReasons.join(', ')}\n\n` +
               `Partial results available from successful steps.`;
      }
    } catch (error) {
      logger.error('Failed to generate final result', error as Error);
      return `Workflow completed but result synthesis failed: ${error}`;
    }
  }
}
