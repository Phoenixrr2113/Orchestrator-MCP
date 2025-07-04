/**
 * System architecture analysis
 * High-level system understanding and architectural insights
 */

import { analyzeCodebase, type CodebaseAnalysis } from './codebase.js';
import { createLogger } from '../utils/logging.js';

const logger = createLogger('architecture-intelligence');

/**
 * Architecture analysis result
 */
export interface ArchitectureAnalysis {
  pattern: string;
  layers: Array<{
    name: string;
    components: string[];
    responsibilities: string[];
  }>;
  dependencies: Array<{
    from: string;
    to: string;
    type: 'depends_on' | 'uses' | 'extends' | 'implements';
    strength: 'weak' | 'medium' | 'strong';
  }>;
  principles: {
    separation_of_concerns: number;
    single_responsibility: number;
    dependency_inversion: number;
    open_closed: number;
  };
  violations: Array<{
    principle: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    location: string;
  }>;
  recommendations: Array<{
    type: 'refactor' | 'extract' | 'merge' | 'restructure';
    description: string;
    rationale: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Analyze system architecture and design patterns
 */
export async function analyzeArchitecture(rootPath: string): Promise<ArchitectureAnalysis> {
  logger.info(`Starting architecture analysis for: ${rootPath}`);

  try {
    // First get codebase analysis
    const codebaseAnalysis = await analyzeCodebase(rootPath);

    // Detect architectural pattern
    const pattern = detectArchitecturalPattern(codebaseAnalysis);

    // Analyze layers and components
    const layers = analyzeLayers(codebaseAnalysis);

    // Analyze dependencies
    const dependencies = analyzeDependencyRelationships(codebaseAnalysis);

    // Assess SOLID principles
    const principles = assessSOLIDPrinciples(codebaseAnalysis);

    // Detect violations
    const violations = detectArchitecturalViolations(codebaseAnalysis, principles);

    // Generate recommendations
    const recommendations = generateArchitecturalRecommendations(pattern, principles, violations);

    logger.info(`Architecture analysis completed. Pattern: ${pattern}`);

    return {
      pattern,
      layers,
      dependencies,
      principles,
      violations,
      recommendations,
    };
  } catch (error) {
    logger.error('Failed to analyze architecture:', error as Error);
    throw error;
  }
}

/**
 * Detect architectural pattern from codebase analysis
 */
function detectArchitecturalPattern(codebaseAnalysis: CodebaseAnalysis): string {
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
function analyzeLayers(codebaseAnalysis: CodebaseAnalysis): Array<{
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
function analyzeDependencyRelationships(codebaseAnalysis: CodebaseAnalysis): Array<{
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

/**
 * Assess SOLID principles compliance
 */
function assessSOLIDPrinciples(codebaseAnalysis: CodebaseAnalysis): {
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
function detectArchitecturalViolations(
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
function generateArchitecturalRecommendations(
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

/**
 * Detect architectural anti-patterns
 */
export async function detectAntiPatterns(analysis: ArchitectureAnalysis): Promise<{
  antiPatterns: Array<{
    name: string;
    description: string;
    locations: string[];
    impact: 'low' | 'medium' | 'high';
    solution: string;
  }>;
  riskScore: number;
}> {
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

  // Calculate risk score
  const riskScore = Math.min(100, antiPatterns.length * 25 +
    (100 - Math.min(...Object.values(analysis.principles))) / 2);

  return {
    antiPatterns,
    riskScore,
  };
}

/**
 * Generate architectural improvement roadmap
 */
export async function generateArchitecturalRoadmap(
  analysis: ArchitectureAnalysis
): Promise<{
  phases: Array<{
    name: string;
    duration: string;
    goals: string[];
    tasks: Array<{
      description: string;
      effort: 'low' | 'medium' | 'high';
      dependencies: string[];
    }>;
  }>;
  benefits: string[];
  risks: string[];
}> {
  logger.info('Generating architectural improvement roadmap');

  const phases: Array<{
    name: string;
    duration: string;
    goals: string[];
    tasks: Array<{
      description: string;
      effort: 'low' | 'medium' | 'high';
      dependencies: string[];
    }>;
  }> = [];

  // Phase 1: Foundation (Quick wins)
  const foundationTasks: Array<{
    description: string;
    effort: 'low' | 'medium' | 'high';
    dependencies: string[];
  }> = [];

  if (analysis.principles.single_responsibility < 70) {
    foundationTasks.push({
      description: 'Identify and refactor overly large files',
      effort: 'medium',
      dependencies: [],
    });
  }

  foundationTasks.push({
    description: 'Establish coding standards and linting rules',
    effort: 'low',
    dependencies: [],
  });

  foundationTasks.push({
    description: 'Add comprehensive documentation',
    effort: 'medium',
    dependencies: [],
  });

  if (foundationTasks.length > 0) {
    phases.push({
      name: 'Foundation & Quick Wins',
      duration: '2-4 weeks',
      goals: ['Improve code quality', 'Establish standards', 'Quick improvements'],
      tasks: foundationTasks,
    });
  }

  // Phase 2: Structural Improvements
  const structuralTasks: Array<{
    description: string;
    effort: 'low' | 'medium' | 'high';
    dependencies: string[];
  }> = [];

  if (analysis.principles.separation_of_concerns < 60) {
    structuralTasks.push({
      description: 'Implement clear architectural layers',
      effort: 'high',
      dependencies: ['Foundation & Quick Wins'],
    });
  }

  if (analysis.principles.dependency_inversion < 70) {
    structuralTasks.push({
      description: 'Implement dependency injection',
      effort: 'medium',
      dependencies: ['Foundation & Quick Wins'],
    });
  }

  // Add tasks based on violations
  analysis.violations.forEach(violation => {
    if (violation.severity === 'high') {
      structuralTasks.push({
        description: `Address ${violation.principle} violation: ${violation.description}`,
        effort: 'high',
        dependencies: ['Foundation & Quick Wins'],
      });
    }
  });

  if (structuralTasks.length > 0) {
    phases.push({
      name: 'Structural Improvements',
      duration: '4-8 weeks',
      goals: ['Improve architecture', 'Reduce coupling', 'Enhance maintainability'],
      tasks: structuralTasks,
    });
  }

  // Phase 3: Advanced Optimizations
  const advancedTasks: Array<{
    description: string;
    effort: 'low' | 'medium' | 'high';
    dependencies: string[];
  }> = [];

  if (analysis.principles.open_closed < 70) {
    advancedTasks.push({
      description: 'Implement extensible design patterns',
      effort: 'medium',
      dependencies: ['Structural Improvements'],
    });
  }

  advancedTasks.push({
    description: 'Implement comprehensive testing strategy',
    effort: 'high',
    dependencies: ['Structural Improvements'],
  });

  advancedTasks.push({
    description: 'Performance optimization and monitoring',
    effort: 'medium',
    dependencies: ['Structural Improvements'],
  });

  if (advancedTasks.length > 0) {
    phases.push({
      name: 'Advanced Optimizations',
      duration: '3-6 weeks',
      goals: ['Optimize performance', 'Enhance extensibility', 'Complete testing'],
      tasks: advancedTasks,
    });
  }

  // Benefits
  const benefits = [
    'Improved code maintainability and readability',
    'Reduced technical debt and development time',
    'Enhanced system reliability and stability',
    'Better team productivity and collaboration',
    'Easier onboarding for new developers',
    'Improved system performance and scalability',
  ];

  // Risks
  const risks = [
    'Temporary reduction in feature development velocity',
    'Potential introduction of bugs during refactoring',
    'Team resistance to architectural changes',
    'Resource allocation challenges',
    'Integration complexity with existing systems',
  ];

  return {
    phases,
    benefits,
    risks,
  };
}
