/**
 * Architecture analysis module
 * Exports all architecture-related functionality
 */

// Main analyzer
export { analyzeArchitecture } from './analyzer.js';

// Anti-pattern detection
export { detectAntiPatterns } from './antipatterns.js';

// Roadmap generation
export { generateArchitecturalRoadmap } from './roadmap.js';

// Types
export type { 
  ArchitectureAnalysis, 
  AntiPatternResult, 
  ArchitecturalRoadmap 
} from './types.js';

// Pattern detection utilities (for advanced usage)
export { 
  detectArchitecturalPattern, 
  analyzeLayers, 
  analyzeDependencyRelationships 
} from './patterns.js';

// Principles assessment utilities (for advanced usage)
export { 
  assessSOLIDPrinciples, 
  detectArchitecturalViolations, 
  generateArchitecturalRecommendations 
} from './principles.js';
