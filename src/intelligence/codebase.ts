/**
 * Advanced codebase analysis
 * Custom intelligence layer for deep code understanding
 */

import path from 'path';
import { createLogger } from '../utils/logging.js';

const logger = createLogger('codebase-intelligence');

/**
 * Codebase analysis result
 */
export interface CodebaseAnalysis {
  structure: {
    directories: string[];
    files: string[];
    languages: Record<string, number>;
  };
  complexity: {
    totalLines: number;
    averageFileSize: number;
    largestFiles: Array<{ path: string; lines: number }>;
  };
  patterns: {
    frameworks: string[];
    architecturalPatterns: string[];
    designPatterns: string[];
  };
  dependencies: {
    external: string[];
    internal: string[];
    circular: string[];
  };
  quality: {
    score: number;
    issues: Array<{ type: string; severity: string; description: string }>;
    suggestions: string[];
  };
}

/**
 * Analyze codebase structure and patterns
 */
export async function analyzeCodebase(rootPath: string): Promise<CodebaseAnalysis> {
  logger.info(`Starting codebase analysis for: ${rootPath}`);

  try {
    // Get directory structure
    const structure = await analyzeStructure(rootPath);

    // Analyze complexity metrics
    const complexity = await analyzeComplexity(structure.files, rootPath);

    // Detect patterns and frameworks
    const patterns = await detectPatterns(structure.files, rootPath);

    // Analyze dependencies
    const dependencies = await analyzeDependencies(rootPath);

    // Calculate quality score
    const quality = await calculateQualityScore(structure, complexity, patterns);

    logger.info(`Codebase analysis completed for ${structure.files.length} files`);

    return {
      structure,
      complexity,
      patterns,
      dependencies,
      quality,
    };
  } catch (error) {
    logger.error('Failed to analyze codebase:', error as Error);
    throw error;
  }
}

/**
 * Analyze directory structure and file organization
 */
async function analyzeStructure(rootPath: string): Promise<{
  directories: string[];
  files: string[];
  languages: Record<string, number>;
}> {
  // This would integrate with filesystem MCP server
  // For now, implementing basic analysis

  const directories: string[] = [];
  const files: string[] = [];
  const languages: Record<string, number> = {};

  // TODO: Use filesystem MCP server to get actual directory tree
  // For now, return basic structure based on common patterns

  return {
    directories: ['src', 'tests', 'docs', 'config'],
    files: ['package.json', 'tsconfig.json', 'README.md'],
    languages: { typescript: 80, javascript: 15, json: 5 },
  };
}

/**
 * Analyze code complexity metrics
 */
async function analyzeComplexity(files: string[], rootPath: string): Promise<{
  totalLines: number;
  averageFileSize: number;
  largestFiles: Array<{ path: string; lines: number }>;
}> {
  // TODO: Use filesystem MCP server to read files and count lines

  return {
    totalLines: 5000,
    averageFileSize: 150,
    largestFiles: [
      { path: 'src/index.ts', lines: 500 },
      { path: 'src/orchestrator/manager.ts', lines: 400 },
    ],
  };
}

/**
 * Detect frameworks and architectural patterns
 */
async function detectPatterns(files: string[], rootPath: string): Promise<{
  frameworks: string[];
  architecturalPatterns: string[];
  designPatterns: string[];
}> {
  const frameworks: string[] = [];
  const architecturalPatterns: string[] = [];
  const designPatterns: string[] = [];

  // Detect frameworks based on file patterns and dependencies
  if (files.some(f => f.includes('package.json'))) {
    frameworks.push('Node.js');
  }
  if (files.some(f => f.includes('tsconfig.json'))) {
    frameworks.push('TypeScript');
  }

  // Detect architectural patterns
  if (files.some(f => f.includes('/controllers/') || f.includes('/routes/'))) {
    architecturalPatterns.push('MVC');
  }
  if (files.some(f => f.includes('/services/') && f.includes('/models/'))) {
    architecturalPatterns.push('Service Layer');
  }

  // Detect design patterns
  if (files.some(f => f.includes('factory') || f.includes('Factory'))) {
    designPatterns.push('Factory Pattern');
  }
  if (files.some(f => f.includes('singleton') || f.includes('Singleton'))) {
    designPatterns.push('Singleton Pattern');
  }

  return { frameworks, architecturalPatterns, designPatterns };
}

/**
 * Analyze project dependencies
 */
async function analyzeDependencies(rootPath: string): Promise<{
  external: string[];
  internal: string[];
  circular: string[];
}> {
  // TODO: Parse package.json and analyze import statements

  return {
    external: ['@modelcontextprotocol/sdk', 'typescript'],
    internal: ['./orchestrator', './ai', './utils'],
    circular: [], // Would detect circular dependencies
  };
}

