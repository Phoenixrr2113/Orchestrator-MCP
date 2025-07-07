/**
 * Context Engine Validation Test
 * 
 * Tests the POC context engine against known good results from 's context engine
 * to validate accuracy and identify areas for improvement
 */

import { POCContextEngine } from './context-engine.js';
import { ContextEngineIntegration } from './integration.js';
import { createAIClient } from '../ai/client.js';
import { createLogger } from '../utils/logging.js';

const logger = createLogger('context-validation');

/**
 * Known good result from 's context engine for comparison
 */
const _BASELINE_RESULT = `
The following code sections were retrieved:
Path: src/intelligence/codebase.ts
     5	
     6	import { createLogger } from '../utils/logging.js';
     7	
     8	const logger = createLogger('codebase-intelligence');
     9	
    10	/**
    11	 * Codebase analysis result
    12	 */
    13	export interface CodebaseAnalysis {
    14	  structure: {
    15	    directories: string[];
    16	    files: string[];
    17	    languages: Record<string, number>;
    18	  };
    19	  complexity: {
    20	    totalLines: number;
    21	    averageFileSize: number;
    22	    largestFiles: Array<{ path: string; lines: number }>;
    23	  };
    24	  patterns: {
    25	    frameworks: string[];
    26	    architecturalPatterns: string[];
    27	    designPatterns: string[];
    28	  };
    29	  dependencies: {
    30	    external: string[];
    31	    internal: string[];
    32	    circular: string[];
    33	  };
    34	  quality: {
    35	    score: number;
    36	    issues: Array<{ type: string; severity: string; description: string }>;
    37	    suggestions: string[];
    38	  };
    39	}
...
    46	
    47	  try {
    48	    // Get directory structure
    49	    const structure = await analyzeStructure(rootPath);
    50	
    51	    // Analyze complexity metrics
    52	    const complexity = await analyzeComplexity(structure.files, rootPath);
    53	
    54	    // Detect patterns and frameworks
    55	    const patterns = await detectPatterns(structure.files, rootPath);
    56	
    57	    // Analyze dependencies
    58	    const dependencies = await analyzeDependencies(rootPath);
    59	
    60	    // Calculate quality score
    61	    const quality = await calculateQualityScore(structure, complexity, patterns);
    62	
    63	    logger.info(\`Codebase analysis completed for \${structure.files.length} files\`);
    64	
    65	    return {
    66	      structure,
    67	      complexity,
    68	      patterns,
    69	      dependencies,
    70	      quality,
    71	    };
    72	  } catch (error) {
    73	    logger.error('Failed to analyze codebase:', error as Error);
    74	    throw error;
    75	  }
    76	}
    77	
    78	/**
    79	 * Analyze directory structure and file organization
    80	 */
    81	async function analyzeStructure(_rootPath: string): Promise<{
    82	  directories: string[];
    83	  files: string[];
    84	  languages: Record<string, number>;
    85	}> {
    86	  // Basic structure analysis - in a real implementation, this would use the filesystem MCP server
    87	  // For now, provide reasonable defaults based on common project patterns
    88	
    89	  const directories = [
    90	    'src', 'src/ai', 'src/config', 'src/intelligence', 'src/orchestrator',
    91	    'src/server', 'src/servers', 'src/types', 'src/utils',
    92	    'docs', 'plans', 'examples'
    93	  ];
    94	
    95	  const files = [
    96	    'package.json', 'tsconfig.json', 'README.md', 'MASTER_PLAN.md',
    97	    'src/index.ts', 'src/ai/client.ts', 'src/orchestrator/manager.ts'
    98	  ];
    99	
   100	  // Estimate language distribution based on project type
   101	  const languages = {
   102	    typescript: 85,
   103	    javascript: 5,
   104	    json: 8,
   105	    markdown: 2
   106	  };
   107	
   108	  return { directories, files, languages };
   109	}
...
Path: src/intelligence/quality/analyzer.ts
     1	/**
     2	 * Main quality analyzer
     3	 */
     4	
     5	import type { QualityAssessment } from './types.js';
     6	import { analyzeFileStructure, analyzeSecurityIssues, analyzeMaintainability } from './analyzers.js';
     7	import { calculateTestabilityScore, calculateOverallScore, calculateTestCoverage, calculateTechnicalDebt } from './metrics.js';
     8	import { generateQualityRecommendations } from './suggestions.js';
     9	import { createLogger } from '../../utils/logging.js';
    10	
    11	const logger = createLogger('quality-analyzer');
    12	
    13	/**
    14	 * Assess code quality across multiple dimensions
    15	 */
    16	export async function assessCodeQuality(filePaths: string[]): Promise<QualityAssessment> {
    17	  logger.info(\`Assessing code quality for \${filePaths.length} files\`);
...
    39	
    40	    // Analyze file structure and complexity
    41	    const structureAnalysis = await analyzeFileStructure(filePaths);
    42	    
    43	    // Run security analysis (would use Semgrep MCP server)
    44	    const securityAnalysis = await analyzeSecurityIssues(filePaths);
    45	    
    46	    // Analyze code patterns and maintainability
    47	    const maintainabilityAnalysis = await analyzeMaintainability(filePaths);
    48	    
    49	    // Calculate scores and combine results
    50	    assessment.categories.maintainability = maintainabilityAnalysis.score;
    51	    assessment.categories.security = securityAnalysis.score;
    52	    assessment.categories.readability = structureAnalysis.readabilityScore;
    53	    assessment.categories.testability = calculateTestabilityScore(filePaths);
    54	    assessment.categories.performance = 75; // Placeholder
...
`;

