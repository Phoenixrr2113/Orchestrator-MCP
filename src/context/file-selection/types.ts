/**
 * Types and interfaces for intelligent file selection
 */

/**
 * Query intent classification for different file selection strategies
 */
export enum QueryIntent {
  ARCHITECTURE_ANALYSIS = 'architecture',
  BUG_INVESTIGATION = 'debugging',
  FEATURE_IMPLEMENTATION = 'feature',
  CODE_QUALITY = 'quality',
  SECURITY_AUDIT = 'security',
  PERFORMANCE_ANALYSIS = 'performance',
  INTELLIGENCE_LAYER = 'intelligence',
  API_ANALYSIS = 'api',
  DATABASE_ANALYSIS = 'database',
  UI_ANALYSIS = 'ui',
  GENERAL = 'general'
}

/**
 * File relevance scoring signals
 */
export interface FileRelevanceSignals {
  nameMatch: number;        // File name matches query keywords (0-1)
  directoryMatch: number;   // Directory structure relevance (0-1)
  symbolMatch: number;      // Contains relevant symbols/functions (0-1)
  importRelevance: number;  // Imported by or imports relevant files (0-1)
  recentActivity: number;   // Recently modified (0-1)
  fileSize: number;         // File size score (0-1)
}

/**
 * Scored file with relevance information
 */
export interface ScoredFile {
  path: string;
  relevanceScore: number;
  signals: FileRelevanceSignals;
  reason?: string;
}

/**
 * File selection strategy configuration
 */
export interface FileSelectionStrategy {
  directories: string[];
  fileTypes: string[];
  keywords?: string[];
  prioritize?: string[];
  maxFiles: number;
  includeTests?: boolean;
  prioritizeRecent?: boolean;
  excludePatterns?: string[];
}

/**
 * File selection request
 */
export interface FileSelectionRequest {
  query: string;
  maxFiles?: number;
  fileTypes?: string[];
  includeTests?: boolean;
  workingDirectory?: string;
}

/**
 * File selection result
 */
export interface FileSelectionResult {
  files: ScoredFile[];
  strategy: QueryIntent;
  totalScanned: number;
  executionTime: number;
}

/**
 * File discovery interface
 */
export interface FileDiscovery {
  findByDirectoryRelevance(query: string, directories: string[]): Promise<string[]>;
  findByFileNameMatching(query: string, fileTypes: string[]): Promise<string[]>;
  findByRecentModifications(maxFiles: number): Promise<string[]>;
  getAllFiles(directories: string[], fileTypes: string[]): Promise<string[]>;
}

/**
 * Relevance analyzer interface
 */
export interface RelevanceAnalyzer {
  scoreFileName(filePath: string, query: string): number;
  scoreDirectory(filePath: string, query: string): number;
  scoreFileSize(filePath: string): number;
  scoreRecency(filePath: string): number;
  calculateOverallScore(signals: FileRelevanceSignals): number;
}

/**
 * Query intent classifier interface
 */
export interface QueryIntentClassifier {
  classifyIntent(query: string): QueryIntent;
  getStrategyForIntent(intent: QueryIntent): FileSelectionStrategy;
  extractKeywords(query: string): string[];
  extractSymbols(query: string): string[];
}
