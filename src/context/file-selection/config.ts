/**
 * Configuration for Smart File Selection
 */

import { QueryIntent, FileSelectionStrategy } from './types.js';

/**
 * Default configuration for smart file selection
 */
export interface SmartFileSelectionConfig {
  // Global settings
  defaultMaxFiles: number;
  defaultFileTypes: string[];
  performanceTargetMs: number;
  
  // Strategy overrides
  strategyOverrides?: Partial<Record<QueryIntent, Partial<FileSelectionStrategy>>>;
  
  // Scoring weights
  scoringWeights: {
    nameMatch: number;
    directoryMatch: number;
    symbolMatch: number;
    importRelevance: number;
    recentActivity: number;
    fileSize: number;
  };
  
  // Directory patterns for different project types
  projectPatterns: {
    [key: string]: {
      directories: string[];
      fileTypes: string[];
      excludePatterns: string[];
    };
  };
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: SmartFileSelectionConfig = {
  defaultMaxFiles: 20,
  defaultFileTypes: ['.ts', '.js', '.tsx', '.jsx'],
  performanceTargetMs: 2000,
  
  scoringWeights: {
    nameMatch: 0.3,
    directoryMatch: 0.2,
    symbolMatch: 0.3,
    importRelevance: 0.15,
    recentActivity: 0.03,
    fileSize: 0.02
  },
  
  projectPatterns: {
    // Next.js/React project
    nextjs: {
      directories: ['src/', 'pages/', 'app/', 'components/', 'lib/', 'utils/'],
      fileTypes: ['.ts', '.tsx', '.js', '.jsx'],
      excludePatterns: ['*.test.*', '*.spec.*', 'node_modules/', '.next/']
    },
    
    // Node.js backend project
    nodejs: {
      directories: ['src/', 'lib/', 'routes/', 'controllers/', 'services/', 'models/'],
      fileTypes: ['.ts', '.js'],
      excludePatterns: ['*.test.*', '*.spec.*', 'node_modules/', 'dist/']
    },
    
    // Express.js API project
    express: {
      directories: ['src/', 'routes/', 'controllers/', 'middleware/', 'models/', 'services/'],
      fileTypes: ['.ts', '.js'],
      excludePatterns: ['*.test.*', '*.spec.*', 'node_modules/']
    },
    
    // Generic TypeScript project
    typescript: {
      directories: ['src/', 'lib/', 'types/'],
      fileTypes: ['.ts', '.tsx'],
      excludePatterns: ['*.test.*', '*.spec.*', 'node_modules/', 'dist/', 'build/']
    },
    
    // Python project
    python: {
      directories: ['src/', 'app/', 'lib/', 'models/', 'views/', 'controllers/'],
      fileTypes: ['.py'],
      excludePatterns: ['*test*.py', '__pycache__/', '*.pyc', 'venv/', '.venv/']
    }
  }
};

/**
 * Configuration for specific use cases
 */
export const USE_CASE_CONFIGS = {
  // Configuration optimized for debugging
  debugging: {
    defaultMaxFiles: 8,
    strategyOverrides: {
      [QueryIntent.BUG_INVESTIGATION]: {
        includeTests: true,
        prioritizeRecent: true,
        maxFiles: 8
      }
    },
    scoringWeights: {
      nameMatch: 0.25,
      directoryMatch: 0.15,
      symbolMatch: 0.35,
      importRelevance: 0.15,
      recentActivity: 0.08,
      fileSize: 0.02
    }
  },
  
  // Configuration optimized for architecture analysis
  architecture: {
    defaultMaxFiles: 25,
    strategyOverrides: {
      [QueryIntent.ARCHITECTURE_ANALYSIS]: {
        maxFiles: 25,
        prioritize: ['index.ts', 'main.ts', 'app.ts', 'server.ts', 'config.ts']
      }
    },
    scoringWeights: {
      nameMatch: 0.35,
      directoryMatch: 0.25,
      symbolMatch: 0.25,
      importRelevance: 0.12,
      recentActivity: 0.02,
      fileSize: 0.01
    }
  },
  
  // Configuration optimized for security audits
  security: {
    defaultMaxFiles: 15,
    strategyOverrides: {
      [QueryIntent.SECURITY_AUDIT]: {
        directories: ['src/auth/', 'src/security/', 'src/api/', 'src/middleware/', 'src/routes/'],
        keywords: ['auth', 'security', 'validate', 'sanitize', 'permission', 'jwt', 'token'],
        maxFiles: 15
      }
    },
    scoringWeights: {
      nameMatch: 0.4,
      directoryMatch: 0.3,
      symbolMatch: 0.25,
      importRelevance: 0.05,
      recentActivity: 0.0,
      fileSize: 0.0
    }
  }
};

/**
 * Auto-detect project type based on file structure
 */
export async function detectProjectType(workingDirectory: string): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    // Check for package.json to determine project type
    const packageJsonPath = path.join(workingDirectory, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    // Check dependencies for framework detection
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.next || deps['@next/core']) return 'nextjs';
    if (deps.express) return 'express';
    if (deps.react && !deps.next) return 'typescript'; // React without Next.js
    if (deps.typescript || packageJson.main?.endsWith('.ts')) return 'typescript';
    
    return 'nodejs';
    
  } catch (error) {
    // Check for Python files
    try {
      const files = await fs.readdir(workingDirectory);
      if (files.some(f => f.endsWith('.py'))) return 'python';
    } catch (e) {
      // Ignore
    }
    
    // Default to Node.js
    return 'nodejs';
  }
}

/**
 * Get configuration for project type
 */
export function getConfigForProject(projectType: string): Partial<SmartFileSelectionConfig> {
  const projectPattern = DEFAULT_CONFIG.projectPatterns[projectType];
  if (!projectPattern) {
    return {};
  }
  
  return {
    defaultFileTypes: projectPattern.fileTypes,
    projectPatterns: {
      [projectType]: projectPattern
    }
  };
}

/**
 * Merge configurations
 */
export function mergeConfigs(
  base: SmartFileSelectionConfig,
  override: Partial<SmartFileSelectionConfig>
): SmartFileSelectionConfig {
  return {
    ...base,
    ...override,
    scoringWeights: {
      ...base.scoringWeights,
      ...override.scoringWeights
    },
    strategyOverrides: {
      ...base.strategyOverrides,
      ...override.strategyOverrides
    },
    projectPatterns: {
      ...base.projectPatterns,
      ...override.projectPatterns
    }
  };
}
