/**
 * Quality assessment module
 * Exports all quality-related functionality
 */

// Main analyzer
export { assessCodeQuality } from './analyzer.js';

// Improvement suggestions
export { generateImprovementSuggestions } from './suggestions.js';

// Types
export type { QualityAssessment, ImprovementSuggestions } from './types.js';

// Analyzers (for advanced usage)
export { 
  analyzeFileStructure, 
  analyzeSecurityIssues, 
  analyzeMaintainability 
} from './analyzers.js';

// Metrics (for advanced usage)
export { 
  calculateTestabilityScore, 
  calculateOverallScore, 
  calculateTestCoverage, 
  calculateTechnicalDebt 
} from './metrics.js';

// Suggestions (for advanced usage)
export { generateQualityRecommendations } from './suggestions.js';
