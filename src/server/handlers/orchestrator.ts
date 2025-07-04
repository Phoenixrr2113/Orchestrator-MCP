/**
 * Basic orchestrator handlers
 */

import { OrchestratorManager } from '../../orchestrator/manager.js';
import { AIOrchestrator } from '../../ai/orchestrator.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('orchestrator-handlers');



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
          text: result.response,
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
 * Handle AI status check
 */
export async function handleAIStatus(aiOrchestrator: AIOrchestrator) {
  try {
    const isAvailable = aiOrchestrator.isAIAvailable();
    const capabilities = await aiOrchestrator.testAICapabilities();

    const status = {
      available: isAvailable,
      capabilities,
      apiKeyConfigured: !!process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet',
      configurationNote: 'API keys should be configured in MCP client settings under "env" section',
    };

    return {
      content: [
        {
          type: 'text',
          text: `AI Orchestration Status:\n\n${JSON.stringify(status, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to get AI status:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error getting AI status: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Handle web fetch
 */
export async function handleWebFetch(args: any, orchestrator: OrchestratorManager) {
  try {
    const url = args.url;
    if (!url) {
      throw new Error('URL parameter is required');
    }

    logger.info(`Fetching URL: ${url}`);

    // Use the fetch server to get the content
    const result = await orchestrator.callTool('fetch_fetch', { url });

    return result;
  } catch (error) {
    logger.error('Failed to fetch URL:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching URL: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}