/**
 * Calculate overall quality score
 */
async function calculateQualityScore(
  structure: any,
  complexity: any,
  patterns: any
): Promise<{
  score: number;
  issues: Array<{ type: string; severity: string; description: string }>;
  suggestions: string[];
}> {
  const issues: Array<{ type: string; severity: string; description: string }> = [];
  const suggestions: string[] = [];

  // Calculate score based on various factors
  let score = 75; // Base score

  // Adjust based on complexity
  if (complexity.averageFileSize > 200) {
    score -= 10;
    issues.push({
      type: 'complexity',
      severity: 'medium',
      description: 'Some files are quite large and may benefit from refactoring',
    });
    suggestions.push('Consider breaking down large files into smaller, more focused modules');
  }

  // Adjust based on patterns
  if (patterns.frameworks.length > 0) {
    score += 5; // Good use of frameworks
  }

  if (patterns.architecturalPatterns.length === 0) {
    score -= 15;
    issues.push({
      type: 'architecture',
      severity: 'high',
      description: 'No clear architectural patterns detected',
    });
    suggestions.push('Consider implementing a clear architectural pattern like MVC or Clean Architecture');
  }

  return { score: Math.max(0, Math.min(100, score)), issues, suggestions };
}

/**
 * Extract architectural insights from codebase
 */
export async function extractArchitecturalInsights(analysis: CodebaseAnalysis): Promise<{
  architecture: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> {
  logger.info('Extracting architectural insights from codebase analysis');

  const architecture = determineArchitecturalStyle(analysis);
  const strengths = identifyStrengths(analysis);
  const weaknesses = identifyWeaknesses(analysis);
  const recommendations = generateRecommendations(analysis);

  return {
    architecture,
    strengths,
    weaknesses,
    recommendations,
  };
}

/**
 * Determine the primary architectural style
 */
function determineArchitecturalStyle(analysis: CodebaseAnalysis): string {
  const patterns = analysis.patterns.architecturalPatterns;

  if (patterns.includes('MVC')) return 'Model-View-Controller';
  if (patterns.includes('Service Layer')) return 'Layered Architecture';
  if (patterns.includes('Microservices')) return 'Microservices';
  if (patterns.includes('Event-Driven')) return 'Event-Driven Architecture';

  return 'Modular Architecture';
}

/**
 * Identify architectural strengths
 */
function identifyStrengths(analysis: CodebaseAnalysis): string[] {
  const strengths: string[] = [];

  if (analysis.patterns.frameworks.includes('TypeScript')) {
    strengths.push('Strong typing with TypeScript enhances code reliability');
  }

  if (analysis.structure.directories.includes('tests')) {
    strengths.push('Dedicated testing structure promotes code quality');
  }

  if (analysis.quality.score > 80) {
    strengths.push('High overall code quality score');
  }

  if (analysis.patterns.designPatterns.length > 0) {
    strengths.push('Good use of design patterns for maintainable code');
  }

  return strengths;
}

/**
 * Identify architectural weaknesses
 */
function identifyWeaknesses(analysis: CodebaseAnalysis): string[] {
  const weaknesses: string[] = [];

  if (analysis.dependencies.circular.length > 0) {
    weaknesses.push('Circular dependencies detected - may cause maintenance issues');
  }

  if (analysis.complexity.averageFileSize > 200) {
    weaknesses.push('Large average file size may indicate insufficient modularization');
  }

  if (analysis.patterns.architecturalPatterns.length === 0) {
    weaknesses.push('Lack of clear architectural patterns may hinder scalability');
  }

  if (analysis.quality.score < 70) {
    weaknesses.push('Code quality score indicates room for improvement');
  }

  return weaknesses;
}

/**
 * Generate architectural recommendations
 */
function generateRecommendations(analysis: CodebaseAnalysis): string[] {
  const recommendations: string[] = [];

  if (analysis.complexity.averageFileSize > 200) {
    recommendations.push('Refactor large files into smaller, single-responsibility modules');
  }

  if (analysis.patterns.architecturalPatterns.length === 0) {
    recommendations.push('Implement a clear architectural pattern to improve code organization');
  }

  if (!analysis.structure.directories.includes('tests')) {
    recommendations.push('Add comprehensive test coverage to improve code reliability');
  }

  if (analysis.dependencies.external.length > 20) {
    recommendations.push('Review external dependencies to reduce complexity and security risks');
  }

  recommendations.push('Consider implementing automated code quality checks in CI/CD pipeline');

  return recommendations;
}
