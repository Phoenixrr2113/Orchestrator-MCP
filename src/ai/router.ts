import { AIClient } from './client.js';
import type { ConnectedServer } from '../orchestrator/manager.js';

/**
 * Tool routing decision with confidence and reasoning
 */
export interface RoutingDecision {
  selectedTool: string;
  serverName: string;
  confidence: number;
  reasoning: string;
  alternativeTools: string[];
  parameters: Record<string, any>;
}

/**
 * Intelligent router that uses AI to select the best tools for user requests
 */
export class IntelligentRouter {
  private aiClient: AIClient;

  constructor(aiClient: AIClient) {
    this.aiClient = aiClient;
  }

  /**
   * Analyze available tools and select the best one for a user request
   */
  async routeRequest(
    userRequest: string,
    availableServers: Map<string, ConnectedServer>
  ): Promise<RoutingDecision[]> {
    // First, analyze the user's intent
    const intentAnalysis = await this.aiClient.analyzeIntent(userRequest);
    
    // Get all available tools with their descriptions
    const toolCatalog = this.buildToolCatalog(availableServers);
    
    // Use AI to select the best tools
    const routingDecisions = await this.selectOptimalTools(
      userRequest,
      intentAnalysis,
      toolCatalog
    );

    return routingDecisions;
  }

  /**
   * Build a comprehensive catalog of available tools
   */
  private buildToolCatalog(availableServers: Map<string, ConnectedServer>): Array<{
    serverName: string;
    toolName: string;
    fullName: string;
    description: string;
    inputSchema: any;
    capabilities: string[];
  }> {
    const catalog: Array<{
      serverName: string;
      toolName: string;
      fullName: string;
      description: string;
      inputSchema: any;
      capabilities: string[];
    }> = [];

    for (const [serverName, server] of availableServers) {
      if (!server.connected) continue;

      for (const tool of server.tools) {
        catalog.push({
          serverName,
          toolName: tool.name,
          fullName: `${serverName}_${tool.name}`,
          description: tool.description || 'No description available',
          inputSchema: tool.inputSchema || {},
          capabilities: this.extractCapabilities(serverName, tool.name, tool.description),
        });
      }
    }

    return catalog;
  }

  /**
   * Extract capabilities from tool information
   */
  private extractCapabilities(serverName: string, toolName: string, description: string): string[] {
    const capabilities: string[] = [];

    // Server-based capabilities
    switch (serverName) {
      case 'filesystem':
        capabilities.push('file_operations', 'read_files', 'write_files', 'search_files');
        break;
      case 'git':
        capabilities.push('version_control', 'repository_management', 'commit_history');
        break;
      case 'memory':
        capabilities.push('knowledge_storage', 'entity_management', 'relationship_tracking');
        break;
      case 'fetch':
        capabilities.push('web_content', 'http_requests', 'data_retrieval');
        break;
      case 'github':
        capabilities.push('github_api', 'repository_management', 'issue_tracking', 'pull_requests');
        break;
      case 'playwright':
      case 'puppeteer':
        capabilities.push('browser_automation', 'web_testing', 'screenshot_capture', 'form_interaction');
        break;
      case 'sequential-thinking':
        capabilities.push('complex_reasoning', 'problem_solving', 'step_by_step_analysis');
        break;
      case 'brave-search':
      case 'duckduckgo-search':
      case 'tavily-search':
        capabilities.push('web_search', 'search_results', 'information_retrieval', 'real_time_data');
        break;
      case 'postgres':
      case 'sqlite':
        capabilities.push('database_access', 'sql_queries', 'data_analysis', 'schema_inspection');
        break;
      case 'leetcode':
        capabilities.push('coding_practice', 'algorithm_problems', 'programming_challenges');
        break;
      case 'context7':
        capabilities.push('documentation_access', 'library_information', 'code_references');
        break;
      case 'mastra-docs':
        capabilities.push('knowledge_base', 'documentation_search', 'technical_information');
        break;
    }

    // Tool-specific capabilities based on name and description
    const lowerDesc = description.toLowerCase();
    const lowerName = toolName.toLowerCase();

    if (lowerName.includes('read') || lowerDesc.includes('read')) {
      capabilities.push('read_operation');
    }
    if (lowerName.includes('write') || lowerDesc.includes('write')) {
      capabilities.push('write_operation');
    }
    if (lowerName.includes('search') || lowerDesc.includes('search')) {
      capabilities.push('search_operation');
    }
    if (lowerName.includes('list') || lowerDesc.includes('list')) {
      capabilities.push('list_operation');
    }
    if (lowerName.includes('create') || lowerDesc.includes('create')) {
      capabilities.push('create_operation');
    }
    if (lowerName.includes('delete') || lowerDesc.includes('delete')) {
      capabilities.push('delete_operation');
    }

    return [...new Set(capabilities)]; // Remove duplicates
  }

