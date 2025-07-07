/**
 * POC Context Engine using Large Context Workflows
 * 
 * This POC demonstrates how to achieve context engine capabilities using:
 * - Gemini's 1M token context window via OpenRouter
 * - Existing workflow engine and MCP servers
 * - AI-driven analysis instead of traditional indexing
 */

import type { AIClient } from '../ai/client.js';
import type { OrchestratorManager } from '../orchestrator/manager.js';
import { createLogger } from '../utils/logging.js';
import path from 'path';
import fs from 'fs';
import { SmartFileSelector, FileSelectionRequest } from './file-selection/index.js';

const logger = createLogger('poc-context-engine');

/**
 * Context search request
 */
export interface ContextSearchRequest {
  query: string;
  maxTokens?: number;
  includeRelated?: boolean;
  fileTypes?: string[];
  directories?: string[];
}

/**
 * Context search result
 */
export interface ContextSearchResult {
  relevantFiles: Array<{
    path: string;
    relevanceScore: number;
    summary: string;
    keySymbols: string[];
  }>;
  codeSnippets: Array<{
    file: string;
    content: string;
    startLine: number;
    endLine: number;
    explanation: string;
  }>;
  relationships: Array<{
    from: string;
    to: string;
    type: 'imports' | 'calls' | 'extends' | 'implements';
    description: string;
  }>;
  summary: string;
  confidence: number;
}

/**
 * POC Context Engine that uses large context workflows
 */
export class POCContextEngine {
  private smartFileSelector: SmartFileSelector;

  constructor(
    private aiClient: AIClient,
    private orchestrator: OrchestratorManager
  ) {
    this.smartFileSelector = new SmartFileSelector();
  }

  /**
   * Test filesystem MCP directly to debug file loading issues
   */
  async testFilesystemMCP(): Promise<void> {
    logger.info('Testing filesystem MCP directly');

    const testFilePath = path.resolve(process.cwd(), 'src/intelligence/codebase.ts');

    try {
      logger.info('Testing file read with absolute path', { testFilePath });

      const result = await this.orchestrator.callTool('filesystem_read_file', {
        path: testFilePath
      });

      // Extract content using the same logic as loadFilesIntoContext
      let extractedContent: string | null = null;

      if (typeof result === 'string') {
        extractedContent = result;
      } else if (result && typeof result === 'object') {
        if ('content' in result && Array.isArray(result.content)) {
          extractedContent = result.content
            .filter((item: any) => item.type === 'text')
            .map((item: any) => item.text)
            .join('');
        } else if ('content' in result && typeof result.content === 'string') {
          extractedContent = result.content;
        }
      }

      logger.info('Direct filesystem test result', {
        resultType: typeof result,
        resultLength: typeof result === 'string' ? result.length : 'N/A',
        isString: typeof result === 'string',
        extractedContentLength: extractedContent?.length || 0,
        hasExtractedContent: extractedContent && extractedContent.length > 0,
        preview: extractedContent ? extractedContent.substring(0, 200) + '...' : 'No content extracted'
      });

      if (extractedContent && extractedContent.length > 0) {
        logger.info('✅ Filesystem MCP is working correctly - content extracted successfully');
      } else {
        logger.error('❌ Filesystem MCP is not returning file content properly');
      }

    } catch (error) {
      logger.error('❌ Filesystem MCP test failed', error as Error);
    }
  }

