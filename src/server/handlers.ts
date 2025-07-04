/**
 * Tool request handlers
 * Extracted from index.ts to match planned structure
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OrchestratorManager } from '../orchestrator/manager.js';
import { AIOrchestrator } from '../ai/orchestrator.js';
import { toolTracker } from '../ai/toolTracker.js';
import { createLogger } from '../utils/logging.js';
import { createErrorResponse } from '../utils/errors.js';

const logger = createLogger('tool-handlers');

/**
 * Setup tool listing handler
 */
export function setupToolListHandler(
  server: Server,
  orchestrator: OrchestratorManager
): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    try {
      // Get tools from all connected servers
      const allTools = await orchestrator.getAllTools();
      
      // Add orchestrator-specific tools
      const orchestratorTools = [
        {
          name: 'test_connection',
          description: 'Test that Orchestrator MCP is working and connected',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Test message to echo back',
                default: 'Hello from Orchestrator!',
              },
            },
          },
        },
        {
          name: 'get_info',
          description: 'Get information about the Orchestrator MCP server and connected servers',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'web_fetch',
          description: 'Fetch content from a web URL and return it as text',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The URL to fetch content from',
              },
            },
            required: ['url'],
          },
        },
        {
          name: 'ai_process',
          description: 'Process requests using AI-enhanced orchestration with intelligent tool routing and workflow automation',
          inputSchema: {
            type: 'object',
            properties: {
              request: {
                type: 'string',
                description: 'The request to process using AI orchestration',
              },
            },
            required: ['request'],
          },
        },
        {
          name: 'ai_status',
          description: 'Get the status of AI orchestration capabilities and connected servers',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'tool_usage_status',
          description: 'Get current tool usage tracking status and session information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'tool_usage_stats',
          description: 'Get comprehensive tool usage statistics and analytics',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'tool_usage_clear',
          description: 'Clear tool usage tracking history',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'analyze_codebase',
          description: 'Analyze codebase structure, complexity, patterns, and quality',
          inputSchema: {
            type: 'object',
            properties: {
              rootPath: {
                type: 'string',
                description: 'Root path of the codebase to analyze',
                default: '.',
              },
            },
          },
        },
        {
          name: 'extract_architectural_insights',
          description: 'Extract architectural insights from codebase analysis',
          inputSchema: {
            type: 'object',
            properties: {
              rootPath: {
                type: 'string',
                description: 'Root path of the codebase to analyze',
                default: '.',
              },
            },
          },
        },
        {
          name: 'assess_code_quality',
          description: 'Assess code quality across multiple dimensions with AI-powered analysis',
          inputSchema: {
            type: 'object',
            properties: {
              filePaths: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of file paths to analyze for quality',
                default: [],
              },
            },
          },
        },
        {
          name: 'analyze_architecture',
          description: 'Analyze system architecture and design patterns with AI-powered insights',
          inputSchema: {
            type: 'object',
            properties: {
              rootPath: {
                type: 'string',
                description: 'Root path of the codebase to analyze',
                default: '.',
              },
            },
          },
        },
        {
          name: 'detect_anti_patterns',
          description: 'Detect architectural anti-patterns and calculate risk scores',
          inputSchema: {
            type: 'object',
            properties: {
              rootPath: {
                type: 'string',
                description: 'Root path of the codebase to analyze',
                default: '.',
              },
            },
          },
        },
        {
          name: 'generate_architectural_roadmap',
          description: 'Generate architectural improvement roadmap with phases and tasks',
          inputSchema: {
            type: 'object',
            properties: {
              rootPath: {
                type: 'string',
                description: 'Root path of the codebase to analyze',
                default: '.',
              },
            },
          },
        },
      ];

      return {
        tools: [...orchestratorTools, ...allTools],
      };
    } catch (error) {
      logger.error('Failed to list tools', error as Error);
      return { tools: [] };
    }
  });
}

/**
 * Setup tool call handler
 */
export function setupToolCallHandler(
  server: Server,
  orchestrator: OrchestratorManager,
  aiOrchestrator: AIOrchestrator
): void {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    logger.debug('Tool call received', { tool: name, args });

    try {
      // Handle orchestrator-specific tools
      switch (name) {
        case 'test_connection':
          return handleTestConnection(args);
        
        case 'get_info':
          return handleGetInfo(orchestrator);
        
        case 'web_fetch':
          return handleWebFetch(args);
        
        case 'ai_process':
          return handleAIProcess(args, aiOrchestrator);
        
        case 'ai_status':
          return handleAIStatus(aiOrchestrator);
        
        case 'tool_usage_status':
          return handleToolUsageStatus();
        
        case 'tool_usage_stats':
          return handleToolUsageStats();
        
        case 'tool_usage_clear':
          return handleToolUsageClear();

        case 'analyze_codebase':
          return handleAnalyzeCodebase(args);

        case 'extract_architectural_insights':
          return handleExtractArchitecturalInsights(args);

        case 'assess_code_quality':
          return handleAssessCodeQuality(args);

        case 'analyze_architecture':
          return handleAnalyzeArchitecture(args);

        case 'detect_anti_patterns':
          return handleDetectAntiPatterns(args);

        case 'generate_architectural_roadmap':
          return handleGenerateArchitecturalRoadmap(args);

        default:
          // Try to delegate to connected servers
          return await orchestrator.callTool(name, args);
      }
    } catch (error) {
      logger.error('Tool execution failed', error as Error, { tool: name });
      return createErrorResponse(error);
    }
  });
}