  /**
   * Use AI to select optimal tools for the request
   */
  private async selectOptimalTools(
    userRequest: string,
    intentAnalysis: any,
    toolCatalog: any[]
  ): Promise<RoutingDecision[]> {
    const toolSelectionPrompt = `
User Request: "${userRequest}"

Intent Analysis:
- Intent: ${intentAnalysis.intent}
- Entities: ${JSON.stringify(intentAnalysis.entities)}
- Confidence: ${intentAnalysis.confidence}
- Suggested Tools: ${intentAnalysis.suggestedTools.join(', ')}

Available Tools:
${toolCatalog.map((tool, index) => `
${index + 1}. ${tool.fullName}
   Server: ${tool.serverName}
   Description: ${tool.description}
   Capabilities: ${tool.capabilities.join(', ')}
   Schema: ${JSON.stringify(tool.inputSchema, null, 2)}
`).join('\n')}

Please analyze this request and select the most appropriate tools to accomplish the user's goal. Consider:
1. Tool capabilities vs. user needs
2. Logical sequence of operations
3. Data dependencies between tools
4. Efficiency and directness

For each selected tool, provide:
- Tool name (full name with server prefix)
- Confidence score (0-1)
- Reasoning for selection
- Suggested parameters based on user request
- Alternative tools that could also work

Return your analysis as a JSON array of tool selections.`;

    try {
      const response = await this.aiClient.generateResponse(toolSelectionPrompt, {
        system: `You are an expert tool selection system for a multi-server orchestration platform. 
        
Your job is to analyze user requests and select the most appropriate tools from the available catalog.
Be precise, efficient, and consider the logical flow of operations.

Always respond with valid JSON in this format:
[
  {
    "selectedTool": "server_toolname",
    "serverName": "server",
    "confidence": 0.95,
    "reasoning": "This tool is perfect because...",
    "alternativeTools": ["other_tool1", "other_tool2"],
    "parameters": {"param1": "value1"}
  }
]`,
        temperature: 0.3, // Lower temperature for more consistent tool selection
      });

      // Try to parse the JSON response
      try {
        const decisions = JSON.parse(response);
        return Array.isArray(decisions) ? decisions : [decisions];
      } catch (parseError) {
        console.error('Failed to parse AI routing response:', parseError);
        console.error('Raw response:', response);
        
        // Fallback to simple tool matching
        return this.fallbackToolSelection(userRequest, toolCatalog);
      }
    } catch (error) {
      console.error('AI routing failed:', error);
      return this.fallbackToolSelection(userRequest, toolCatalog);
    }
  }

  /**
   * Fallback tool selection using simple keyword matching
   */
  private fallbackToolSelection(
    userRequest: string,
    toolCatalog: any[]
  ): RoutingDecision[] {
    const lowerRequest = userRequest.toLowerCase();
    const matches: RoutingDecision[] = [];

    // Simple keyword-based matching
    for (const tool of toolCatalog) {
      let score = 0;
      const keywords = [
        ...tool.capabilities,
        tool.serverName,
        tool.toolName,
        ...tool.description.toLowerCase().split(' ')
      ];

      for (const keyword of keywords) {
        if (lowerRequest.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      if (score > 0) {
        matches.push({
          selectedTool: tool.fullName,
          serverName: tool.serverName,
          confidence: Math.min(score / 10, 0.8), // Cap at 0.8 for fallback
          reasoning: `Keyword match (score: ${score}) - fallback selection`,
          alternativeTools: [],
          parameters: {},
        });
      }
    }

    // Sort by confidence and return top matches
    return matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Return top 3 matches
  }

  /**
   * Validate that selected tools are actually available
   */
  validateToolSelection(
    decisions: RoutingDecision[],
    availableServers: Map<string, ConnectedServer>
  ): RoutingDecision[] {
    return decisions.filter(decision => {
      const server = availableServers.get(decision.serverName);
      if (!server || !server.connected) {
        console.warn(`Server ${decision.serverName} is not available`);
        return false;
      }

      const toolExists = server.tools.some(tool => 
        `${decision.serverName}_${tool.name}` === decision.selectedTool
      );
      
      if (!toolExists) {
        console.warn(`Tool ${decision.selectedTool} not found on server ${decision.serverName}`);
        return false;
      }

      return true;
    });
  }
}