  /**
   * Search codebase using large context AI analysis
   */
  async searchCodebase(request: ContextSearchRequest): Promise<ContextSearchResult> {
    logger.info('Starting large context codebase search', { query: request.query });

    // First, test filesystem MCP if this is a debug run
    if (process.env.DEBUG_CONTEXT_ENGINE === 'true') {
      await this.testFilesystemMCP();
    }

    try {
      // Step 1: Discover relevant files using filesystem MCP
      const relevantFiles = await this.discoverRelevantFiles(request);
      
      // Step 2: Load files into large context (up to 1M tokens)
      const fileContents = await this.loadFilesIntoContext(relevantFiles, request.maxTokens || 800000);
      
      // Step 3: Analyze with Gemini using large context
      const analysis = await this.analyzeWithLargeContext(request.query, fileContents);
      
      // Step 4: Store insights in memory for future use
      await this.storeInsights(request.query, analysis);
      
      return analysis;

    } catch (error) {
      logger.error('Context search failed', error as Error);
      throw error;
    }
  }

  /**
   * Discover relevant files using smart file selection
   */
  private async discoverRelevantFiles(request: ContextSearchRequest): Promise<string[]> {
    try {
      logger.info('Using smart file selection for discovery', { query: request.query });

      // Create file selection request
      const selectionRequest: FileSelectionRequest = {
        query: request.query,
        maxFiles: 20, // Reasonable default for context loading
        fileTypes: request.fileTypes || ['.ts', '.js', '.tsx', '.jsx'],
        includeTests: false, // Default to excluding tests unless specifically requested
        workingDirectory: process.cwd()
      };

      // Use smart file selector
      const result = await this.smartFileSelector.selectFiles(selectionRequest);

      logger.info('Smart file selection completed', {
        strategy: result.strategy,
        filesSelected: result.files.length,
        totalScanned: result.totalScanned,
        executionTime: result.executionTime,
        topFiles: result.files.slice(0, 5).map(f => ({
          path: path.relative(process.cwd(), f.path),
          score: f.relevanceScore.toFixed(3),
          reason: f.reason
        }))
      });

      // Return absolute paths for consistency with existing code
      return result.files.map(f => path.resolve(f.path));

    } catch (error) {
      logger.error('Smart file selection failed, using fallback', error as Error);

      // Fallback to hardcoded intelligence files for backward compatibility
      const fallbackFiles = [
        'src/intelligence/codebase.ts',
        'src/intelligence/quality/analyzer.ts',
        'src/ai/workflow/context.ts',
        'src/context/poc-engine.ts',
        'src/context/workflows.ts'
      ];

      const existingFiles: string[] = [];
      for (const filePath of fallbackFiles) {
        try {
          const absolutePath = path.resolve(process.cwd(), filePath);
          await this.orchestrator.callTool('filesystem_read_file', { path: absolutePath });
          existingFiles.push(absolutePath);
        } catch (error) {
          logger.debug('Fallback file not found, skipping', { filePath });
        }
      }

      logger.info('Using fallback file selection', {
        filesFound: existingFiles.length,
        files: existingFiles.map(f => path.relative(process.cwd(), f))
      });

      return existingFiles;
    }
  }

  /**
   * Load files into context, respecting token limits
   */
  private async loadFilesIntoContext(
    filePaths: string[],
    maxTokens: number
  ): Promise<Array<{ path: string; content: string }>> {
    logger.info('Starting file loading into context', {
      totalFiles: filePaths.length,
      maxTokens,
      workingDirectory: process.cwd()
    });

    const fileContents: Array<{ path: string; content: string }> = [];
    let totalTokens = 0;
    const avgTokensPerChar = 0.25; // Rough estimate

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];

