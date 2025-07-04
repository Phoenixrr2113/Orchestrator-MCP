/**
 * Workflow planning and execution
 * Extracted from ai/client.ts to match planned structure
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { AIClient } from './client.js';

/**
 * Workflow step definition
 */
export interface WorkflowStep {
  tool: string;
  action: string;
  parameters: Record<string, any>;
  reasoning: string;
}

/**
 * Workflow plan result
 */
export interface WorkflowPlan {
  steps: WorkflowStep[];
  expectedOutcome: string;
  estimatedComplexity: 'low' | 'medium' | 'high';
}

/**
 * Plan a multi-step workflow based on user intent
 */
export async function planWorkflow(
  aiClient: AIClient,
  intent: string,
  entities: Record<string, any>,
  availableTools: string[]
): Promise<WorkflowPlan> {
  const workflowPlanningTool = tool({
    description: 'Plan a multi-step workflow to accomplish the user intent',
    parameters: z.object({
      steps: z.array(z.object({
        tool: z.string().describe('The MCP tool to use for this step'),
        action: z.string().describe('The specific action or operation to perform'),
        parameters: z.record(z.any()).describe('Parameters needed for this step'),
        reasoning: z.string().describe('Why this step is necessary'),
      })).describe('Ordered list of steps to accomplish the goal'),
      expectedOutcome: z.string().describe('What the user should expect as the final result'),
      estimatedComplexity: z.enum(['low', 'medium', 'high']).describe('Complexity level of this workflow'),
    }),
    execute: async (params) => params,
  });

  const result = await aiClient.generateWithTools(
    `Plan a workflow to accomplish this intent: "${intent}" with entities: ${JSON.stringify(entities)}`,
    { planWorkflow: workflowPlanningTool },
    {
      system: `You are an expert workflow planner for a multi-tool orchestration system.

Available tools: ${availableTools.join(', ')}

Plan an efficient sequence of steps to accomplish the user's goal. Consider:
1. Dependencies between steps
2. Data flow from one step to the next
3. Error handling and validation
4. Optimal tool selection for each task

Always call the planWorkflow tool with your plan.`,
    }
  );

  // Extract the tool call result
  const toolCalls = result.toolCalls;
  if (toolCalls && toolCalls.length > 0) {
    const plan = toolCalls[0].args as any;
    return plan;
  }

  // Fallback if no tool call was made
  return {
    steps: [],
    expectedOutcome: 'Could not plan workflow',
    estimatedComplexity: 'low' as const,
  };
}
