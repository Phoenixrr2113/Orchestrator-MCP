/**
 * Intelligence layer handlers
 */

import { createLogger } from '../../utils/logging.js';

const logger = createLogger('intelligence-handlers');

/**
 * Handle codebase analysis
 */
export async function handleAnalyzeCodebase(args: any) {
  try {
    const { analyzeCodebase } = await import('../../intelligence/codebase.js');
    const rootPath = args.rootPath || '.';
    
    logger.info(`Analyzing codebase at: ${rootPath}`);
    const analysis = await analyzeCodebase(rootPath);
    
    return {
      content: [
        {
          type: 'text',
          text: `Codebase Analysis Results:\n\n${JSON.stringify(analysis, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to analyze codebase:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error analyzing codebase: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Handle architectural insights extraction
 */
export async function handleExtractArchitecturalInsights(args: any) {
  try {
    const { analyzeCodebase, extractArchitecturalInsights } = await import('../../intelligence/codebase.js');
    const rootPath = args.rootPath || '.';
    
    logger.info(`Extracting architectural insights for: ${rootPath}`);
    
    // First analyze the codebase
    const analysis = await analyzeCodebase(rootPath);
    
    // Then extract insights
    const insights = await extractArchitecturalInsights(analysis);
    
    return {
      content: [
        {
          type: 'text',
          text: `Architectural Insights:\n\n${JSON.stringify(insights, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to extract architectural insights:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error extracting insights: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Handle code quality assessment
 */
export async function handleAssessCodeQuality(args: any) {
  try {
    const { assessCodeQuality } = await import('../../intelligence/quality.js');
    const filePaths = args.filePaths || [];
    
    logger.info(`Assessing code quality for ${filePaths.length} files`);
    const assessment = await assessCodeQuality(filePaths);
    
    return {
      content: [
        {
          type: 'text',
          text: `Code Quality Assessment:\n\n${JSON.stringify(assessment, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to assess code quality:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error assessing quality: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Handle architecture analysis
 */
export async function handleAnalyzeArchitecture(args: any) {
  try {
    const { analyzeArchitecture } = await import('../../intelligence/architecture.js');
    const rootPath = args.rootPath || '.';
    
    logger.info(`Analyzing architecture for: ${rootPath}`);
    const analysis = await analyzeArchitecture(rootPath);
    
    return {
      content: [
        {
          type: 'text',
          text: `Architecture Analysis:\n\n${JSON.stringify(analysis, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to analyze architecture:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error analyzing architecture: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Handle anti-pattern detection
 */
export async function handleDetectAntiPatterns(args: any) {
  try {
    const { analyzeArchitecture, detectAntiPatterns } = await import('../../intelligence/architecture.js');
    const rootPath = args.rootPath || '.';
    
    logger.info(`Detecting anti-patterns for: ${rootPath}`);
    
    // First analyze architecture
    const analysis = await analyzeArchitecture(rootPath);
    
    // Then detect anti-patterns
    const antiPatterns = await detectAntiPatterns(analysis);
    
    return {
      content: [
        {
          type: 'text',
          text: `Anti-Pattern Detection:\n\n${JSON.stringify(antiPatterns, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to detect anti-patterns:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error detecting anti-patterns: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

/**
 * Handle architectural roadmap generation
 */
export async function handleGenerateArchitecturalRoadmap(args: any) {
  try {
    const { analyzeArchitecture, generateArchitecturalRoadmap } = await import('../../intelligence/architecture.js');
    const rootPath = args.rootPath || '.';
    
    logger.info(`Generating architectural roadmap for: ${rootPath}`);
    
    // First analyze architecture
    const analysis = await analyzeArchitecture(rootPath);
    
    // Then generate roadmap
    const roadmap = await generateArchitecturalRoadmap(analysis);
    
    return {
      content: [
        {
          type: 'text',
          text: `Architectural Roadmap:\n\n${JSON.stringify(roadmap, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to generate architectural roadmap:', error as Error);
    return {
      content: [
        {
          type: 'text',
          text: `Error generating roadmap: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}
