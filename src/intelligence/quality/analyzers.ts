/**
 * Quality analysis functions
 */

import type { QualityIssue } from './types.js';
import { QUALITY_THRESHOLDS, FILE_ANALYSIS } from '../../constants/quality.js';

/**
 * Analyze file structure and complexity
 */
export async function analyzeFileStructure(filePaths: string[]): Promise<{
  readabilityScore: number;
  complexity: number;
  issues: QualityIssue[];
}> {
  const issues: QualityIssue[] = [];
  let totalComplexity = 0;
  let readabilityScore = QUALITY_THRESHOLDS.READABILITY.BASE_SCORE;
  
  // Analyze each file for basic structural issues
  for (const filePath of filePaths) {
    // Basic heuristic analysis based on file patterns
    let fileComplexity = FILE_ANALYSIS.COMPLEXITY_WEIGHTS.BASE;

    // Increase complexity for certain file types
    if (filePath.includes('manager') || filePath.includes('orchestrator')) {
      fileComplexity += FILE_ANALYSIS.COMPLEXITY_WEIGHTS.MANAGER;
    }
    if (filePath.includes('handler') || filePath.includes('router')) {
      fileComplexity += FILE_ANALYSIS.COMPLEXITY_WEIGHTS.HANDLER;
    }
    if (filePath.includes('workflow') || filePath.includes('engine')) {
      fileComplexity += FILE_ANALYSIS.COMPLEXITY_WEIGHTS.WORKFLOW;
    }

    totalComplexity += fileComplexity;

    if (fileComplexity > QUALITY_THRESHOLDS.COMPLEXITY.HIGH_THRESHOLD) {
      issues.push({
        file: filePath,
        type: 'warning',
        category: 'complexity',
        description: 'Potentially high complexity file detected',
        suggestion: 'Consider breaking down this file into smaller, focused modules',
      });
      readabilityScore -= QUALITY_THRESHOLDS.READABILITY.COMPLEXITY_PENALTY;
    }

    // Check for files that typically grow large
    if (filePath.includes('manager') || filePath.includes('orchestrator') || filePath.includes('index')) {
      issues.push({
        file: filePath,
        type: 'suggestion',
        category: 'maintainability',
        description: 'File type prone to growth - monitor size',
        suggestion: 'Consider modular architecture to prevent file bloat',
      });
    }
  }
  
  return {
    readabilityScore: Math.max(0, readabilityScore),
    complexity: totalComplexity / filePaths.length,
    issues,
  };
}

/**
 * Analyze security issues using Semgrep
 */
export async function analyzeSecurityIssues(filePaths: string[]): Promise<{
  score: number;
  issues: QualityIssue[];
}> {
  const issues: QualityIssue[] = [];
  let securityScore = QUALITY_THRESHOLDS.SECURITY.BASE_SCORE;
  
  // Basic security analysis based on file patterns and common issues
  for (const filePath of filePaths) {
    // Check for configuration files that might contain secrets
    if (filePath.includes('config') || filePath.includes('env') || filePath.includes('.env')) {
      issues.push({
        file: filePath,
        type: 'warning',
        category: 'security',
        description: 'Configuration file may contain sensitive data',
        suggestion: 'Ensure no secrets are hardcoded; use environment variables',
      });
      securityScore -= QUALITY_THRESHOLDS.SECURITY.CONFIG_FILE_PENALTY;
    }

    // Check server and API files for security considerations
    if (filePath.includes('server') || filePath.includes('api') || filePath.includes('handler')) {
      issues.push({
        file: filePath,
        type: 'suggestion',
        category: 'security',
        description: 'Server file should implement proper input validation',
        suggestion: 'Implement input validation, sanitization, and error handling',
      });
    }

    // Check for authentication-related files
    if (filePath.includes('auth') || filePath.includes('login') || filePath.includes('token')) {
      issues.push({
        file: filePath,
        type: 'warning',
        category: 'security',
        description: 'Authentication file requires security review',
        suggestion: 'Ensure secure authentication practices and token handling',
      });
      securityScore -= QUALITY_THRESHOLDS.SECURITY.AUTH_FILE_PENALTY;
    }
  }
  
  return {
    score: Math.max(0, securityScore),
    issues,
  };
}

/**
 * Analyze maintainability factors
 */
export async function analyzeMaintainability(filePaths: string[]): Promise<{
  score: number;
  duplication: number;
  issues: QualityIssue[];
}> {
  const issues: QualityIssue[] = [];
  let maintainabilityScore = QUALITY_THRESHOLDS.MAINTAINABILITY.BASE_SCORE;
  let duplicationScore = 10; // Percentage of duplicated code
  
  // Check for common maintainability issues
  for (const filePath of filePaths) {
    if (filePath.includes('TODO') || filePath.includes('FIXME')) {
      issues.push({
        file: filePath,
        type: 'suggestion',
        category: 'maintainability',
        description: 'TODO/FIXME comments found',
        suggestion: 'Address pending TODO items to improve code quality',
      });
      maintainabilityScore -= QUALITY_THRESHOLDS.MAINTAINABILITY.TODO_PENALTY;
    }
    
    // Check for TypeScript usage (good for maintainability)
    if (filePath.endsWith('.ts')) {
      maintainabilityScore += QUALITY_THRESHOLDS.MAINTAINABILITY.TYPESCRIPT_BONUS;
    }
  }
  
  return {
    score: Math.max(0, Math.min(100, maintainabilityScore)),
    duplication: duplicationScore,
    issues,
  };
}
