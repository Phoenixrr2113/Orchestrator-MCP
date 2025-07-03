import { AIClient, createAIClient } from './client.js';
import { IntelligentRouter } from './router.js';
import { WorkflowEngine } from './workflow.js';
import type { OrchestratorManager } from '../orchestrator/manager.js';

/**
 * AI-enhanced orchestration result
 */
export interface AIOrchestrationResult {
  success: boolean;
  response: string;
  metadata: {
    processingTime: number;
    toolsUsed: string[];
    confidence: number;
    workflowSteps: number;
    aiEnhanced: boolean;
  };
  rawResults?: any[];
  error?: string;
}

/**
 * AI Orchestration Layer - The intelligent brain of the MCP orchestrator
 */
export class AIOrchestrator {
  private aiClient!: AIClient;
  private router!: IntelligentRouter;
  private workflowEngine!: WorkflowEngine;
  private orchestratorManager: OrchestratorManager;
  private initialized: boolean = false;

  constructor(orchestratorManager: OrchestratorManager) {
    this.orchestratorManager = orchestratorManager;
  }

  /**
   * Initialize the AI orchestration layer
   */
  async initialize(): Promise<void> {
    try {
      console.error('🧠 Initializing AI Orchestration Layer...');
      
      // Create AI client
      this.aiClient = createAIClient();
      console.error('✅ AI Client initialized with OpenRouter');

      // Create intelligent router
      this.router = new IntelligentRouter(this.aiClient);
      console.error('✅ Intelligent Router initialized');

      // Create workflow engine
      this.workflowEngine = new WorkflowEngine(
        this.aiClient,
        this.router,
        this.orchestratorManager
      );
      console.error('✅ Workflow Engine initialized');

      this.initialized = true;
      console.error('🎉 AI Orchestration Layer ready!');

    } catch (error) {
      console.error('❌ Failed to initialize AI Orchestration Layer:', error);
      throw error;
    }
  }

