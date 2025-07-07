#!/usr/bin/env node

/**
 * Main entry point for the Orchestrator MCP Server
 * Simplified to use modular structure from alternative-plan.md
 */

import { createServer, initializeComponents, startServer } from './server/setup.js';
import { setupToolListHandler, setupToolCallHandler } from './server/handlers.js';
import { createLogger } from './utils/logging.js';

const logger = createLogger('main');

async function main() {
  try {
    logger.info('Starting Orchestrator MCP Server...');

    // Create server instance
    const server = createServer();

    // Initialize components
    const { orchestrator, aiOrchestrator } = await initializeComponents();

    // Setup request handlers
    setupToolListHandler(server);
    setupToolCallHandler(server, orchestrator, aiOrchestrator);

    // Start the server
    await startServer(server, orchestrator, aiOrchestrator);

  } catch (error) {
    logger.error('Failed to initialize Orchestrator', error as Error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Failed to start Orchestrator MCP Server:', error);
  process.exit(1);
});