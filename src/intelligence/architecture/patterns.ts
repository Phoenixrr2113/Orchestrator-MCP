/**
 * Architectural pattern detection
 */

import type { CodebaseAnalysis } from '../codebase.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('architecture-patterns');

/**
 * Detect architectural pattern from codebase analysis
 */
export function detectArchitecturalPattern(codebaseAnalysis: CodebaseAnalysis): string {
  const { structure, patterns } = codebaseAnalysis;
  
  // Check for MVC pattern
  if (structure.directories.some(dir => dir.includes('controllers')) &&
      structure.directories.some(dir => dir.includes('models')) &&
      structure.directories.some(dir => dir.includes('views'))) {
    return 'Model-View-Controller (MVC)';
  }
  
  // Check for layered architecture
  if (structure.directories.some(dir => dir.includes('services')) &&
      structure.directories.some(dir => dir.includes('repositories')) &&
      structure.directories.some(dir => dir.includes('controllers'))) {
    return 'Layered Architecture';
  }
  
  // Check for microservices
  if (patterns.frameworks.includes('Docker') || 
      structure.directories.some(dir => dir.includes('services'))) {
    return 'Microservices Architecture';
  }
  
  // Check for modular architecture
  if (structure.directories.length > 5 && 
      structure.directories.some(dir => dir.includes('modules'))) {
    return 'Modular Architecture';
  }
  
  // Default to component-based
  return 'Component-Based Architecture';
}

/**
 * Analyze architectural layers
 */
export function analyzeLayers(codebaseAnalysis: CodebaseAnalysis): Array<{
  name: string;
  components: string[];
  responsibilities: string[];
}> {
  const layers: Array<{
    name: string;
    components: string[];
    responsibilities: string[];
  }> = [];
  
  const { structure } = codebaseAnalysis;
  
  // Presentation Layer
  if (structure.directories.some(dir => dir.includes('views') || dir.includes('components'))) {
    layers.push({
      name: 'Presentation Layer',
      components: structure.directories.filter(dir => 
        dir.includes('views') || dir.includes('components') || dir.includes('ui')
      ),
      responsibilities: ['User interface', 'User interaction', 'Data presentation'],
    });
  }
  
  // Business Logic Layer
  if (structure.directories.some(dir => dir.includes('services') || dir.includes('business'))) {
    layers.push({
      name: 'Business Logic Layer',
      components: structure.directories.filter(dir => 
        dir.includes('services') || dir.includes('business') || dir.includes('logic')
      ),
      responsibilities: ['Business rules', 'Data processing', 'Workflow management'],
    });
  }
  
  // Data Access Layer
  if (structure.directories.some(dir => dir.includes('models') || dir.includes('repositories'))) {
    layers.push({
      name: 'Data Access Layer',
      components: structure.directories.filter(dir => 
        dir.includes('models') || dir.includes('repositories') || dir.includes('data')
      ),
      responsibilities: ['Data persistence', 'Database operations', 'Data mapping'],
    });
  }
  
  return layers;
}

/**
 * Analyze dependency relationships
 */
export function analyzeDependencyRelationships(codebaseAnalysis: CodebaseAnalysis): Array<{
  from: string;
  to: string;
  type: 'depends_on' | 'uses' | 'extends' | 'implements';
  strength: 'weak' | 'medium' | 'strong';
}> {
  const dependencies: Array<{
    from: string;
    to: string;
    type: 'depends_on' | 'uses' | 'extends' | 'implements';
    strength: 'weak' | 'medium' | 'strong';
  }> = [];
  
  const { dependencies: deps } = codebaseAnalysis;
  
  // Analyze external dependencies
  deps.external.forEach(dep => {
    dependencies.push({
      from: 'Application',
      to: dep,
      type: 'depends_on',
      strength: 'strong',
    });
  });
  
  // Analyze internal dependencies
  deps.internal.forEach(dep => {
    dependencies.push({
      from: 'Main Module',
      to: dep,
      type: 'uses',
      strength: 'medium',
    });
  });
  
  return dependencies;
}