/**
 * Test query that we'll use for validation
 */
const TEST_QUERY = "Show me the current intelligence layer implementation, specifically the codebase analysis, quality assessment, and any existing context management or indexing capabilities. I want to understand what's already implemented vs what's placeholder code.";

/**
 * Validation test suite
 */
export class ContextEngineValidationTest {
  private pocEngine: POCContextEngine;
  private integration: ContextEngineIntegration;

  constructor() {
    // This would be initialized with real AI client and orchestrator in practice
    // For testing, we'll mock these dependencies
    const mockAIClient = this.createMockAIClient();
    const mockOrchestrator = this.createMockOrchestrator();
    
    this.pocEngine = new POCContextEngine(mockAIClient, mockOrchestrator);
    this.integration = new ContextEngineIntegration(mockAIClient, mockOrchestrator);
  }

  /**
   * Run the validation test
   */
  async runValidationTest(): Promise<ValidationResult> {
    logger.info('Starting context engine validation test');

    try {
      // Test 1: POC Engine Search
      const pocResult = await this.testPOCEngine();
      
      // Test 2: Integration Tool Call
      const integrationResult = await this.testIntegration();
      
      // Test 3: Compare against baseline
      const comparison = this.compareWithBaseline(pocResult, _BASELINE_RESULT);
      
      // Test 4: Performance metrics
      const performance = await this.measurePerformance();

      const validationResult: ValidationResult = {
        pocEngineTest: pocResult,
        integrationTest: integrationResult,
        baselineComparison: comparison,
        performance,
        overallScore: this.calculateOverallScore(comparison, performance),
        recommendations: this.generateRecommendations(comparison, performance)
      };

      logger.info('Validation test completed', { 
        overallScore: validationResult.overallScore,
        recommendations: validationResult.recommendations.length
      });

      return validationResult;

    } catch (error) {
      logger.error('Validation test failed', error as Error);
      throw error;
    }
  }

  /**
   * Test the POC engine directly
   */
  private async testPOCEngine(): Promise<any> {
    logger.info('Testing POC engine');

    const result = await this.pocEngine.searchCodebase({
      query: TEST_QUERY,
      maxTokens: 800000,
      includeRelated: true
    });

    return {
      success: true,
      relevantFilesCount: result.relevantFiles.length,
      codeSnippetsCount: result.codeSnippets.length,
      relationshipsCount: result.relationships.length,
      confidence: result.confidence,
      summary: result.summary
    };
  }

  /**
   * Test the integration layer
   */
  private async testIntegration(): Promise<any> {
    logger.info('Testing integration layer');

    const result = await this.integration.handleToolCall('analyze_intelligence_layer', {
      includeQuality: true,
      includeArchitecture: true
    });

    return {
      success: true,
      resultType: result.type,
      hasContent: !!result.text,
      contentLength: result.text?.length || 0
    };
  }

  /**
   * Compare POC result with  baseline
   */
  private compareWithBaseline(pocResult: any, baseline: string): ComparisonResult {
    // Extract key information from baseline
    const baselineFiles = this.extractFilesFromBaseline(baseline);
    const baselineSymbols = this.extractSymbolsFromBaseline(baseline);
    
    // Compare with POC result
    const fileOverlap = this.calculateFileOverlap(pocResult.relevantFiles || [], baselineFiles);
    const symbolOverlap = this.calculateSymbolOverlap(pocResult.codeSnippets || [], baselineSymbols);
    
    return {
      fileAccuracy: fileOverlap,
      symbolAccuracy: symbolOverlap,
      confidenceScore: pocResult.confidence || 0,
      missingFiles: baselineFiles.filter((f: string) => 
        !pocResult.relevantFiles?.some((rf: any) => rf.path.includes(f))
      ),
      extraFiles: pocResult.relevantFiles?.filter((rf: any) => 
        !baselineFiles.some((f: string) => rf.path.includes(f))
      ) || [],
      overallAccuracy: (fileOverlap + symbolOverlap) / 2
    };
  }

  /**
   * Measure performance metrics
   */
  private async measurePerformance(): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    // Simulate performance test
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = Date.now();
    
