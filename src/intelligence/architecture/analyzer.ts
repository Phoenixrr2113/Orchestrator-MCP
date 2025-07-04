/**
 * Main architecture analyzer
 */

import { analyzeCodebase, type CodebaseAnalysis } from '../codebase.js';
import { detectArchitecturalPattern, analyzeLayers, analyzeDependencyRelationships } from './patterns.js';
import { assessSOLIDPrinciples, detectArchitecturalViolations, generateArchitecturalRecommendations } from './principles.js';
import type { ArchitectureAnalysis } from './types.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('architecture-analyzer');

/**
 * Analyze system architecture and design patterns
 */
export async function analyzeArchitecture(rootPath: string): Promise<ArchitectureAnalysis> {
  logger.info(`Starting architecture analysis for: ${rootPath}`);
  
  try {
    // First get codebase analysis
    const codebaseAnalysis = await analyzeCodebase(rootPath);
    
    // Detect architectural pattern
    const pattern = detectArchitecturalPattern(codebaseAnalysis);
    
    // Analyze layers and components
    const layers = analyzeLayers(codebaseAnalysis);
    
    // Analyze dependencies
    const dependencies = analyzeDependencyRelationships(codebaseAnalysis);
    
    // Assess SOLID principles
    const principles = assessSOLIDPrinciples(codebaseAnalysis);
    
    // Detect violations
    const violations = detectArchitecturalViolations(codebaseAnalysis, principles);
    
    // Generate recommendations
    const recommendations = generateArchitecturalRecommendations(pattern, principles, violations);
    
    logger.info(`Architecture analysis completed. Pattern: ${pattern}`);
    
    return {
      pattern,
      layers,
      dependencies,
      principles,
      violations,
      recommendations,
    };
  } catch (error) {
    logger.error('Failed to analyze architecture:', error as Error);
    throw error;
  }
}
