/**
 * Smart File Selector - Main orchestrator for intelligent file selection
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  FileSelectionRequest, 
  FileSelectionResult, 
  ScoredFile, 
  FileRelevanceSignals,
  QueryIntent 
} from './types.js';
import { SmartQueryIntentClassifier } from './intent-classifier.js';
import { SmartFileDiscovery } from './file-discovery.js';
import { SmartRelevanceAnalyzer } from './relevance-analyzer.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('smart-file-selector');

/**
 * Main smart file selector that combines all intelligence
 */
export class SmartFileSelector {
  private intentClassifier: SmartQueryIntentClassifier;
  private fileDiscovery: SmartFileDiscovery;
  private relevanceAnalyzer: SmartRelevanceAnalyzer;
  
  constructor(workingDirectory?: string) {
    const workDir = workingDirectory || process.cwd();
    this.intentClassifier = new SmartQueryIntentClassifier();
    this.fileDiscovery = new SmartFileDiscovery(workDir);
    this.relevanceAnalyzer = new SmartRelevanceAnalyzer(workDir);
  }
  
  /**
   * Select the most relevant files for a query
   */
  async selectFiles(request: FileSelectionRequest): Promise<FileSelectionResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting smart file selection', { query: request.query });
      
      // Step 1: Classify query intent
      const intent = this.intentClassifier.classifyIntent(request.query);
      const strategy = this.intentClassifier.getStrategyForIntent(intent);
      
      logger.info('Query intent classified', { intent, strategy });
      
      // Step 2: Discover candidate files using multiple strategies
      const candidateFiles = await this.discoverCandidateFiles(request, strategy);
      
      logger.info('Candidate files discovered', { 
        count: candidateFiles.length,
        files: candidateFiles.slice(0, 5) // Log first 5 for debugging
      });
      
      // Step 3: Score and rank files
      const scoredFiles = await this.scoreFiles(candidateFiles, request.query, strategy);
      
