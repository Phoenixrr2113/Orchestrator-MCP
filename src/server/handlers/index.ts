/**
 * Handlers module
 * Exports all handler functionality
 */

// Main setup functions
export { setupToolListHandler } from './tools.js';
export { setupToolCallHandler } from './dispatcher.js';

// Individual handlers (for advanced usage)
export {
  handleGetInfo,
  handleAIProcess,
  handleAIStatus
} from './orchestrator.js';
