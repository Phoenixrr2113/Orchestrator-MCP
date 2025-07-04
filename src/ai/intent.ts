/**
 * User intent understanding
 * Extracted from ai/client.ts to match planned structure
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { AIClient } from './client.js';

/**
 * Intent analysis result
 */
export interface IntentAnalysis {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  suggestedTools: string[];
  reasoning: string;
}

/**
 * Analyze user intent and extract structured information
 */
export async function analyzeIntent(
  aiClient: AIClient,
  userRequest: string
): Promise<IntentAnalysis> {
  const intentAnalysisTool = tool({
    description: 'Analyze user intent and extract structured information',
    parameters: z.object({
      intent: z.string().describe('The primary intent or goal of the user request'),
      entities: z.record(z.any()).describe('Key entities, parameters, or data extracted from the request'),
      confidence: z.number().min(0).max(1).describe('Confidence score for the intent analysis'),
      suggestedTools: z.array(z.string()).describe('List of MCP tools that would be useful for this request'),
      reasoning: z.string().describe('Explanation of the analysis and tool suggestions'),
    }),
    execute: async (params) => params,
  });

  const result = await aiClient.generateWithTools(
    `Analyze this user request and extract structured intent information: "${userRequest}"`,
    { analyzeIntent: intentAnalysisTool },
    {
      system: `You are an expert at analyzing user requests for a multi-tool orchestration system. 
      
Available tool categories include:
- filesystem: File operations, reading, writing, searching files
- git: Version control operations, repository management
- memory: Knowledge graph storage, entities, relations
- fetch: Web content retrieval and processing
- github: GitHub API operations, repositories, issues, PRs
- playwright/puppeteer: Browser automation, web testing
- sequential-thinking: Complex reasoning and problem solving

Analyze the user's request and determine:
1. What they want to accomplish (intent)
2. What specific data or parameters they mentioned (entities)
3. Which tools would be most helpful
4. Your confidence in this analysis

Always call the analyzeIntent tool with your analysis.`,
    }
  );

  // Extract the tool call result
  const toolCalls = result.toolCalls;
  if (toolCalls && toolCalls.length > 0) {
    const analysis = toolCalls[0].args as any;
    return analysis;
  }

  // Fallback if no tool call was made
  return {
    intent: 'general_query',
    entities: {},
    confidence: 0.5,
    suggestedTools: [],
    reasoning: 'Could not analyze intent properly',
  };
}