    return {
      executionTime: endTime - startTime,
      tokensUsed: 750000, // Estimated
      memoryUsage: process.memoryUsage().heapUsed,
      filesProcessed: 25 // Estimated
    };
  }

  /**
   * Calculate overall validation score
   */
  private calculateOverallScore(comparison: ComparisonResult, performance: PerformanceMetrics): number {
    const accuracyWeight = 0.6;
    const performanceWeight = 0.4;
    
    const accuracyScore = comparison.overallAccuracy;
    const performanceScore = Math.min(1, 30000 / performance.executionTime); // 30s baseline
    
    return (accuracyScore * accuracyWeight) + (performanceScore * performanceWeight);
  }

  /**
   * Generate improvement recommendations
   */
  private generateRecommendations(comparison: ComparisonResult, performance: PerformanceMetrics): string[] {
    const recommendations: string[] = [];
    
    if (comparison.overallAccuracy < 0.8) {
      recommendations.push('Improve file discovery algorithm to better match relevant files');
    }
    
    if (comparison.fileAccuracy < 0.7) {
      recommendations.push('Enhance file pattern matching for intelligence layer components');
    }
    
    if (performance.executionTime > 60000) {
      recommendations.push('Optimize large context loading to reduce execution time');
    }
    
    if (comparison.missingFiles.length > 0) {
      recommendations.push(`Include missing key files: ${comparison.missingFiles.join(', ')}`);
    }
    
    return recommendations;
  }

  // Helper methods for mocking and extraction
  private createMockAIClient(): any {
    return {
      generateResponse: async (prompt: string) => {
        // Mock AI response for testing
        return JSON.stringify({
          relevantFiles: [
            { path: 'src/intelligence/codebase.ts', relevanceScore: 0.95, summary: 'Main codebase analysis', keySymbols: ['analyzeCodebase'] },
            { path: 'src/intelligence/quality/analyzer.ts', relevanceScore: 0.90, summary: 'Quality assessment', keySymbols: ['assessCodeQuality'] }
          ],
          codeSnippets: [
            { file: 'src/intelligence/codebase.ts', content: 'export async function analyzeCodebase', startLine: 45, endLine: 76, explanation: 'Main analysis function' }
          ],
          relationships: [
            { from: 'src/intelligence/codebase.ts', to: 'src/intelligence/quality/analyzer.ts', type: 'imports', description: 'Uses quality assessment' }
          ],
          summary: 'Found intelligence layer with placeholder implementations',
          confidence: 0.85
        });
      }
    };
  }

  private createMockOrchestrator(): any {
    return {
      callTool: async (tool: string, params: any) => {
        // Mock orchestrator responses
        if (tool === 'filesystem_search') {
          return ['src/intelligence/codebase.ts', 'src/intelligence/quality/analyzer.ts'];
        }
        if (tool === 'filesystem_read_file') {
          return 'export async function analyzeCodebase() { /* implementation */ }';
        }
        return {};
      }
    };
  }

  private extractFilesFromBaseline(baseline: string): string[] {
    const fileMatches = baseline.match(/Path: ([^\n]+)/g) || [];
    return fileMatches.map(match => match.replace('Path: ', ''));
  }

  private extractSymbolsFromBaseline(baseline: string): string[] {
    const symbolMatches = baseline.match(/export (?:async )?(?:function|class|interface) (\w+)/g) || [];
    return symbolMatches.map(match => match.split(' ').pop() || '');
  }

  private calculateFileOverlap(pocFiles: any[], baselineFiles: string[]): number {
    if (baselineFiles.length === 0) return 1;
    
    const matches = baselineFiles.filter(bf => 
      pocFiles.some(pf => pf.path && pf.path.includes(bf))
    );
    
    return matches.length / baselineFiles.length;
  }

  private calculateSymbolOverlap(pocSnippets: any[], baselineSymbols: string[]): number {
    if (baselineSymbols.length === 0) return 1;
    
    const pocSymbols = pocSnippets.flatMap(snippet => 
      snippet.keySymbols || this.extractSymbolsFromCode(snippet.content || '')
    );
    
    const matches = baselineSymbols.filter(bs => 
      pocSymbols.some(ps => ps.includes(bs))
    );
    
    return matches.length / baselineSymbols.length;
  }

  private extractSymbolsFromCode(code: string): string[] {
    const matches = code.match(/(?:function|class|interface) (\w+)/g) || [];
    return matches.map(match => match.split(' ')[1]);
  }
}

// Type definitions for validation results
interface ValidationResult {
  pocEngineTest: any;
  integrationTest: any;
  baselineComparison: ComparisonResult;
  performance: PerformanceMetrics;
  overallScore: number;
  recommendations: string[];
}

interface ComparisonResult {
  fileAccuracy: number;
  symbolAccuracy: number;
  confidenceScore: number;
  missingFiles: string[];
  extraFiles: any[];
  overallAccuracy: number;
}

interface PerformanceMetrics {
  executionTime: number;
  tokensUsed: number;
  memoryUsage: number;
  filesProcessed: number;
}
