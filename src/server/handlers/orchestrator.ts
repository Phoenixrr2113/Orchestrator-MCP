/**
 * Basic orchestrator handlers
 */

import { OrchestratorManager } from '../../orchestrator/manager.js';
import { AIOrchestrator } from '../../ai/orchestrator.js';
import { toolTracker } from '../../ai/toolTracker.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('orchestrator-handlers');

/**
 * Handle test connection
 */
export async function handleTestConnection(args: any) {
  const message = args.message || 'Hello from Orchestrator!';
  return {
    content: [
      {
        type: 'text',
        text: `Orchestrator MCP is working! Echo: ${message}`,
      },
    ],
  };
}

/**
 * Handle get info
 */
export async function handleGetInfo(orchestrator: OrchestratorManager) {
  try {
    const serverInfo = await orchestrator.getServerInfo();
    const connectedServers = Object.keys(serverInfo.servers).length;
    const totalTools = await orchestrator.getAllTools();
    
    const info = {
      name: 'Orchestrator MCP Server',
      version: '1.0.0',
      description: 'AI-enhanced MCP server orchestrator',
      connectedServers,
      totalTools: totalTools.length,
      servers: serverInfo.servers,
      capabilities: [
        'Multi-server orchestration',
        'AI-powered tool selection',
        'Intelligent workflow execution',
        'Tool usage tracking',
        'Codebase analysis',
        'Quality assessment',
        'Architecture analysis',
      ],
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(info, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to get server info:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error getting server info: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Handle AI processing
 */
export async function handleAIProcess(args: any, aiOrchestrator: AIOrchestrator) {
  try {
    const request = args.request;
    if (!request) {
      throw new Error('Request parameter is required');
    }
    
    logger.info(`Processing AI request: ${request.substring(0, 100)}...`);
    
    const result = await aiOrchestrator.processRequest(request);
    
    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to process AI request:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error processing request: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Handle tool usage stats
 */
export async function handleToolUsageStats() {
  const stats = toolTracker.getUsageStats();
  return {
    content: [
      {
        type: 'text',
        text: `Tool Usage Statistics:\n\n${JSON.stringify(stats, null, 2)}`,
      },
    ],
  };
}

/**
 * Handle tool usage clear
 */
export async function handleToolUsageClear() {
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
