import { AIClient } from './client.js';
import { IntelligentRouter, type RoutingDecision } from './router.js';
import type { OrchestratorManager } from '../orchestrator/manager.js';

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
 * Workflow automation engine that orchestrates multi-step processes
 */
export class WorkflowEngine {
  private aiClient: AIClient;
  private router: IntelligentRouter;
  private orchestrator: OrchestratorManager;

  constructor(aiClient: AIClient, router: IntelligentRouter, orchestrator: OrchestratorManager) {
    this.aiClient = aiClient;
    this.router = router;
    this.orchestrator = orchestrator;
  }

  /**
   * Execute a complete AI-driven workflow
   */
  async executeWorkflow(userRequest: string): Promise<{
    success: boolean;
    finalResult: string;
    context: WorkflowContext;
    executionSummary: string;
  }> {
    const startTime = Date.now();
    
    // Initialize workflow context
    const context: WorkflowContext = {
      originalRequest: userRequest,
      steps: [],
      results: [],
      variables: {},
      startTime,
      status: 'pending',
    };

    try {
      context.status = 'running';

      // Step 1: Route the request to appropriate tools
      console.error(`🤖 AI Workflow: Analyzing request and routing tools...`);
      const routingDecisions = await this.router.routeRequest(
        userRequest,
        this.orchestrator['servers'] // Access private member for routing
      );

      if (routingDecisions.length === 0) {
        throw new Error('No suitable tools found for this request');
      }

      context.steps = this.router.validateToolSelection(
        routingDecisions,
        this.orchestrator['servers']
      );

      console.error(`🎯 AI Workflow: Selected ${context.steps.length} tools for execution`);

      // Step 2: Execute tools in sequence with AI-driven adaptation
      for (let i = 0; i < context.steps.length; i++) {
        const step = context.steps[i];
        const stepStartTime = Date.now();

        console.error(`⚡ AI Workflow: Executing step ${i + 1}/${context.steps.length}: ${step.selectedTool}`);

        try {
          // Prepare parameters using AI if needed
          const parameters = await this.prepareStepParameters(step, context);
          
          // Execute the tool
          const result = await this.orchestrator.callTool(step.selectedTool, parameters);
          
          const stepResult: WorkflowStepResult = {
            stepIndex: i,
            tool: step.selectedTool,
            success: true,
            result,
            executionTime: Date.now() - stepStartTime,
            metadata: {
              confidence: step.confidence,
              reasoning: step.reasoning,
            },
          };

          context.results.push(stepResult);
          
          // Update context variables with results
          await this.updateContextVariables(context, stepResult);

          console.error(`✅ AI Workflow: Step ${i + 1} completed successfully`);

        } catch (error) {
          const stepResult: WorkflowStepResult = {
            stepIndex: i,
            tool: step.selectedTool,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            executionTime: Date.now() - stepStartTime,
            metadata: {
              confidence: step.confidence,
              reasoning: step.reasoning,
            },
          };

          context.results.push(stepResult);
          console.error(`❌ AI Workflow: Step ${i + 1} failed: ${stepResult.error}`);

          // Decide whether to continue or abort based on error severity
          const shouldContinue = await this.handleStepFailure(step, stepResult, context);
          if (!shouldContinue) {
            break;
          }
        }
      }

      // Step 3: Synthesize final result
      console.error(`🧠 AI Workflow: Synthesizing results...`);
      const finalResult = await this.aiClient.synthesizeResults(
        userRequest,
        context.results.map(r => ({
          tool: r.tool,
          result: r.result,
          success: r.success,
          error: r.error,
        }))
      );

      // Step 4: Generate execution summary
      const executionSummary = await this.generateExecutionSummary(context);

      context.status = 'completed';
      const totalTime = Date.now() - startTime;
      console.error(`🎉 AI Workflow: Completed in ${totalTime}ms`);

      return {
        success: true,
        finalResult,
        context,
        executionSummary,
      };

    } catch (error) {
      context.status = 'failed';
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`💥 AI Workflow: Failed - ${errorMessage}`);

      return {
        success: false,
        finalResult: `Workflow failed: ${errorMessage}`,
        context,
        executionSummary: `Workflow execution failed after ${context.results.length} steps: ${errorMessage}`,
      };
    }
  }

  /**
   * Prepare parameters for a workflow step using AI and context
   */
  private async prepareStepParameters(
    step: RoutingDecision,
    context: WorkflowContext
  ): Promise<Record<string, any>> {
    // Start with suggested parameters from routing
    let parameters = { ...step.parameters };

    // If parameters are empty or incomplete, use AI to generate them
    if (Object.keys(parameters).length === 0 || this.needsParameterEnhancement(parameters)) {
      const enhancedParams = await this.enhanceParametersWithAI(step, context);
      parameters = { ...parameters, ...enhancedParams };
    }

    // Substitute variables from context
    parameters = this.substituteContextVariables(parameters, context.variables);

    return parameters;
  }

  /**
   * Check if parameters need AI enhancement
   */
  private needsParameterEnhancement(parameters: Record<string, any>): boolean {
    // Check for placeholder values or empty required fields
    for (const [key, value] of Object.entries(parameters)) {
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'string' && value.startsWith('${') && value.endsWith('}'))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Use AI to enhance parameters based on context
   */
  private async enhanceParametersWithAI(
    step: RoutingDecision,
    context: WorkflowContext
  ): Promise<Record<string, any>> {
    const prompt = `
Original request: "${context.originalRequest}"
Current step: ${step.selectedTool}
Step reasoning: ${step.reasoning}

Previous results:
${context.results.map((r, i) => `
Step ${i + 1}: ${r.tool}
Success: ${r.success}
${r.success ? `Result: ${JSON.stringify(r.result, null, 2)}` : `Error: ${r.error}`}
`).join('\n')}

Context variables: ${JSON.stringify(context.variables, null, 2)}

Please generate appropriate parameters for the tool "${step.selectedTool}" based on:
1. The original user request
2. Previous step results
3. Available context variables

Return only a JSON object with the parameters, no additional text.`;

    try {
      const response = await this.aiClient.generateResponse(prompt, {
        system: `You are a parameter generation system. Generate appropriate parameters for MCP tools based on context.
        Always return valid JSON. Be specific and use actual values from the context when available.`,
        temperature: 0.3,
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to enhance parameters with AI:', error);
      return {};
    }
  }

  /**
   * Substitute context variables in parameters
   */
  private substituteContextVariables(
    parameters: Record<string, any>,
    variables: Record<string, any>
  ): Record<string, any> {
    const substituted = { ...parameters };

    for (const [key, value] of Object.entries(substituted)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const varName = value.slice(2, -1);
        if (variables[varName] !== undefined) {
          substituted[key] = variables[varName];
        }
      }
    }

    return substituted;
  }

  /**
   * Update context variables based on step results
   */
  private async updateContextVariables(
    context: WorkflowContext,
    stepResult: WorkflowStepResult
  ): Promise<void> {
    // Extract useful variables from the result
    if (stepResult.success && stepResult.result) {
      // Store the raw result
      context.variables[`step_${stepResult.stepIndex}_result`] = stepResult.result;

      // Extract specific values using AI
      try {
        const extractionPrompt = `
Extract useful variables from this tool result that might be needed for subsequent steps:

Tool: ${stepResult.tool}
Result: ${JSON.stringify(stepResult.result, null, 2)}

Return a JSON object with key-value pairs of extracted variables. 
Focus on IDs, paths, URLs, names, and other values that might be referenced later.
Use descriptive variable names.`;

        const response = await this.aiClient.generateResponse(extractionPrompt, {
          system: 'Extract useful variables from tool results. Return only valid JSON.',
          temperature: 0.2,
        });

        const extractedVars = JSON.parse(response);
        Object.assign(context.variables, extractedVars);
      } catch (error) {
        console.error('Failed to extract variables from step result:', error);
      }
    }
  }

  /**
   * Handle step failure and decide whether to continue
   */
  private async handleStepFailure(
    step: RoutingDecision,
    stepResult: WorkflowStepResult,
    context: WorkflowContext
  ): Promise<boolean> {
    // For now, continue on non-critical failures
    // In the future, this could use AI to make more intelligent decisions
    const criticalTools = ['filesystem_write_file', 'git_commit'];
    const isCritical = criticalTools.some(tool => step.selectedTool.includes(tool));
    
    if (isCritical) {
      console.error(`🛑 Critical step failed, aborting workflow`);
      return false;
    }

    console.error(`⚠️ Non-critical step failed, continuing workflow`);
    return true;
  }

  /**
   * Generate a comprehensive execution summary
   */
  private async generateExecutionSummary(context: WorkflowContext): Promise<string> {
    const successfulSteps = context.results.filter(r => r.success).length;
    const failedSteps = context.results.filter(r => !r.success).length;
    const totalTime = Date.now() - context.startTime;

    const summaryPrompt = `
Generate a concise execution summary for this AI workflow:

Original Request: "${context.originalRequest}"
Total Steps: ${context.results.length}
Successful Steps: ${successfulSteps}
Failed Steps: ${failedSteps}
Total Execution Time: ${totalTime}ms
Status: ${context.status}

Step Details:
${context.results.map((r, i) => `
${i + 1}. ${r.tool} (${r.executionTime}ms)
   Status: ${r.success ? '✅ Success' : '❌ Failed'}
   ${r.success ? 'Result available' : `Error: ${r.error}`}
`).join('\n')}

Provide a brief, informative summary of what was accomplished.`;

    try {
      return await this.aiClient.generateResponse(summaryPrompt, {
        system: 'Generate concise, informative workflow execution summaries.',
        temperature: 0.3,
      });
    } catch (error) {
      return `Workflow executed ${successfulSteps}/${context.results.length} steps successfully in ${totalTime}ms.`;
    }
  }
}
