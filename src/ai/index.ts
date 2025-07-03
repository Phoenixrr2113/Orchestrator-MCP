/**
 * AI Enhancement Layer for MCP Orchestrator
 * 
 * This module provides intelligent orchestration capabilities using:
 * - Vercel AI SDK for LLM interactions
 * - OpenRouter for multi-model access
 * - Intelligent tool routing and selection
 * - Automated workflow execution
 * - Context synthesis and result enhancement
 */

export { AIClient, createAIClient, type AIClientConfig } from './client.js';
export { IntelligentRouter, type RoutingDecision } from './router.js';
export { WorkflowEngine, type WorkflowStepResult, type WorkflowContext } from './workflow.js';
export { AIOrchestrator, type AIOrchestrationResult } from './orchestrator.js';
