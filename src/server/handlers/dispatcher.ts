/**
 * Tool call dispatcher
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OrchestratorManager } from '../../orchestrator/manager.js';
import { AIOrchestrator } from '../../ai/orchestrator.js';
import { createLogger, createErrorResponse } from '../../utils/index.js';

// Import handlers
import { 
  handleTestConnection, 
  handleGetInfo, 
  handleAIProcess, 
  handleToolUsageStats, 
  handleToolUsageClear 
} from './orchestrator.js';

import { 
  handleAnalyzeCodebase, 
  handleExtractArchitecturalInsights, 
  handleAssessCodeQuality, 
  handleAnalyzeArchitecture, 
  handleDetectAntiPatterns, 
  handleGenerateArchitecturalRoadmap 
} from './intelligence.js';

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
      
      // Route to appropriate handler
      switch (name) {
        case 'test_connection':
          return handleTestConnection(args);
        
        case 'get_info':
          return handleGetInfo(orchestrator);
        
        case 'ai_process':
          return handleAIProcess(args, aiOrchestrator);
        
        case 'tool_usage_stats':
          return handleToolUsageStats();
        
        case 'tool_usage_clear':
          return handleToolUsageClear();
        
        case 'analyze_codebase':
          return handleAnalyzeCodebase(args);
        
        case 'extract_architectural_insights':
          return handleExtractArchitecturalInsights(args);
        
        case 'assess_code_quality':
          return handleAssessCodeQuality(args);
        
        case 'analyze_architecture':
          return handleAnalyzeArchitecture(args);
        
        case 'detect_anti_patterns':
          return handleDetectAntiPatterns(args);
        
        case 'generate_architectural_roadmap':
          return handleGenerateArchitecturalRoadmap(args);
        
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
