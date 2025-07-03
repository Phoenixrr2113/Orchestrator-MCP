import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, streamText, tool } from 'ai';
import { z } from 'zod';
import { config } from 'dotenv';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * AI Client configuration and setup for OpenRouter integration
 */
export interface AIClientConfig {
  apiKey: string;
  defaultModel: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * AI Client for intelligent orchestration and workflow automation
 */
export class AIClient {
  private openrouter: ReturnType<typeof createOpenRouter>;
  private config: AIClientConfig;

  constructor(config: AIClientConfig) {
    this.config = config;
    this.openrouter = createOpenRouter({
      apiKey: config.apiKey,
    });
  }

  /**
   * Get the configured OpenRouter model
   */
  getModel(modelName?: string): any {
    return this.openrouter.chat(modelName || this.config.defaultModel);
  }

  /**
   * Generate text response using AI
   */
  async generateResponse(
    prompt: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    }
  ): Promise<string> {
    const { text } = await generateText({
      model: this.getModel(options?.model),
      prompt,
      maxTokens: options?.maxTokens || this.config.maxTokens || 2000,
      temperature: options?.temperature || this.config.temperature || 0.7,
      system: options?.system,
    });

    return text;
  }

  /**
   * Stream text response using AI
   */
  async streamResponse(
    prompt: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    }
  ) {
    return streamText({
      model: this.getModel(options?.model),
      prompt,
      maxTokens: options?.maxTokens || this.config.maxTokens || 2000,
      temperature: options?.temperature || this.config.temperature || 0.7,
      system: options?.system,
    });
  }

  /**
   * Generate text with tools for complex reasoning
   */
  async generateWithTools(
    prompt: string,
    tools: Record<string, any>,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
      maxSteps?: number;
    }
  ) {
    return generateText({
      model: this.getModel(options?.model),
      prompt,
      tools,
      maxSteps: options?.maxSteps || 5,
      maxTokens: options?.maxTokens || this.config.maxTokens || 2000,
      temperature: options?.temperature || this.config.temperature || 0.7,
      system: options?.system,
    });
  }

  /**
   * Analyze user intent and extract structured information
   */
  async analyzeIntent(userRequest: string): Promise<{
    intent: string;
    entities: Record<string, any>;
    confidence: number;
    suggestedTools: string[];
    reasoning: string;
  }> {
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

    const result = await this.generateWithTools(
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

  /**
   * Plan a multi-step workflow based on user intent
   */
  async planWorkflow(
    intent: string,
    entities: Record<string, any>,
    availableTools: string[]
  ): Promise<{
    steps: Array<{
      tool: string;
      action: string;
      parameters: Record<string, any>;
      reasoning: string;
    }>;
    expectedOutcome: string;
    estimatedComplexity: 'low' | 'medium' | 'high';
  }> {
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

    const result = await this.generateWithTools(
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

  /**
   * Synthesize results from multiple tools into a coherent response
   */
  async synthesizeResults(
    originalRequest: string,
    toolResults: Array<{
      tool: string;
      result: any;
      success: boolean;
      error?: string;
    }>
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

    return this.generateResponse(synthesisPrompt, {
      system: `You are an expert at synthesizing technical results into clear, user-friendly responses. 
      Make complex information accessible while maintaining accuracy. Be concise but comprehensive.`,
    });
  }
}

/**
 * Create and configure AI client with environment variables
 */
export function createAIClient(): AIClient {
  // Explicitly load environment variables to ensure they're available
  try {
    // Get the current file's directory in ES modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Try to load from the project root directory
    const projectRoot = resolve(__dirname, '../..');
    const envPath = join(projectRoot, '.env');

    console.error(`🔍 Loading environment from: ${envPath}`);
    config({ path: envPath });
  } catch (error) {
    console.error('Warning: Could not load dotenv from specific path:', error);
    // Fallback to default dotenv behavior
    try {
      config();
    } catch (fallbackError) {
      console.error('Fallback dotenv loading also failed:', fallbackError);
    }
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is required. Please check your .env file.');
  }

  console.error(`🔑 Using OpenRouter API key: ${apiKey.substring(0, 10)}...`);

  return new AIClient({
    apiKey,
    defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet',
    maxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.7'),
  });
}
