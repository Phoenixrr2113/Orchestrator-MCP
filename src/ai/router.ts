import { AIClient } from './client.js';
import type { ConnectedServer } from '../orchestrator/manager.js';
import { createLogger } from '../utils/logging.js';
import { z } from 'zod';

/**
 * Tool routing decision with confidence and reasoning
 */
export interface RoutingDecision {
  selectedTool: string;
  serverName: string;
  confidence: number;
  reasoning: string;
  parameters: Record<string, any>;
}

const logger = createLogger('intelligent-router');

/**
 * Intelligent router that uses AI to select the best tools for user requests
 */
export class IntelligentRouter {
  private aiClient: AIClient;

  constructor(aiClient: AIClient) {
    this.aiClient = aiClient;
  }

  /**
   * Get all available tools and let AI decide which ones to use
   */
  async routeRequest(
    userRequest: string,
    availableServers: Map<string, ConnectedServer>
  ): Promise<RoutingDecision[]> {
    // Get all available tools - no pre-filtering, let AI decide
    const toolCatalog = this.buildToolCatalog(availableServers);

    // Debug logging
    logger.info(`Built tool catalog with ${toolCatalog.length} tools`);
    logger.info(`Available servers: ${Array.from(availableServers.keys()).join(', ')}`);
    if (toolCatalog.length > 0) {
      logger.info(`Sample tools: ${toolCatalog.slice(0, 3).map(t => t.fullName).join(', ')}`);
    }

    // Let AI select the best tools from ALL available tools
    const routingDecisions = await this.selectOptimalTools(
      userRequest,
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

    logger.info(`Building tool catalog from ${availableServers.size} servers`);

    for (const [serverName, server] of availableServers) {
      logger.info(`Checking server ${serverName}: connected=${server.connected}, tools=${server.tools?.length || 0}`);

      if (!server.connected) {
        logger.warn(`Server ${serverName} is not connected, skipping`);
        continue;
      }

      if (!server.tools || server.tools.length === 0) {
        logger.warn(`Server ${serverName} has no tools available`);
        continue;
      }

      for (const tool of server.tools) {
        const fullName = `${serverName}_${tool.name}`;
        catalog.push({
          serverName,
          toolName: tool.name,
          fullName,
          description: tool.description || 'No description available',
          inputSchema: tool.inputSchema || {},
          capabilities: this.extractCapabilities(serverName, tool.name, tool.description),
        });
        logger.debug(`Added tool: ${fullName}`);
      }
    }

    logger.info(`Built catalog with ${catalog.length} tools total`);

    if (catalog.length === 0) {
      logger.error('CRITICAL: Tool catalog is empty! This will cause AI routing to fail.');
      logger.error(`Available servers: ${Array.from(availableServers.keys()).join(', ')}`);
      for (const [name, server] of availableServers) {
        logger.error(`  ${name}: connected=${server.connected}, tools=${server.tools?.length || 0}`);
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
    toolCatalog: any[]
  ): Promise<RoutingDecision[]> {
    // Validate tool catalog
    if (!toolCatalog || toolCatalog.length === 0) {
      logger.error('Cannot select tools: tool catalog is empty');
      throw new Error('No tools available for selection. This may indicate a server initialization issue.');
    }
    // Define a simple, clear schema for routing decisions
    const routingDecisionSchema = z.object({
      selectedTool: z.string().describe("The exact tool name to use"),
      serverName: z.string().describe("The server that provides this tool"),
      confidence: z.number().min(0).max(1).describe("Confidence level 0-1"),
      reasoning: z.string().describe("Why this tool was selected"),
      parameters: z.record(z.any()).describe("Parameters to pass to the tool"),
    });

    // The AI consistently returns {input: [...]} format, so we need to handle that
    const routingDecisionsSchema = z.object({
      input: z.array(routingDecisionSchema).describe("Array of tool routing decisions")
    }).describe("Tool routing response with input array");

    try {
      // Debug logging
      logger.info(`Selecting tools for request: "${userRequest}"`);
      logger.info(`Tool catalog size: ${toolCatalog.length}`);

      // Use generateObject for structured output with a simple, clear prompt
      const result = await this.aiClient.generateObject({
        schema: routingDecisionsSchema,
        prompt: `Select the best tools to accomplish this user request: "${userRequest}"

AVAILABLE TOOLS:
${toolCatalog.map((tool, index) => `
${index + 1}. ${tool.fullName}
   Server: ${tool.serverName}
   Description: ${tool.description}
   Capabilities: ${tool.capabilities.join(', ')}
   Schema: ${JSON.stringify(tool.inputSchema, null, 2)}
`).join('\n')}

Select 1-3 tools that would best accomplish the user's goal. For each tool, provide:
- selectedTool: exact tool name (e.g., "filesystem_list_directory")
- serverName: the server providing the tool (e.g., "filesystem")
- confidence: how confident you are (0.0 to 1.0)
- reasoning: why you chose this tool
- parameters: any parameters the tool needs (use {} if none)`,
        system: `You are a tool selection expert. Your job is to pick the right tools for user requests.

Rules:
1. Use exact tool names from the list above
2. Choose tools that directly solve the user's problem
3. Be confident in your selections
4. Provide clear reasoning
5. Keep it simple and focused
6. You have access to ALL tools - choose the best ones for the task`,
        temperature: 0.1, // Very low temperature for consistent tool selection
      });

      // Return the array of routing decisions from the input property
      return result.object.input;
    } catch (error) {
      logger.error('AI routing failed', error as Error);
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
        logger.warn(`Server ${decision.serverName} is not available`);
        return false;
      }

      const toolExists = server.tools.some(tool =>
        `${decision.serverName}_${tool.name}` === decision.selectedTool
      );

      if (!toolExists) {
        logger.warn(`Tool ${decision.selectedTool} not found on server ${decision.serverName}`);
        return false;
      }

      return true;
    });
  }
}