  /**
   * Process a user request with AI-enhanced orchestration
   */
  async processRequest(userRequest: string): Promise<AIOrchestrationResult> {
    if (!this.initialized) {
      throw new Error('AI Orchestrator not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    console.error(`🤖 AI Processing: "${userRequest}"`);

    try {
      // Execute AI-driven workflow
      const workflowResult = await this.workflowEngine.executeWorkflow(userRequest);
      
      const processingTime = Date.now() - startTime;
      const toolsUsed = workflowResult.context.results.map(r => r.tool);
      const successfulSteps = workflowResult.context.results.filter(r => r.success).length;

      console.error(`🎯 AI Processing completed in ${processingTime}ms`);

      return {
        success: workflowResult.success,
        response: workflowResult.finalResult,
        metadata: {
          processingTime,
          toolsUsed,
          confidence: this.calculateOverallConfidence(workflowResult.context.steps),
          workflowSteps: workflowResult.context.results.length,
          aiEnhanced: true,
        },
        rawResults: workflowResult.context.results.map(r => r.result),
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error(`💥 AI Processing failed: ${errorMessage}`);

      return {
        success: false,
        response: `I encountered an error while processing your request: ${errorMessage}`,
        metadata: {
          processingTime,
          toolsUsed: [],
          confidence: 0,
          workflowSteps: 0,
          aiEnhanced: true,
        },
        error: errorMessage,
      };
    }
  }

  /**
   * Fallback to simple tool routing when AI is not available
   */
  async processRequestFallback(userRequest: string): Promise<AIOrchestrationResult> {
    const startTime = Date.now();
    console.error(`🔄 Fallback Processing: "${userRequest}"`);

    try {
      // Simple keyword-based tool selection
      const selectedTool = this.selectToolByKeywords(userRequest);
      
      if (!selectedTool) {
        throw new Error('No suitable tool found for this request');
      }

      // Execute the selected tool with basic parameters
      const result = await this.orchestratorManager.callTool(selectedTool, {});
      
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        response: this.formatFallbackResponse(result),
        metadata: {
          processingTime,
          toolsUsed: [selectedTool],
          confidence: 0.5, // Lower confidence for fallback
          workflowSteps: 1,
          aiEnhanced: false,
        },
        rawResults: [result],
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        response: `I couldn't process your request: ${errorMessage}`,
        metadata: {
          processingTime,
          toolsUsed: [],
          confidence: 0,
          workflowSteps: 0,
          aiEnhanced: false,
        },
        error: errorMessage,
      };
    }
  }

  /**
   * Check if AI orchestration is available
   */
  isAIAvailable(): boolean {
    return this.initialized && !!process.env.OPENROUTER_API_KEY;
  }

  /**
   * Get AI orchestration status and capabilities
   */
  getStatus(): {
    initialized: boolean;
    aiAvailable: boolean;
    capabilities: string[];
    connectedServers: number;
  } {
    const serverInfo = this.orchestratorManager.getServerInfo();
    const connectedServers = Object.values(serverInfo).filter((info: any) => info.connected).length;

    return {
      initialized: this.initialized,
      aiAvailable: this.isAIAvailable(),
      capabilities: [
        'intelligent_routing',
        'workflow_automation',
        'context_synthesis',
        'intent_understanding',
        'result_enhancement',
      ],
      connectedServers,
    };
  }

  /**
   * Calculate overall confidence from routing decisions
   */
  private calculateOverallConfidence(steps: any[]): number {
    if (steps.length === 0) return 0;
    
    const totalConfidence = steps.reduce((sum, step) => sum + (step.confidence || 0), 0);
    return totalConfidence / steps.length;
  }

  /**
   * Simple keyword-based tool selection for fallback
   */
  private selectToolByKeywords(userRequest: string): string | null {
    const lowerRequest = userRequest.toLowerCase();
    const serverInfo = this.orchestratorManager.getServerInfo();

    // Define keyword mappings
    const keywordMappings: Record<string, string[]> = {
      'filesystem': ['file', 'read', 'write', 'directory', 'folder', 'path'],
      'git': ['git', 'commit', 'repository', 'branch', 'version'],
      'memory': ['remember', 'store', 'knowledge', 'entity', 'relation'],
      'fetch': ['fetch', 'url', 'web', 'http', 'download'],
      'github': ['github', 'issue', 'pull request', 'pr', 'repo'],
      'playwright': ['browser', 'screenshot', 'navigate', 'click', 'automation'],
      'puppeteer': ['browser', 'screenshot', 'navigate', 'click', 'automation'],
      'sequential-thinking': ['think', 'analyze', 'reason', 'problem', 'solve'],
    };

    // Find the best matching server
    let bestMatch = '';
    let bestScore = 0;

    for (const [serverName, keywords] of Object.entries(keywordMappings)) {
      if (!serverInfo[serverName]?.connected) continue;

      const score = keywords.reduce((count, keyword) => {
        return count + (lowerRequest.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = serverName;
      }
    }

    if (bestMatch && serverInfo[bestMatch]?.tools?.length > 0) {
      // Return the first tool from the best matching server
      const firstTool = serverInfo[bestMatch].tools[0];
      return `${bestMatch}_${firstTool.name}`;
    }

    return null;
  }

  /**
   * Format fallback response
   */
  private formatFallbackResponse(result: any): string {
    if (!result || !result.content) {
      return 'Tool executed successfully but returned no content.';
    }

    if (Array.isArray(result.content)) {
      return result.content
        .map((item: any) => item.text || JSON.stringify(item))
        .join('\n');
    }

    return result.content.text || JSON.stringify(result.content);
  }

  /**
   * Test AI capabilities
   */
  async testAICapabilities(): Promise<{
    aiClient: boolean;
    router: boolean;
    workflow: boolean;
    overall: boolean;
  }> {
    const results = {
      aiClient: false,
      router: false,
      workflow: false,
      overall: false,
    };

    try {
      // Test AI client
      if (this.aiClient) {
        const testResponse = await this.aiClient.generateResponse('Hello, this is a test.');
        results.aiClient = testResponse.length > 0;
      }

      // Test router
      if (this.router && results.aiClient) {
        const testRouting = await this.router.routeRequest(
          'test request',
          this.orchestratorManager['servers']
        );
        results.router = Array.isArray(testRouting);
      }

      // Test workflow engine
      if (this.workflowEngine && results.router) {
        results.workflow = true; // Workflow engine is available if router works
      }

      results.overall = results.aiClient && results.router && results.workflow;

    } catch (error) {
      console.error('AI capability test failed:', error);
    }

    return results;
  }
}
