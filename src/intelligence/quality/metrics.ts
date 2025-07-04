/**
 * Quality metrics calculation
 */

import type { QualityAssessment } from './types.js';
import { TECHNICAL_DEBT } from '../../constants/quality.js';

/**
 * Calculate testability score
 */
export function calculateTestabilityScore(filePaths: string[]): number {
  let testabilityScore = 60; // Base score
  
  // Check for test files
  const hasTests = filePaths.some(path => 
    path.includes('test') || path.includes('spec') || path.includes('__tests__')
  );
  
  if (hasTests) {
    testabilityScore += 20;
  } else {
    testabilityScore -= 20;
  }
  
  // Check for dependency injection patterns (good for testing)
  const hasDI = filePaths.some(path => 
    path.includes('inject') || path.includes('provider') || path.includes('container')
  );
  
  if (hasDI) {
    testabilityScore += 10;
  }
  
  return Math.max(0, Math.min(100, testabilityScore));
}

/**
 * Calculate overall quality score
 */
export function calculateOverallScore(categories: QualityAssessment['categories']): number {
  const weights = {
    maintainability: 0.25,
    readability: 0.20,
    testability: 0.20,
    performance: 0.15,
    security: 0.20,
  };
  
  return Math.round(
    categories.maintainability * weights.maintainability +
    categories.readability * weights.readability +
    categories.testability * weights.testability +
    categories.performance * weights.performance +
    categories.security * weights.security
  );
}

/**
 * Calculate test coverage
 */
export function calculateTestCoverage(filePaths: string[]): number {
  // TODO: Integrate with actual test coverage tools
  const testFiles = filePaths.filter(path => 
    path.includes('test') || path.includes('spec')
  );
  
  const sourceFiles = filePaths.filter(path => 
    !path.includes('test') && !path.includes('spec') && path.endsWith('.ts')
  );
  
  if (sourceFiles.length === 0) return 0;
  
  // Rough estimate based on test file ratio
  return Math.min(100, (testFiles.length / sourceFiles.length) * 100);
}

/**
 * Calculate technical debt
 */
export function calculateTechnicalDebt(assessment: QualityAssessment): number {
  const issues = assessment.issues;

  const debtScore = issues.reduce((total, issue) => {
    switch (issue.type) {
      case 'error': return total + TECHNICAL_DEBT.WEIGHTS.ERROR;
      case 'warning': return total + TECHNICAL_DEBT.WEIGHTS.WARNING;
      case 'suggestion': return total + TECHNICAL_DEBT.WEIGHTS.SUGGESTION;
      default: return total;
    }
  }, 0);

  return Math.min(TECHNICAL_DEBT.RANGES.CRITICAL, debtScore);
}
