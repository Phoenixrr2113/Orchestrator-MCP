/**
 * Main quality analyzer
 */

import type { QualityAssessment } from './types.js';
import { analyzeFileStructure, analyzeSecurityIssues, analyzeMaintainability } from './analyzers.js';
import { calculateTestabilityScore, calculateOverallScore, calculateTestCoverage, calculateTechnicalDebt } from './metrics.js';
import { generateQualityRecommendations } from './suggestions.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('quality-analyzer');

/**
 * Assess code quality across multiple dimensions
 */
export async function assessCodeQuality(filePaths: string[]): Promise<QualityAssessment> {
  logger.info(`Assessing code quality for ${filePaths.length} files`);
  
  try {
    // Initialize assessment
    const assessment: QualityAssessment = {
      overallScore: 0,
      categories: {
        maintainability: 0,
        readability: 0,
        testability: 0,
        performance: 0,
        security: 0,
      },
      issues: [],
      metrics: {
        cyclomaticComplexity: 0,
        codeduplication: 0,
        testCoverage: 0,
        technicalDebt: 0,
      },
      recommendations: [],
    };

    // Analyze file structure and complexity
    const structureAnalysis = await analyzeFileStructure(filePaths);
    
    // Run security analysis (would use Semgrep MCP server)
    const securityAnalysis = await analyzeSecurityIssues(filePaths);
    
    // Analyze code patterns and maintainability
    const maintainabilityAnalysis = await analyzeMaintainability(filePaths);
    
    // Calculate scores and combine results
    assessment.categories.maintainability = maintainabilityAnalysis.score;
    assessment.categories.security = securityAnalysis.score;
    assessment.categories.readability = structureAnalysis.readabilityScore;
    assessment.categories.testability = calculateTestabilityScore(filePaths);
    assessment.categories.performance = 75; // Placeholder
    
    // Calculate overall score
    assessment.overallScore = calculateOverallScore(assessment.categories);
    
    // Combine issues
    assessment.issues = [
      ...structureAnalysis.issues,
      ...securityAnalysis.issues,
      ...maintainabilityAnalysis.issues,
    ];
    
    // Generate recommendations
    assessment.recommendations = generateQualityRecommendations(assessment);
    
    // Update metrics
    assessment.metrics = {
      cyclomaticComplexity: structureAnalysis.complexity,
      codeduplication: maintainabilityAnalysis.duplication,
      testCoverage: calculateTestCoverage(filePaths),
      technicalDebt: calculateTechnicalDebt(assessment),
    };
    
    logger.info(`Quality assessment completed with overall score: ${assessment.overallScore}`);
    return assessment;
    
  } catch (error) {
    logger.error('Failed to assess code quality:', error as Error);
    throw error;
  }
}
