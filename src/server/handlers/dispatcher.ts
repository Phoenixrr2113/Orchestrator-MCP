/**
 * Tool call dispatcher
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OrchestratorManager } from '../../orchestrator/manager.js';
import { AIOrchestrator } from '../../ai/orchestrator.js';

import { createLogger, createErrorResponse } from '../../utils/index.js';

// Import handlers for streamlined tool set
import {
  handleGetInfo,
  handleAIProcess,
  handleAIStatus
} from './orchestrator.js';

const logger = createLogger('tool-dispatcher');

/**
 * Setup tool call handler with proper routing
 */
export function setupToolCallHandler(
  server: Server,
  orchestrator: OrchestratorManager,
  aiOrchestrator: AIOrchestrator
): void {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      logger.info(`Handling tool call: ${name}`);
      
      // Route to streamlined tool handlers
      switch (name) {
        case 'ai_process':
          return handleAIProcess(args, aiOrchestrator);

        case 'get_info':
          return handleGetInfo(orchestrator);

        case 'ai_status':
          return handleAIStatus(aiOrchestrator);

        // Context engine tools removed

        default:
          // Try to delegate to connected servers
          return await orchestrator.callTool(name, args);
      }
    } catch (error) {
      logger.error(`Error handling tool call ${name}:`, error as Error);
      return createErrorResponse(error as Error);
    }
  });
}
