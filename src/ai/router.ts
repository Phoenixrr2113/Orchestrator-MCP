import { AIClient } from './client.js';
import type { ConnectedServer } from '../orchestrator/manager.js';
import { createLogger } from '../utils/logging.js';

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
    const currentWorkingDirectory = process.cwd();
    const toolSelectionPrompt = `
CONTEXT:
- Current Working Directory: ${currentWorkingDirectory}
- Available MCP Servers: ${toolCatalog.map(t => t.serverName).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
- Total Available Tools: ${toolCatalog.length}

USER REQUEST: "${userRequest}"

INTENT ANALYSIS:
- Intent: ${intentAnalysis.intent}
- Entities: ${JSON.stringify(intentAnalysis.entities)}
- Confidence: ${intentAnalysis.confidence}
- Suggested Tools: ${intentAnalysis.suggestedTools.join(', ')}

AVAILABLE TOOLS:
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
        system: `You are an expert tool orchestration system for an AI-enhanced MCP server.

Your role is to intelligently select and sequence tools to accomplish user goals efficiently.
This system serves as an AI assistant enhancement layer, so focus on:

1. **Efficiency**: Choose the most direct path to the user's goal
2. **Intelligence**: Understand the user's true intent, not just keywords
3. **Workflow Logic**: Consider dependencies and optimal sequencing
4. **Resource Optimization**: Minimize redundant operations
5. **Memory Usage**: ALWAYS use memory tools to store and retrieve context when relevant

IMPORTANT TOOL NAMING:
- Use EXACT tool names from the available tools list (e.g., "filesystem_read_file", "git_log", "memory_create_entity")
- Tool names follow the pattern: {server_name}_{tool_name}
- When working with files, ALWAYS provide full paths or relative paths from the current working directory
- For memory operations, store insights and context for future reference

Available tool categories:
- filesystem: File operations, code analysis, directory traversal (use full paths)
- git: Repository management, version control, change tracking
- memory: Persistent knowledge storage, context management (ALWAYS use for storing insights)
- fetch: Web content retrieval, document processing
- duckduckgo-search: Web search for current information
- github: Repository analysis, issue management, code review
- playwright: Browser automation, web testing, screenshots
- semgrep: Security analysis, vulnerability detection
- sequential-thinking: Complex reasoning, problem decomposition

Always respond with valid JSON in this format:
[
  {
    "selectedTool": "filesystem_read_file",
    "serverName": "filesystem",
    "confidence": 0.95,
    "reasoning": "This tool reads the specific file requested by the user",
    "alternativeTools": ["filesystem_list_directory", "git_show"],
    "parameters": {"path": "/full/path/to/file.ts"}
  },
  {
    "selectedTool": "memory_create_entity",
    "serverName": "memory",
    "confidence": 0.90,
    "reasoning": "Store the analysis results for future reference",
    "alternativeTools": ["memory_add_observation"],
    "parameters": {"name": "file_analysis", "entityType": "analysis", "observations": ["key insights"]}
  }
]

CRITICAL: Always include memory operations to store insights and context for future use.
Prioritize tools that provide the most value for the user's specific request.`,
        temperature: 0.2, // Lower temperature for more consistent tool selection
      });

      // Try to parse the JSON response
      try {
        const decisions = JSON.parse(response);
        return Array.isArray(decisions) ? decisions : [decisions];
      } catch (parseError) {
        logger.error('Failed to parse AI routing response', parseError as Error);
        logger.debug('Raw response', { response });

        // Fallback to simple tool matching
        return this.fallbackToolSelection(userRequest, toolCatalog);
      }
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
