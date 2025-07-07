/**
 * Smart File Selection Module
 * 
 * Provides intelligent file selection for context engines without using AI calls.
 * Uses static analysis, filesystem heuristics, and multi-signal scoring.
 */

export * from './types.js';
export * from './intent-classifier.js';
export * from './file-discovery.js';
export * from './relevance-analyzer.js';
export * from './smart-selector.js';

// Re-export main classes for convenience
export { SmartFileSelector } from './smart-selector.js';
export { SmartQueryIntentClassifier } from './intent-classifier.js';
export { SmartFileDiscovery } from './file-discovery.js';
export { SmartRelevanceAnalyzer } from './relevance-analyzer.js';

// Re-export key types
export type { 
  FileSelectionRequest, 
  FileSelectionResult, 
  ScoredFile,
  QueryIntent,
  FileSelectionStrategy 
} from './types.js';
