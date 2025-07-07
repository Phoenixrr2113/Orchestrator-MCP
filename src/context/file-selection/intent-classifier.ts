/**
 * Query Intent Classification for Smart File Selection
 */

import { QueryIntent, QueryIntentClassifier, FileSelectionStrategy } from './types.js';

/**
 * Intent classification patterns and strategies
 */
const INTENT_PATTERNS = {
  [QueryIntent.ARCHITECTURE_ANALYSIS]: [
    'architecture', 'design pattern', 'structure', 'organization', 'modules',
    'components', 'layers', 'dependencies', 'system design', 'overview'
  ],
  [QueryIntent.BUG_INVESTIGATION]: [
    'bug', 'error', 'issue', 'problem', 'debug', 'fix', 'broken', 'failing',
    'exception', 'crash', 'not working', 'investigate'
  ],
  [QueryIntent.FEATURE_IMPLEMENTATION]: [
    'implement', 'add', 'create', 'build', 'develop', 'feature', 'functionality',
    'new', 'enhancement', 'requirement'
  ],
  [QueryIntent.CODE_QUALITY]: [
    'quality', 'refactor', 'clean', 'improve', 'optimize', 'best practices',
    'code smell', 'maintainability', 'readability', 'standards'
  ],
  [QueryIntent.SECURITY_AUDIT]: [
    'security', 'vulnerability', 'auth', 'authentication', 'authorization',
    'validate', 'sanitize', 'secure', 'permission', 'access control'
  ],
  [QueryIntent.PERFORMANCE_ANALYSIS]: [
    'performance', 'slow', 'optimize', 'speed', 'memory', 'cpu', 'bottleneck',
    'profiling', 'benchmark', 'efficiency'
  ],
  [QueryIntent.INTELLIGENCE_LAYER]: [
    'intelligence', 'ai', 'context', 'analysis', 'codebase analysis',
    'quality assessment', 'intelligence layer'
  ],
  [QueryIntent.API_ANALYSIS]: [
    'api', 'endpoint', 'route', 'rest', 'graphql', 'service', 'controller',
    'request', 'response', 'http'
  ],
  [QueryIntent.DATABASE_ANALYSIS]: [
    'database', 'db', 'sql', 'query', 'schema', 'model', 'migration',
    'orm', 'data', 'table'
  ],
  [QueryIntent.UI_ANALYSIS]: [
    'ui', 'interface', 'component', 'view', 'page', 'frontend', 'react',
    'angular', 'vue', 'css', 'style'
  ]
};

/**
 * File selection strategies for each intent
 */
