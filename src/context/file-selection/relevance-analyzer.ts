/**
 * File Relevance Analysis and Scoring
 */

import * as fsSync from 'fs';
import * as path from 'path';
import { RelevanceAnalyzer, FileRelevanceSignals } from './types.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('relevance-analyzer');

/**
 * Implementation of file relevance analyzer
 */
export class SmartRelevanceAnalyzer implements RelevanceAnalyzer {
  private workingDirectory: string;
  
  constructor(workingDirectory: string = process.cwd()) {
    this.workingDirectory = workingDirectory;
  }
  
  /**
   * Score filename relevance to query
   */
  scoreFileName(filePath: string, query: string): number {
    const fileName = path.basename(filePath, path.extname(filePath)).toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
    
    let score = 0;
    
    // Exact filename match
    if (queryWords.some(word => fileName === word)) {
      score += 1.0;
    }
    
    // Partial filename matches
    for (const word of queryWords) {
      if (fileName.includes(word)) {
        score += 0.7;
      }
      
      // Fuzzy matching for similar words
      if (this.calculateSimilarity(fileName, word) > 0.7) {
        score += 0.5;
      }
    }
    
    // Bonus for important file patterns
    if (fileName.includes('index')) score += 0.3;
    if (fileName.includes('main')) score += 0.3;
    if (fileName.includes('app')) score += 0.3;
    if (fileName.includes('config')) score += 0.2;
    if (fileName.includes('utils')) score += 0.2;
    
    return Math.min(score, 1.0); // Cap at 1.0
  }
  
  /**
   * Score directory relevance to query
   */
  scoreDirectory(filePath: string, query: string): number {
    const normalizedQuery = query.toLowerCase();
    const pathParts = filePath.toLowerCase().split(path.sep);
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
    
    let score = 0;
    
    // Score based on directory names
    for (const part of pathParts) {
      for (const word of queryWords) {
        if (part === word) {
          score += 0.8;
        } else if (part.includes(word)) {
          score += 0.5;
        }
      }
    }
    
    // Bonus for specific directory patterns based on query intent
    const directoryBonus = this.getDirectoryBonus(pathParts, normalizedQuery);
    score += directoryBonus;
    
    return Math.min(score, 1.0); // Cap at 1.0
  }
  
  /**
   * Score file size (prefer substantial files over tiny ones)
   */
  scoreFileSize(filePath: string): number {
    try {
      const stats = fsSync.statSync(filePath);
      const sizeKB = stats.size / 1024;
      
      // Optimal size range: 1KB - 50KB
      if (sizeKB < 0.5) return 0.1; // Too small
      if (sizeKB < 1) return 0.3;
      if (sizeKB < 5) return 0.7;
      if (sizeKB < 20) return 1.0;
      if (sizeKB < 50) return 0.8;
      if (sizeKB < 100) return 0.6;
      return 0.4; // Very large files
      
    } catch (error) {
      return 0.5; // Default score if can't read file
    }
  }
  
  /**
   * Score file recency (recently modified files might be more relevant for debugging)
   */
  scoreRecency(filePath: string): number {
    try {
      const stats = fsSync.statSync(filePath);
      const now = Date.now();
      const fileTime = stats.mtime.getTime();
      const ageHours = (now - fileTime) / (1000 * 60 * 60);
      
      // Score based on age
      if (ageHours < 1) return 1.0;      // Very recent
      if (ageHours < 24) return 0.8;     // Today
      if (ageHours < 168) return 0.6;    // This week
      if (ageHours < 720) return 0.4;    // This month
      return 0.2; // Older
      
    } catch (error) {
      return 0.5; // Default score if can't read file
    }
  }
  
  /**
   * Calculate overall relevance score from signals
   */
  calculateOverallScore(signals: FileRelevanceSignals): number {
    // Weighted combination of signals
    const weights = {
      nameMatch: 0.3,
      directoryMatch: 0.2,
      symbolMatch: 0.3,
      importRelevance: 0.15,
      recentActivity: 0.03,
      fileSize: 0.02
    };
    
    return (
      signals.nameMatch * weights.nameMatch +
      signals.directoryMatch * weights.directoryMatch +
      signals.symbolMatch * weights.symbolMatch +
      signals.importRelevance * weights.importRelevance +
      signals.recentActivity * weights.recentActivity +
      signals.fileSize * weights.fileSize
    );
  }
  
  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }
  
  /**
   * Get directory bonus based on query patterns
   */
  private getDirectoryBonus(pathParts: string[], query: string): number {
    let bonus = 0;
    
    // Intelligence/AI related
    if (query.includes('intelligence') || query.includes('ai') || query.includes('context')) {
      if (pathParts.includes('intelligence')) bonus += 0.5;
      if (pathParts.includes('ai')) bonus += 0.5;
      if (pathParts.includes('context')) bonus += 0.5;
    }
    
    // API related
    if (query.includes('api') || query.includes('endpoint') || query.includes('route')) {
      if (pathParts.includes('api')) bonus += 0.5;
      if (pathParts.includes('routes')) bonus += 0.4;
      if (pathParts.includes('controllers')) bonus += 0.4;
    }
    
    // Database related
    if (query.includes('database') || query.includes('db') || query.includes('model')) {
      if (pathParts.includes('db')) bonus += 0.5;
      if (pathParts.includes('models')) bonus += 0.4;
      if (pathParts.includes('schema')) bonus += 0.4;
    }
    
    // UI related
    if (query.includes('ui') || query.includes('component') || query.includes('page')) {
      if (pathParts.includes('components')) bonus += 0.5;
      if (pathParts.includes('pages')) bonus += 0.4;
      if (pathParts.includes('ui')) bonus += 0.4;
    }
    
    // Security related
    if (query.includes('auth') || query.includes('security')) {
      if (pathParts.includes('auth')) bonus += 0.5;
      if (pathParts.includes('security')) bonus += 0.5;
      if (pathParts.includes('middleware')) bonus += 0.3;
    }
    
    // Testing related
    if (query.includes('test') || query.includes('debug') || query.includes('bug')) {
      if (pathParts.includes('tests')) bonus += 0.4;
      if (pathParts.includes('test')) bonus += 0.4;
    }
    
    return bonus;
  }
}