// Individual tool handlers will be implemented in separate files
async function handleTestConnection(args: any) {
  return {
    content: [
      {
        type: 'text',
        text: `Orchestrator MCP is working! Echo: ${args.message || 'Hello from Orchestrator!'}`,
      },
    ],
  };
}

async function handleGetInfo(orchestrator: OrchestratorManager) {
  const serverInfo = await orchestrator.getServerInfo();
  return {
    content: [
      {
        type: 'text',
        text: `Orchestrator MCP Server Status:\n${JSON.stringify(serverInfo, null, 2)}`,
      },
    ],
  };
}

async function handleWebFetch(args: any) {
  // TODO: Implement web fetch functionality
  return {
    content: [
      {
        type: 'text',
        text: `Web fetch not yet implemented for URL: ${args.url}`,
      },
    ],
  };
}

async function handleAIProcess(args: any, aiOrchestrator: AIOrchestrator) {
  const result = await aiOrchestrator.processRequest(args.request);
  return {
    content: [
      {
        type: 'text',
        text: result.response,
      },
    ],
  };
}

async function handleAIStatus(aiOrchestrator: AIOrchestrator) {
  const status = aiOrchestrator.getStatus();
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(status, null, 2),
      },
    ],
  };
}

async function handleToolUsageStatus() {
  const currentSession = toolTracker.getCurrentSession();
  const status = {
    currentSession: currentSession ? {
      sessionId: currentSession.sessionId,
      userRequest: currentSession.userRequest,
      startTime: currentSession.startTime,
      executions: currentSession.executions.length,
      status: currentSession.status,
    } : null,
    totalSessions: toolTracker.getUsageStats().recentSessions.length,
    sessionHistory: toolTracker.getUsageStats().recentSessions.length,
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(status, null, 2),
      },
    ],
  };
}

async function handleToolUsageStats() {
  const stats = toolTracker.getUsageStats();
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(stats, null, 2),
      },
    ],
  };
}

async function handleToolUsageClear() {
  toolTracker.clearHistory();
  return {
    content: [
      {
        type: 'text',
        text: 'Tool tracking history cleared successfully.',
      },
    ],
  };
}

// Intelligence layer handlers
async function handleAnalyzeCodebase(args: any) {
  try {
    const { analyzeCodebase } = await import('../intelligence/codebase.js');
    const rootPath = args.rootPath || '.';

    logger.info(`Analyzing codebase at: ${rootPath}`);
    const analysis = await analyzeCodebase(rootPath);

    return {
      content: [
        {
          type: 'text',
          text: `Codebase Analysis Results:\n\n${JSON.stringify(analysis, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to analyze codebase:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error analyzing codebase: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

async function handleExtractArchitecturalInsights(args: any) {
  try {
    const { analyzeCodebase, extractArchitecturalInsights } = await import('../intelligence/codebase.js');
    const rootPath = args.rootPath || '.';

    logger.info(`Extracting architectural insights for: ${rootPath}`);

    // First analyze the codebase
    const analysis = await analyzeCodebase(rootPath);

    // Then extract insights
    const insights = await extractArchitecturalInsights(analysis);

    return {
      content: [
        {
          type: 'text',
          text: `Architectural Insights:\n\n${JSON.stringify(insights, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to extract architectural insights:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error extracting insights: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

async function handleAssessCodeQuality(args: any) {
  try {
    const { assessCodeQuality } = await import('../intelligence/quality.js');
    const filePaths = args.filePaths || [];

    logger.info(`Assessing code quality for ${filePaths.length} files`);
    const assessment = await assessCodeQuality(filePaths);

    return {
      content: [
        {
          type: 'text',
          text: `Code Quality Assessment:\n\n${JSON.stringify(assessment, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to assess code quality:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error assessing quality: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

async function handleAnalyzeArchitecture(args: any) {
  try {
    const { analyzeArchitecture } = await import('../intelligence/architecture.js');
    const rootPath = args.rootPath || '.';

    logger.info(`Analyzing architecture for: ${rootPath}`);
    const analysis = await analyzeArchitecture(rootPath);

    return {
      content: [
        {
          type: 'text',
          text: `Architecture Analysis:\n\n${JSON.stringify(analysis, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to analyze architecture:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error analyzing architecture: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

async function handleDetectAntiPatterns(args: any) {
  try {
    const { analyzeArchitecture, detectAntiPatterns } = await import('../intelligence/architecture.js');
    const rootPath = args.rootPath || '.';

    logger.info(`Detecting anti-patterns for: ${rootPath}`);

    // First analyze architecture
    const analysis = await analyzeArchitecture(rootPath);

    // Then detect anti-patterns
    const antiPatterns = await detectAntiPatterns(analysis);

    return {
      content: [
        {
          type: 'text',
          text: `Anti-Pattern Detection:\n\n${JSON.stringify(antiPatterns, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to detect anti-patterns:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error detecting anti-patterns: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

async function handleGenerateArchitecturalRoadmap(args: any) {
  try {
    const { analyzeArchitecture, generateArchitecturalRoadmap } = await import('../intelligence/architecture.js');
    const rootPath = args.rootPath || '.';

    logger.info(`Generating architectural roadmap for: ${rootPath}`);

    // First analyze architecture
    const analysis = await analyzeArchitecture(rootPath);

    // Then generate roadmap
    const roadmap = await generateArchitecturalRoadmap(analysis);

    return {
      content: [
        {
          type: 'text',
          text: `Architectural Roadmap:\n\n${JSON.stringify(roadmap, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to generate architectural roadmap:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error generating roadmap: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