      // Step 4: Apply final filtering and limits
      const maxFiles = request.maxFiles || strategy.maxFiles;
      const finalFiles = scoredFiles
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxFiles);
      
      const executionTime = Date.now() - startTime;
      
      logger.info('File selection completed', {
        totalScanned: candidateFiles.length,
        finalCount: finalFiles.length,
        executionTime,
        topScores: finalFiles.slice(0, 3).map(f => ({ 
          path: path.basename(f.path), 
          score: f.relevanceScore.toFixed(3) 
        }))
      });
      
      return {
        files: finalFiles,
        strategy: intent,
        totalScanned: candidateFiles.length,
        executionTime
      };
      
    } catch (error) {
      logger.error('Smart file selection failed', error as Error);
      
      // Fallback to simple file discovery
      return this.fallbackSelection(request, Date.now() - startTime);
    }
  }
  
  /**
   * Discover candidate files using multiple strategies
   */
  private async discoverCandidateFiles(
    request: FileSelectionRequest, 
    strategy: any
  ): Promise<string[]> {
    const allCandidates = new Set<string>();
    
    // Strategy 1: Directory-based discovery
    try {
      const dirFiles = await this.fileDiscovery.findByDirectoryRelevance(
        request.query, 
        strategy.directories
      );
      dirFiles.forEach(file => allCandidates.add(file));
    } catch (error) {
      logger.warn('Directory-based discovery failed', { error });
    }
    
    // Strategy 2: Filename matching
    try {
      const nameFiles = await this.fileDiscovery.findByFileNameMatching(
        request.query,
        request.fileTypes || strategy.fileTypes
      );
      nameFiles.forEach(file => allCandidates.add(file));
    } catch (error) {
      logger.warn('Filename matching failed', { error });
    }
    
    // Strategy 3: Recent files (if prioritizeRecent is enabled)
    if (strategy.prioritizeRecent) {
      try {
        const recentFiles = await this.fileDiscovery.findByRecentModifications(10);
        recentFiles.forEach(file => allCandidates.add(file));
      } catch (error) {
        logger.warn('Recent files discovery failed', { error });
      }
    }
    
    // Strategy 4: Get all files as fallback
    if (allCandidates.size < 5) {
      try {
        const allFiles = await this.fileDiscovery.getAllFiles(
          strategy.directories,
          request.fileTypes || strategy.fileTypes
        );
        allFiles.slice(0, 30).forEach(file => allCandidates.add(file));
      } catch (error) {
        logger.warn('Fallback file discovery failed', { error });
      }
    }
    
    return Array.from(allCandidates);
  }
  
  /**
   * Score files based on multiple relevance signals
   */
  private async scoreFiles(
    files: string[], 
    query: string, 
    strategy: any
  ): Promise<ScoredFile[]> {
    const scoredFiles: ScoredFile[] = [];
    
    for (const file of files) {
      try {
        // Calculate individual signals
        const signals: FileRelevanceSignals = {
          nameMatch: this.relevanceAnalyzer.scoreFileName(file, query),
          directoryMatch: this.relevanceAnalyzer.scoreDirectory(file, query),
          symbolMatch: await this.scoreSymbolMatch(file, query),
          importRelevance: 0, // TODO: Implement import analysis
          recentActivity: this.relevanceAnalyzer.scoreRecency(file),
          fileSize: this.relevanceAnalyzer.scoreFileSize(file)
        };
        
        // Calculate overall score
        const relevanceScore = this.relevanceAnalyzer.calculateOverallScore(signals);
        
        // Apply strategy-specific bonuses
        const finalScore = this.applyStrategyBonus(relevanceScore, file, strategy);
        
        scoredFiles.push({
          path: file,
          relevanceScore: finalScore,
          signals,
          reason: this.generateScoreReason(signals, finalScore)
        });
        
      } catch (error) {
        logger.debug('Failed to score file', { file, error });
      }
    }
    
    return scoredFiles;
  }
  
  /**
   * Score symbol/content matching (simplified version)
   */
  private async scoreSymbolMatch(filePath: string, query: string): Promise<number> {
    try {
      // Extract symbols/keywords from query
      const symbols = this.intentClassifier.extractSymbols(query);
      const keywords = this.intentClassifier.extractKeywords(query);
      
      if (symbols.length === 0 && keywords.length === 0) {
        return 0;
      }
      
      // Read file content (limit to first 10KB for performance)
      const content = await fs.readFile(filePath, 'utf-8');
      const limitedContent = content.slice(0, 10240).toLowerCase();
      
      let score = 0;
      
      // Check for symbol matches
      for (const symbol of symbols) {
        if (limitedContent.includes(symbol.toLowerCase())) {
          score += 0.3;
        }
      }
      
      // Check for keyword matches
      for (const keyword of keywords) {
        if (limitedContent.includes(keyword)) {
          score += 0.2;
        }
      }
      
      return Math.min(score, 1.0);
      
    } catch (error) {
      return 0; // File not readable or other error
    }
  }
  
  /**
   * Apply strategy-specific scoring bonuses
   */
  private applyStrategyBonus(score: number, filePath: string, strategy: any): number {
    let bonus = 0;
    
    // Prioritized files get bonus
    if (strategy.prioritize) {
      const fileName = path.basename(filePath);
      if (strategy.prioritize.some((p: string) => fileName.includes(p))) {
        bonus += 0.2;
      }
    }
    
    // Keyword matches in strategy get bonus
    if (strategy.keywords) {
      const pathLower = filePath.toLowerCase();
      for (const keyword of strategy.keywords) {
        if (pathLower.includes(keyword)) {
          bonus += 0.1;
        }
      }
    }
    
    return Math.min(score + bonus, 1.0);
  }
  
  /**
   * Generate human-readable reason for score
   */
  private generateScoreReason(signals: FileRelevanceSignals, finalScore: number): string {
    const reasons: string[] = [];
    
    if (signals.nameMatch > 0.5) reasons.push('filename match');
    if (signals.directoryMatch > 0.5) reasons.push('directory relevance');
    if (signals.symbolMatch > 0.3) reasons.push('content match');
    if (signals.recentActivity > 0.7) reasons.push('recently modified');
    
    if (reasons.length === 0) {
      return 'general relevance';
    }
    
    return reasons.join(', ');
  }
  
  /**
   * Fallback selection when smart selection fails
   */
  private async fallbackSelection(
    request: FileSelectionRequest, 
    executionTime: number
  ): Promise<FileSelectionResult> {
    logger.warn('Using fallback file selection');
    
    try {
      const fallbackFiles = await this.fileDiscovery.getAllFiles(
        ['src/'],
        request.fileTypes || ['.ts', '.js', '.tsx', '.jsx']
      );
      
      const maxFiles = request.maxFiles || 20;
      const selectedFiles = fallbackFiles.slice(0, maxFiles).map(file => ({
        path: file,
        relevanceScore: 0.5,
        signals: {
          nameMatch: 0,
          directoryMatch: 0,
          symbolMatch: 0,
          importRelevance: 0,
          recentActivity: 0,
          fileSize: 0.5
        },
        reason: 'fallback selection'
      }));
      
      return {
        files: selectedFiles,
        strategy: QueryIntent.GENERAL,
        totalScanned: fallbackFiles.length,
        executionTime
      };
      
    } catch (error) {
      logger.error('Fallback selection also failed', error as Error);
      return {
        files: [],
        strategy: QueryIntent.GENERAL,
        totalScanned: 0,
        executionTime
      };
    }
  }
}
