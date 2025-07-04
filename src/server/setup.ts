/**
 * Server initialization and configuration
 * Extracted from index.ts to match planned structure
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { OrchestratorManager } from '../orchestrator/manager.js';
import { AIOrchestrator } from '../ai/orchestrator.js';
import { createLogger } from '../utils/logging.js';

const logger = createLogger('server-setup');

/**
 * Create and configure the MCP server
 */
export function createServer(): Server {
  return new Server(
    {
      name: 'orchestrator-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
}

/**
 * Initialize orchestrator and AI components
 */
export async function initializeComponents(): Promise<{
  orchestrator: OrchestratorManager;
  aiOrchestrator: AIOrchestrator;
}> {
  logger.info('Initializing orchestrator components...');

  // Initialize the orchestrator manager
  const orchestrator = new OrchestratorManager();
  await orchestrator.initialize();
  logger.info('Orchestrator manager initialized');

  // Initialize AI orchestration layer (optional - will gracefully degrade if not available)
  const aiOrchestrator = new AIOrchestrator(orchestrator);
  try {
    await aiOrchestrator.initialize();
    logger.info('AI Orchestration Layer initialized successfully');
  } catch (aiError) {
    logger.warn('AI Orchestration Layer failed to initialize', aiError as Error);
    logger.info('Continuing with basic orchestration (AI features disabled)');
  }

  return { orchestrator, aiOrchestrator };
}

/**
 * Start the MCP server with proper error handling
 */
export async function startServer(
  server: Server,
  orchestrator: OrchestratorManager,
  aiOrchestrator: AIOrchestrator
): Promise<void> {
  try {
    // Start the MCP server
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log to stderr so it doesn't interfere with MCP protocol
    logger.info('Orchestrator MCP Server started and ready for connections');

    // Log AI status
    const aiStatus = aiOrchestrator.getStatus();
    if (aiStatus.aiAvailable) {
      logger.info('AI-enhanced orchestration is active');
    } else {
      logger.info('Basic orchestration mode (set OPENROUTER_API_KEY for AI features)');
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down Orchestrator MCP Server...');
      await orchestrator.disconnect();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server', error as Error);
    throw error;
  }
}
