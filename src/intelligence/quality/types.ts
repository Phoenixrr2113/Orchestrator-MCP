/**
 * Quality assessment types and interfaces
 */

/**
 * Quality assessment result
 */
export interface QualityAssessment {
  overallScore: number;
  categories: {
    maintainability: number;
    readability: number;
    testability: number;
    performance: number;
    security: number;
  };
  issues: Array<{
    file: string;
    line?: number;
    type: 'error' | 'warning' | 'suggestion';
    category: string;
    description: string;
    suggestion?: string;
  }>;
  metrics: {
    cyclomaticComplexity: number;
    codeduplication: number;
    testCoverage: number;
    technicalDebt: number;
  };
  recommendations: string[];
}

/**
 * Improvement suggestions result
 */
export interface ImprovementSuggestions {
  priority: 'high' | 'medium' | 'low';
  suggestions: Array<{
    category: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  }>;
}
