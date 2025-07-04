/**
 * Anti-pattern detection
 */

import type { ArchitectureAnalysis, AntiPatternResult } from './types.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('architecture-antipatterns');

/**
 * Detect architectural anti-patterns
 */
export async function detectAntiPatterns(analysis: ArchitectureAnalysis): Promise<AntiPatternResult> {
  logger.info('Detecting architectural anti-patterns');
  
  const antiPatterns: Array<{
    name: string;
    description: string;
    locations: string[];
    impact: 'low' | 'medium' | 'high';
    solution: string;
  }> = [];
  
  // God Object anti-pattern
  if (analysis.principles.single_responsibility < 50) {
    antiPatterns.push({
      name: 'God Object',
      description: 'Large classes or modules that know too much or do too much',
      locations: ['Multiple large files'],
      impact: 'high',
      solution: 'Break down into smaller, focused components',
    });
  }
  
  // Spaghetti Code anti-pattern
  if (analysis.principles.separation_of_concerns < 40) {
    antiPatterns.push({
      name: 'Spaghetti Code',
      description: 'Lack of clear structure and excessive coupling',
      locations: ['Project structure'],
      impact: 'high',
      solution: 'Implement clear architectural patterns and layering',
    });
  }
  
  // Circular Dependencies anti-pattern
  const circularDeps = analysis.dependencies.filter(dep => 
    analysis.dependencies.some(other => 
      dep.from === other.to && dep.to === other.from
    )
  );
  
  if (circularDeps.length > 0) {
    antiPatterns.push({
      name: 'Circular Dependencies',
      description: 'Components that depend on each other in a circular manner',
      locations: circularDeps.map(dep => `${dep.from} ↔ ${dep.to}`),
      impact: 'medium',
      solution: 'Introduce abstractions or refactor dependencies',
    });
  }
  
  // Big Ball of Mud anti-pattern
  if (analysis.principles.separation_of_concerns < 30 && 
      analysis.principles.single_responsibility < 40) {
    antiPatterns.push({
      name: 'Big Ball of Mud',
      description: 'Haphazardly structured, sprawling, sloppy, duct-tape-and-baling-wire system',
      locations: ['Overall architecture'],
      impact: 'high',
      solution: 'Gradual refactoring with clear architectural vision',
    });
  }
  
  // Monolithic Deployment anti-pattern
  if (analysis.pattern === 'Component-Based Architecture' && 
      analysis.layers.length < 2) {
    antiPatterns.push({
      name: 'Monolithic Deployment',
      description: 'Everything deployed as a single unit without clear separation',
      locations: ['Deployment structure'],
      impact: 'medium',
      solution: 'Consider modular deployment or microservices approach',
    });
  }
  
  // Calculate risk score
  const riskScore = Math.min(100, antiPatterns.length * 25 + 
    (100 - Math.min(...Object.values(analysis.principles))) / 2);
  
  return {
    antiPatterns,
    riskScore,
  };
}
