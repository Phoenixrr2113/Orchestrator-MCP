/**
 * Tool listing handlers
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OrchestratorManager } from '../../orchestrator/manager.js';
import { createLogger } from '../../utils/logging.js';

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
          name: 'ai_process',
          description: 'Process requests using AI orchestration with intelligent tool selection',
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
          name: 'tool_usage_stats',
          description: 'Get statistics about tool usage and performance',
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

      // Get tools from all connected servers
      const serverTools = await orchestrator.getAllTools();
      
      // Combine all tools
      const combinedTools = [...orchestratorTools, ...serverTools];
      
      logger.info(`Returning ${combinedTools.length} total tools (${orchestratorTools.length} orchestrator + ${serverTools.length} server tools)`);
      
      return {
        tools: combinedTools,
      };
    } catch (error) {
      logger.error('Failed to list tools:', error as Error);
      return {
        tools: [],
      };
    }
  });
}
