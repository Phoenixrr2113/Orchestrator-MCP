import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, streamText } from 'ai';

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
   * @deprecated Use analyzeIntent from ai/intent.ts instead
   */
  async analyzeIntent(userRequest: string): Promise<{
    intent: string;
    entities: Record<string, any>;
    confidence: number;
    suggestedTools: string[];
    reasoning: string;
  }> {
    // Import the new modular function
    const { analyzeIntent } = await import('./intent.js');
    return analyzeIntent(this, userRequest);
  }

  /**
   * Plan a multi-step workflow based on user intent
   * @deprecated Use planWorkflow from ai/planning.ts instead
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
    // Import the new modular function
    const { planWorkflow } = await import('./planning.js');
    return planWorkflow(this, intent, entities, availableTools);
  }

  /**
   * Synthesize results from multiple tools into a coherent response
   * @deprecated Use synthesizeResults from ai/synthesis.ts instead
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
    // Import the new modular function
    const { synthesizeResults } = await import('./synthesis.js');
    return synthesizeResults(this, originalRequest, toolResults);
  }
}

/**
 * Create and configure AI client with environment variables
 * Environment variables should be provided by the MCP client configuration
 */
export function createAIClient(): AIClient {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY environment variable is required. ' +
      'Please configure it in your MCP client settings under the "env" section.'
    );
  }

  console.error(`🔑 Using OpenRouter API key: ${apiKey.substring(0, 10)}...`);

  return new AIClient({
    apiKey,
    defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet',
    maxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.7'),
  });
}
