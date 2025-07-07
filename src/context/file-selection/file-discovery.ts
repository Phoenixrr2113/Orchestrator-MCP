/**
 * Smart File Discovery Service
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { FileDiscovery } from './types.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('file-discovery');

/**
 * Implementation of smart file discovery
 */
export class SmartFileDiscovery implements FileDiscovery {
  private workingDirectory: string;
  
  constructor(workingDirectory: string = process.cwd()) {
    this.workingDirectory = workingDirectory;
  }
  
  /**
   * Find files by directory relevance to query
   */
  async findByDirectoryRelevance(query: string, directories: string[]): Promise<string[]> {
    const normalizedQuery = query.toLowerCase();
    const relevantFiles: string[] = [];
    
    for (const dir of directories) {
      try {
        const fullDirPath = path.resolve(this.workingDirectory, dir);
        const files = await this.getFilesInDirectory(fullDirPath, true);
        
        // Score directories based on query relevance
        const scoredFiles = files.map(file => ({
          file,
          score: this.scoreDirectoryRelevance(file, normalizedQuery)
        }));
        
        // Sort by score and take top files
        scoredFiles.sort((a, b) => b.score - a.score);
        relevantFiles.push(...scoredFiles.slice(0, 10).map(sf => sf.file));
        
      } catch (error) {
        logger.warn('Failed to scan directory', { directory: dir, error });
      }
    }
    
    return [...new Set(relevantFiles)]; // Remove duplicates
  }
  
  /**
   * Find files by filename matching
   */
  async findByFileNameMatching(query: string, fileTypes: string[]): Promise<string[]> {
    const keywords = this.extractQueryKeywords(query);
    const allFiles = await this.getAllFiles(['src/'], fileTypes);
    
    const matchingFiles = allFiles.filter(file => {
      const fileName = path.basename(file, path.extname(file)).toLowerCase();
      return keywords.some(keyword => fileName.includes(keyword));
    });
    
    return matchingFiles.slice(0, 15); // Limit results
  }
  
  /**
   * Find recently modified files
   */
  async findByRecentModifications(maxFiles: number): Promise<string[]> {
    try {
      const allFiles = await this.getAllFiles(['src/'], ['.ts', '.js', '.tsx', '.jsx']);
      
      // Get file stats and sort by modification time
      const fileStats = await Promise.all(
        allFiles.map(async (file) => {
          try {
            const stats = await fs.stat(file);
            return { file, mtime: stats.mtime };
          } catch (error) {
            return null;
          }
        })
      );
      
      const validStats = fileStats.filter(stat => stat !== null) as Array<{file: string, mtime: Date}>;
      validStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      
      return validStats.slice(0, maxFiles).map(stat => stat.file);
      
    } catch (error) {
      logger.warn('Failed to find recent files', { error });
      return [];
    }
  }
  
  /**
   * Get all files in specified directories with given file types
   */
  async getAllFiles(directories: string[], fileTypes: string[]): Promise<string[]> {
    const allFiles: string[] = [];
    
    for (const dir of directories) {
      try {
        const fullDirPath = path.resolve(this.workingDirectory, dir);
        const files = await this.getFilesInDirectory(fullDirPath, true);
        
        // Filter by file types
        const filteredFiles = files.filter(file => 
          fileTypes.some(type => file.endsWith(type))
        );
        
        allFiles.push(...filteredFiles);
        
      } catch (error) {
        logger.warn('Failed to get files from directory', { directory: dir, error });
      }
    }
    
    return [...new Set(allFiles)]; // Remove duplicates
  }
  
  /**
   * Recursively get all files in a directory
   */
  private async getFilesInDirectory(dirPath: string, recursive: boolean = true): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip common directories that shouldn't be analyzed
          if (this.shouldSkipDirectory(entry.name)) {
            continue;
          }
          
          if (recursive) {
            const subFiles = await this.getFilesInDirectory(fullPath, true);
            files.push(...subFiles);
          }
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      logger.debug('Failed to read directory', { dirPath, error });
    }
    
    return files;
  }
  
  /**
   * Check if directory should be skipped
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = new Set([
      'node_modules', '.git', '.next', '.nuxt', 'dist', 'build',
      'coverage', '.nyc_output', 'tmp', 'temp', '.cache',
      '.vscode', '.idea', 'logs'
    ]);
    
    return skipDirs.has(dirName) || dirName.startsWith('.');
  }
  
  /**
   * Score directory relevance to query
   */
  private scoreDirectoryRelevance(filePath: string, normalizedQuery: string): number {
    const pathParts = filePath.toLowerCase().split(path.sep);
    let score = 0;
    
    // Score based on directory names in path
    for (const part of pathParts) {
      if (normalizedQuery.includes(part)) {
        score += 2;
      }
      
      // Partial matches
      const queryWords = normalizedQuery.split(/\s+/);
      for (const word of queryWords) {
        if (part.includes(word) && word.length > 2) {
          score += 1;
        }
      }
    }
    
    // Bonus for specific important directories
    if (pathParts.includes('src')) score += 1;
    if (pathParts.includes('components')) score += 1;
    if (pathParts.includes('services')) score += 1;
    if (pathParts.includes('utils')) score += 0.5;
    
    return score;
  }
  
  /**
   * Extract keywords from query for filename matching
   */
  private extractQueryKeywords(query: string): string[] {
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 5);
  }
}
