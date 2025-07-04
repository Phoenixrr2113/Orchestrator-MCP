/**
 * Handlers module
 * Exports all handler functionality
 */

// Main setup functions
export { setupToolListHandler } from './tools.js';
export { setupToolCallHandler } from './dispatcher.js';

// Individual handlers (for advanced usage)
export { 
  handleTestConnection, 
  handleGetInfo, 
  handleAIProcess, 
  handleToolUsageStats, 
  handleToolUsageClear 
} from './orchestrator.js';

export { 
  handleAnalyzeCodebase, 
  handleExtractArchitecturalInsights, 
  handleAssessCodeQuality, 
  handleAnalyzeArchitecture, 
  handleDetectAntiPatterns, 
  handleGenerateArchitecturalRoadmap 
} from './intelligence.js';
