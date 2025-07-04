/**
 * Quality improvement suggestions
 */

import type { QualityAssessment, ImprovementSuggestions } from './types.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('quality-suggestions');

/**
 * Generate quality recommendations
 */
export function generateQualityRecommendations(assessment: QualityAssessment): string[] {
  const recommendations: string[] = [];
  
  if (assessment.categories.security < 70) {
    recommendations.push('Implement comprehensive security scanning in CI/CD pipeline');
  }
  
  if (assessment.categories.testability < 60) {
    recommendations.push('Add unit tests to improve code testability and reliability');
  }
  
  if (assessment.categories.maintainability < 70) {
    recommendations.push('Refactor complex functions and reduce code duplication');
  }
  
  if (assessment.categories.readability < 70) {
    recommendations.push('Improve code documentation and naming conventions');
  }
  
  if (assessment.overallScore < 70) {
    recommendations.push('Consider implementing automated code quality gates');
  }
  
  return recommendations;
}

/**
 * Generate improvement suggestions based on quality assessment
 */
export async function generateImprovementSuggestions(
  assessment: QualityAssessment
): Promise<ImprovementSuggestions> {
  logger.info('Generating improvement suggestions based on quality assessment');
  
  const suggestions: Array<{
    category: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  }> = [];
  
  // Analyze categories and generate suggestions
  if (assessment.categories.security < 70) {
    suggestions.push({
      category: 'security',
      description: 'Implement comprehensive security scanning and fix identified vulnerabilities',
      effort: 'medium',
      impact: 'high',
    });
  }
  
  if (assessment.categories.testability < 60) {
    suggestions.push({
      category: 'testing',
      description: 'Add unit tests and improve test coverage',
      effort: 'high',
      impact: 'high',
    });
  }
  
  if (assessment.categories.maintainability < 70) {
    suggestions.push({
      category: 'maintainability',
      description: 'Refactor complex functions and reduce code duplication',
      effort: 'medium',
      impact: 'medium',
    });
  }
  
  if (assessment.metrics.cyclomaticComplexity > 10) {
    suggestions.push({
      category: 'complexity',
      description: 'Break down complex functions into smaller, focused units',
      effort: 'medium',
      impact: 'medium',
    });
  }
  
  if (assessment.categories.readability < 70) {
    suggestions.push({
      category: 'documentation',
      description: 'Improve code documentation and naming conventions',
      effort: 'low',
      impact: 'medium',
    });
  }
  
  if (assessment.categories.performance < 70) {
    suggestions.push({
      category: 'performance',
      description: 'Profile and optimize performance bottlenecks',
      effort: 'medium',
      impact: 'medium',
    });
  }
  
  // Determine priority based on overall score
  let priority: 'high' | 'medium' | 'low' = 'medium';
  if (assessment.overallScore < 60) {
    priority = 'high';
  } else if (assessment.overallScore > 80) {
    priority = 'low';
  }
  
  return {
    priority,
    suggestions,
  };
}