      try {
        // Ensure we're using absolute paths
        const absolutePath = path.isAbsolute(filePath) ?
          filePath :
          path.resolve(process.cwd(), filePath);

        logger.info('Attempting to read file', {
          index: i + 1,
          total: filePaths.length,
          filePath,
          absolutePath,
          exists: fs.existsSync(absolutePath)
        });

        // Call filesystem tool and log detailed results
        const toolResult = await this.orchestrator.callTool('filesystem_read_file', {
          path: absolutePath
        });

        // Extract content first, then log with proper information
        let content: string | null = null;

        if (typeof toolResult === 'string') {
          content = toolResult;
        } else if (toolResult && typeof toolResult === 'object') {
          // Handle MCP filesystem response format: { content: [{ type: "text", text: "..." }] }
          if ('content' in toolResult && Array.isArray(toolResult.content)) {
            // Extract text from content array
            content = toolResult.content
              .filter((item: any) => item.type === 'text')
              .map((item: any) => item.text)
              .join('');
          } else if ('content' in toolResult && typeof toolResult.content === 'string') {
            content = toolResult.content;
          } else if ('data' in toolResult) {
            content = String(toolResult.data);
          } else if ('result' in toolResult) {
            content = String(toolResult.result);
          } else {
            // Try to stringify the object as fallback
            content = JSON.stringify(toolResult);
          }
        }

        logger.info('Filesystem tool call result', {
          filePath,
          resultType: typeof toolResult,
          rawResultLength: typeof toolResult === 'string' ? toolResult.length : 'N/A',
          extractedContentLength: content?.length || 0,
          extractedPreview: content ? content.substring(0, 100) + '...' : 'No content extracted',
          isString: typeof toolResult === 'string',
          isNull: toolResult === null,
          isUndefined: toolResult === undefined
        });



        if (content && content.length > 0) {
          const estimatedTokens = content.length * avgTokensPerChar;

          logger.info('File content loaded successfully', {
            filePath,
            contentLength: content.length,
            estimatedTokens,
            totalTokensSoFar: totalTokens
          });

          if (totalTokens + estimatedTokens > maxTokens) {
            logger.info('Reached token limit, stopping file loading', {
              totalTokens,
              maxTokens,
              filesLoaded: fileContents.length,
              remainingFiles: filePaths.length - i
            });
            break;
          }

          fileContents.push({ path: filePath, content });
          totalTokens += estimatedTokens;
        } else {
          logger.warn('File content is empty or invalid', {
            filePath,
            absolutePath,
            toolResultType: typeof toolResult,
            contentType: typeof content,
            contentLength: content?.length || 0
          });
        }
      } catch (error) {
        logger.error('Failed to read file', error as Error, { filePath });
      }
    }

    logger.info('File loading completed', {
      filesRequested: filePaths.length,
      filesLoaded: fileContents.length,
      totalEstimatedTokens: totalTokens,
      averageFileSize: fileContents.length > 0 ? Math.round(totalTokens / fileContents.length) : 0
    });

    return fileContents;
  }

  /**
   * Analyze codebase using Gemini's large context window
   */
  private async analyzeWithLargeContext(
    query: string,
    fileContents: Array<{ path: string; content: string }>
  ): Promise<ContextSearchResult> {
    const analysisPrompt = `
    Analyze the codebase and respond with ONLY valid JSON.

    QUERY: "${query}"

    CODEBASE:
    ${fileContents.map(f => `
    === ${f.path} ===
    ${f.content}
    `).join('\n')}

    Return ONLY this JSON (no markdown, no explanations, keep strings concise):
    {
      "relevantFiles": [
        {
          "path": "src/file.ts",
          "relevanceScore": 0.95,
          "summary": "Brief description (max 80 chars)",
          "keySymbols": ["symbol1", "symbol2"]
        }
      ],
      "codeSnippets": [
        {
          "file": "src/file.ts",
          "content": "code snippet (max 150 chars)",
          "startLine": 10,
          "endLine": 25,
          "explanation": "Why relevant (max 80 chars)"
        }
      ],
      "relationships": [
        {
          "from": "src/file1.ts",
          "to": "src/file2.ts",
          "type": "imports",
          "description": "Brief description (max 80 chars)"
        }
      ],
      "summary": "Analysis summary (max 300 chars)",
      "confidence": 0.9
    }

    CRITICAL: Return ONLY valid JSON. Keep all text fields concise to prevent truncation.`;

    try {
      const response = await this.aiClient.generateResponse(analysisPrompt, {
        model: 'google/gemini-2.5-pro', // Use latest Gemini for large context
        maxTokens: 8000, // Increased for complete JSON response
        temperature: 0.1
      });

      // Clean up the response to extract JSON with robust parsing
      let cleanResponse = response.trim();

      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Try to find JSON in the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      // Attempt to fix common JSON issues before parsing
      try {
        return JSON.parse(cleanResponse);
      } catch (firstError) {
        logger.warn('Initial JSON parse failed, attempting to fix common issues', {
          error: firstError instanceof Error ? firstError.message : String(firstError),
          responseLength: cleanResponse.length
        });

        // Try to fix common JSON issues
        let fixedResponse = cleanResponse;

        // Fix trailing commas in arrays and objects
        fixedResponse = fixedResponse.replace(/,(\s*[}\]])/g, '$1');

        // Fix missing commas between array elements (common AI mistake)
        fixedResponse = fixedResponse.replace(/}(\s*){/g, '},$1{');
        fixedResponse = fixedResponse.replace(/](\s*)\[/g, '],$1[');
        fixedResponse = fixedResponse.replace(/"(\s*)"([^,}\]])/g, '"$1",$2');

        // Fix incomplete JSON by ensuring proper closing
        const openBraces = (fixedResponse.match(/\{/g) || []).length;
        const closeBraces = (fixedResponse.match(/\}/g) || []).length;
        const openBrackets = (fixedResponse.match(/\[/g) || []).length;
        const closeBrackets = (fixedResponse.match(/\]/g) || []).length;

        // Add missing closing braces/brackets
        for (let i = 0; i < openBraces - closeBraces; i++) {
          fixedResponse += '}';
        }
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          fixedResponse += ']';
        }

        try {
          const result = JSON.parse(fixedResponse);
          logger.info('Successfully fixed and parsed JSON response');
          return result;
        } catch (secondError) {
          logger.error('Failed to fix JSON, using fallback parsing', secondError as Error, {
            originalError: firstError instanceof Error ? firstError.message : String(firstError),
            responsePreview: cleanResponse.substring(0, 500) + '...'
          });

          // Last resort: try to extract partial valid JSON
          try {
            // Look for the main structure and try to parse what we can
            const partialMatch = cleanResponse.match(/\{[^}]*"relevantFiles"[^}]*\[[^\]]*\]/);
            if (partialMatch) {
              // Create a minimal valid response
              return {
                relevantFiles: [],
                codeSnippets: [],
                relationships: [],
                summary: "Analysis completed but JSON parsing encountered issues. Raw response was processed successfully.",
                confidence: 0.7
              };
            }
          } catch (fallbackError) {
            // If all else fails, throw the original error
            throw firstError;
          }

          throw firstError;
        }
      }
    } catch (error) {
      logger.error('Large context analysis failed', error as Error);
      throw new Error(`Context analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Store analysis insights in memory MCP for future use
   */
  private async storeInsights(query: string, analysis: ContextSearchResult): Promise<void> {
    try {
      await this.orchestrator.callTool('memory_create_entity', {
        name: `codebase_analysis_${Date.now()}`,
        entityType: 'analysis',
        observations: [
          `Query: ${query}`,
          `Summary: ${analysis.summary}`,
          `Relevant files: ${analysis.relevantFiles.map(f => f.path).join(', ')}`,
          `Confidence: ${analysis.confidence}`
        ]
      });

      logger.info('Stored analysis insights in memory', { query });
    } catch (error) {
      logger.warn('Failed to store insights', error as Error);
    }
  }

  /**
   * Check memory for previous similar analyses
   */
  async checkMemoryForSimilarAnalysis(query: string): Promise<any> {
    try {
      const memories = await this.orchestrator.callTool('memory_search', {
        query: query,
        entityTypes: ['analysis']
      });

      return memories;
    } catch (error) {
      logger.warn('Memory search failed', error as Error);
      return null;
    }
  }
}
