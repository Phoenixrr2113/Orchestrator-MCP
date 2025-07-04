/**
 * Result combination and enhancement
 * Extracted from ai/client.ts to match planned structure
 */

import type { AIClient } from './client.js';

/**
 * Tool execution result for synthesis
 */
export interface ToolExecutionResult {
  tool: string;
  result: any;
  success: boolean;
  error?: string;
}

/**
 * Synthesize results from multiple tools into a coherent response
 */
export async function synthesizeResults(
  aiClient: AIClient,
  originalRequest: string,
  toolResults: ToolExecutionResult[]
): Promise<string> {
  const synthesisPrompt = `
Original user request: "${originalRequest}"

Tool execution results:
${toolResults.map((result, index) => `
${index + 1}. Tool: ${result.tool}
   Success: ${result.success}
   ${result.success ? `Result: ${JSON.stringify(result.result, null, 2)}` : `Error: ${result.error}`}
`).join('\n')}

Please synthesize these results into a clear, helpful response for the user. Focus on:
1. Directly answering their original question
2. Highlighting key findings or insights
3. Explaining any errors or limitations
4. Suggesting next steps if appropriate

Provide a natural, conversational response that makes the technical results accessible.`;

  return aiClient.generateResponse(synthesisPrompt, {
    system: `You are an expert at synthesizing technical results into clear, user-friendly responses. 
    Make complex information accessible while maintaining accuracy. Be concise but comprehensive.`,
  });
}
