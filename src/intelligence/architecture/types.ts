/**
 * Architecture analysis types and interfaces
 */

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
 * Anti-pattern detection result
 */
export interface AntiPatternResult {
  antiPatterns: Array<{
    name: string;
    description: string;
    locations: string[];
    impact: 'low' | 'medium' | 'high';
    solution: string;
  }>;
  riskScore: number;
}

/**
 * Architectural roadmap
 */
export interface ArchitecturalRoadmap {
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
}