const INTENT_STRATEGIES: Record<QueryIntent, FileSelectionStrategy> = {
  [QueryIntent.ARCHITECTURE_ANALYSIS]: {
    directories: ['src/'],
    fileTypes: ['.ts', '.js', '.tsx', '.jsx'],
    prioritize: ['index.ts', 'main.ts', 'app.ts', 'server.ts'],
    maxFiles: 15,
    excludePatterns: ['*.test.*', '*.spec.*']
  },
  [QueryIntent.BUG_INVESTIGATION]: {
    directories: ['src/', 'tests/'],
    fileTypes: ['.ts', '.js', '.tsx', '.jsx'],
    includeTests: true,
    prioritizeRecent: true,
    maxFiles: 8
  },
  [QueryIntent.FEATURE_IMPLEMENTATION]: {
    directories: ['src/'],
    fileTypes: ['.ts', '.js', '.tsx', '.jsx'],
    maxFiles: 12,
    prioritizeRecent: true
  },
  [QueryIntent.CODE_QUALITY]: {
    directories: ['src/'],
    fileTypes: ['.ts', '.js', '.tsx', '.jsx'],
    maxFiles: 20,
    includeTests: true
  },
  [QueryIntent.SECURITY_AUDIT]: {
    directories: ['src/auth/', 'src/security/', 'src/api/', 'src/middleware/'],
    fileTypes: ['.ts', '.js'],
    keywords: ['auth', 'security', 'validate', 'sanitize', 'permission'],
    maxFiles: 12
  },
  [QueryIntent.PERFORMANCE_ANALYSIS]: {
    directories: ['src/'],
    fileTypes: ['.ts', '.js', '.tsx', '.jsx'],
    keywords: ['performance', 'cache', 'optimize', 'async'],
    maxFiles: 10
  },
  [QueryIntent.INTELLIGENCE_LAYER]: {
    directories: ['src/intelligence/', 'src/ai/', 'src/context/'],
    fileTypes: ['.ts', '.js'],
    prioritize: ['codebase.ts', 'analyzer.ts', 'context.ts', 'engine.ts'],
    maxFiles: 15
  },
  [QueryIntent.API_ANALYSIS]: {
    directories: ['src/api/', 'src/routes/', 'src/endpoints/', 'src/controllers/'],
    fileTypes: ['.ts', '.js'],
    keywords: ['api', 'route', 'endpoint', 'controller'],
    maxFiles: 12
  },
  [QueryIntent.DATABASE_ANALYSIS]: {
    directories: ['src/db/', 'src/models/', 'src/schema/', 'src/migrations/'],
    fileTypes: ['.ts', '.js', '.sql'],
    keywords: ['model', 'schema', 'migration', 'query'],
    maxFiles: 10
  },
  [QueryIntent.UI_ANALYSIS]: {
    directories: ['src/components/', 'src/pages/', 'src/views/', 'src/ui/'],
    fileTypes: ['.tsx', '.jsx', '.ts', '.js', '.css', '.scss'],
    keywords: ['component', 'page', 'view', 'ui'],
    maxFiles: 15
  },
  [QueryIntent.GENERAL]: {
    directories: ['src/'],
    fileTypes: ['.ts', '.js', '.tsx', '.jsx'],
    maxFiles: 20
  }
};

/**
 * Implementation of query intent classifier
 */
export class SmartQueryIntentClassifier implements QueryIntentClassifier {
  
  /**
   * Classify the intent of a query
   */
  classifyIntent(query: string): QueryIntent {
    const normalizedQuery = query.toLowerCase();
    
    // Score each intent based on keyword matches
    const intentScores = new Map<QueryIntent, number>();
    
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      const score = patterns.reduce((acc, pattern) => {
        if (normalizedQuery.includes(pattern.toLowerCase())) {
          return acc + 1;
        }
        return acc;
      }, 0);
      
      if (score > 0) {
        intentScores.set(intent as QueryIntent, score);
      }
    }
    
    // Return the intent with the highest score
    if (intentScores.size > 0) {
      const sortedIntents = Array.from(intentScores.entries())
        .sort(([, a], [, b]) => b - a);
      return sortedIntents[0][0];
    }
    
    return QueryIntent.GENERAL;
  }
  
  /**
   * Get file selection strategy for an intent
   */
  getStrategyForIntent(intent: QueryIntent): FileSelectionStrategy {
    return INTENT_STRATEGIES[intent] || INTENT_STRATEGIES[QueryIntent.GENERAL];
  }
  
  /**
   * Extract keywords from query
   */
  extractKeywords(query: string): string[] {
    const normalizedQuery = query.toLowerCase();
    
    // Remove common stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'can', 'may', 'might', 'this', 'that', 'these', 'those', 'i', 'you',
      'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);
    
    return normalizedQuery
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10); // Limit to top 10 keywords
  }
  
  /**
   * Extract potential symbols/identifiers from query
   */
  extractSymbols(query: string): string[] {
    // Look for camelCase, PascalCase, snake_case, and kebab-case identifiers
    const symbolPattern = /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g;
    const matches = query.match(symbolPattern) || [];
    
    return matches
      .filter(match => match.length > 2)
      .filter(match => !/^(the|and|for|with|from|this|that)$/i.test(match))
      .slice(0, 5); // Limit to top 5 symbols
  }
}
