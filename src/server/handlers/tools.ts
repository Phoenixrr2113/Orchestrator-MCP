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
      // Streamlined tools focused on AI enhancement capabilities
      // Each tool provides unique value that enhances AI assistant capabilities
      const orchestratorTools = [
        {
          name: 'ai_process',
          description: 'Primary AI orchestration interface - intelligently processes complex requests by automatically selecting and coordinating multiple tools. Handles file operations, git management, web search, web fetching, browser automation, security analysis, and more. Describe your goal naturally - the AI will determine the best approach and execute multi-step workflows.',
          inputSchema: {
            type: 'object',
            properties: {
              request: {
                type: 'string',
                description: 'Natural language description of what you want to accomplish. Examples: "Search for React 19 features and analyze code examples", "Find all TypeScript files with TODO comments", "Check git status and create a summary of recent changes", "Fetch the latest Next.js documentation and extract routing information"',
              },
            },
            required: ['request'],
            additionalProperties: false,
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
        },
        {
          name: 'get_info',
          description: 'System introspection - discover available capabilities, connected servers, and tool inventory. Use this to understand what the orchestrator can do before making complex requests.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
        },
        {
          name: 'ai_status',
          description: 'Health monitoring - check AI orchestration system status, model configuration, and capability testing results. Useful for debugging or verifying system readiness.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
            $schema: 'http://json-schema.org/draft-07/schema#',
          },
        },
      ];

      // Only return orchestrator tools - internal server tools are handled transparently
      logger.info(`Returning ${orchestratorTools.length} orchestrator tools`);

      return {
        tools: orchestratorTools,
      };
    } catch (error) {
      logger.error('Failed to list tools:', error as Error);
      return {
        tools: [],
      };
    }
  });
}
