/**
 * SOLID principles assessment
 */

import type { CodebaseAnalysis } from '../codebase.js';
import type { ArchitectureAnalysis } from './types.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('architecture-principles');

/**
 * Assess SOLID principles compliance
 */
export function assessSOLIDPrinciples(codebaseAnalysis: CodebaseAnalysis): {
  separation_of_concerns: number;
  single_responsibility: number;
  dependency_inversion: number;
  open_closed: number;
} {
  const { structure, complexity, patterns } = codebaseAnalysis;
  
  // Single Responsibility Principle
  let singleResponsibility = 70; // Base score
  if (complexity.averageFileSize < 100) singleResponsibility += 20;
  if (complexity.averageFileSize > 300) singleResponsibility -= 30;
  
  // Separation of Concerns
  let separationOfConcerns = 60; // Base score
  if (structure.directories.length > 3) separationOfConcerns += 20;
  if (patterns.architecturalPatterns.length > 0) separationOfConcerns += 15;
  
  // Dependency Inversion
  let dependencyInversion = 65; // Base score
  if (patterns.designPatterns.includes('Dependency Injection')) dependencyInversion += 25;
  if (patterns.designPatterns.includes('Factory Pattern')) dependencyInversion += 10;
  
  // Open/Closed Principle
  let openClosed = 70; // Base score
  if (patterns.designPatterns.includes('Strategy Pattern')) openClosed += 15;
  if (patterns.designPatterns.includes('Observer Pattern')) openClosed += 10;
  
  return {
    separation_of_concerns: Math.max(0, Math.min(100, separationOfConcerns)),
    single_responsibility: Math.max(0, Math.min(100, singleResponsibility)),
    dependency_inversion: Math.max(0, Math.min(100, dependencyInversion)),
    open_closed: Math.max(0, Math.min(100, openClosed)),
  };
}

/**
 * Detect architectural violations
 */
export function detectArchitecturalViolations(
  codebaseAnalysis: CodebaseAnalysis,
  principles: ArchitectureAnalysis['principles']
): Array<{
  principle: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
}> {
  const violations: Array<{
    principle: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    location: string;
  }> = [];
  
  // Check for Single Responsibility violations
  if (principles.single_responsibility < 60) {
    violations.push({
      principle: 'Single Responsibility Principle',
      description: 'Large files detected that may have multiple responsibilities',
      severity: 'medium',
      location: 'Multiple files',
    });
  }
  
  // Check for Separation of Concerns violations
  if (principles.separation_of_concerns < 50) {
    violations.push({
      principle: 'Separation of Concerns',
      description: 'Insufficient architectural layering detected',
      severity: 'high',
      location: 'Project structure',
    });
  }
  
  // Check for circular dependencies
  if (codebaseAnalysis.dependencies.circular.length > 0) {
    violations.push({
      principle: 'Dependency Management',
      description: 'Circular dependencies detected',
      severity: 'high',
      location: codebaseAnalysis.dependencies.circular.join(', '),
    });
  }
  
  return violations;
}

/**
 * Generate architectural recommendations
 */
export function generateArchitecturalRecommendations(
  pattern: string,
  principles: ArchitectureAnalysis['principles'],
  violations: ArchitectureAnalysis['violations']
): Array<{
  type: 'refactor' | 'extract' | 'merge' | 'restructure';
  description: string;
  rationale: string;
  effort: 'low' | 'medium' | 'high';
}> {
  const recommendations: Array<{
    type: 'refactor' | 'extract' | 'merge' | 'restructure';
    description: string;
    rationale: string;
    effort: 'low' | 'medium' | 'high';
  }> = [];
  
  // Recommendations based on violations
  violations.forEach(violation => {
    if (violation.principle === 'Single Responsibility Principle') {
      recommendations.push({
        type: 'refactor',
        description: 'Break down large files into smaller, focused modules',
        rationale: 'Improves maintainability and testability',
        effort: 'medium',
      });
    }
    
    if (violation.principle === 'Separation of Concerns') {
      recommendations.push({
        type: 'restructure',
        description: 'Implement clear architectural layers',
        rationale: 'Enhances code organization and reduces coupling',
        effort: 'high',
      });
    }
  });
  
  // Recommendations based on principles scores
  if (principles.dependency_inversion < 70) {
    recommendations.push({
      type: 'refactor',
      description: 'Implement dependency injection pattern',
      rationale: 'Reduces coupling and improves testability',
      effort: 'medium',
    });
  }
  
  if (principles.open_closed < 70) {
    recommendations.push({
      type: 'extract',
      description: 'Extract interfaces and use strategy patterns',
      rationale: 'Makes code more extensible without modification',
      effort: 'medium',
    });
  }
  
  return recommendations;
}
