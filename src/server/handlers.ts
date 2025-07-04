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
