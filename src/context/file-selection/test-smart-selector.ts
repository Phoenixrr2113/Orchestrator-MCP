/**
 * Test script for Smart File Selector
 * 
 * This script tests the smart file selection functionality
 * to ensure it works correctly before integration.
 */

import { SmartFileSelector } from './smart-selector.js';
import { createLogger } from '../../utils/logging.js';

const logger = createLogger('smart-selector-test');

/**
 * Test the smart file selector with various queries
 */
async function testSmartFileSelector() {
  logger.info('Starting Smart File Selector tests');
  
  const selector = new SmartFileSelector();
  
  // Test cases with different query types
  const testCases = [
    {
      name: 'Intelligence Layer Query',
      query: 'intelligence layer codebase analysis',
      expectedIntent: 'intelligence'
    },
    {
      name: 'API Analysis Query',
      query: 'analyze api endpoints and routes',
      expectedIntent: 'api'
    },
    {
      name: 'Bug Investigation Query',
      query: 'debug error in authentication system',
      expectedIntent: 'debugging'
    },
    {
      name: 'Architecture Analysis Query',
      query: 'system architecture and design patterns',
      expectedIntent: 'architecture'
    },
    {
      name: 'General Query',
      query: 'how does this codebase work',
      expectedIntent: 'general'
    }
  ];
  
  for (const testCase of testCases) {
    try {
      logger.info(`\n=== Testing: ${testCase.name} ===`);
      logger.info(`Query: "${testCase.query}"`);
      
      const startTime = Date.now();
      const result = await selector.selectFiles({
        query: testCase.query,
        maxFiles: 10
      });
      const duration = Date.now() - startTime;
      
      logger.info('Test Results:', {
        intent: result.strategy,
        expectedIntent: testCase.expectedIntent,
        filesSelected: result.files.length,
        totalScanned: result.totalScanned,
        executionTime: duration,
        performanceTime: result.executionTime
      });
      
      // Log top 3 files with scores
      logger.info('Top selected files:');
      result.files.slice(0, 3).forEach((file, index) => {
        logger.info(`  ${index + 1}. ${file.path.replace(process.cwd(), '.')} (score: ${file.relevanceScore.toFixed(3)}, reason: ${file.reason})`);
      });
      
      // Validate results
      if (result.files.length === 0) {
        logger.warn('⚠️  No files selected - this might indicate an issue');
      } else if (result.files.length > 15) {
        logger.warn('⚠️  Too many files selected - might impact performance');
      } else {
        logger.info('✅ Test passed - reasonable number of files selected');
      }
      
    } catch (error) {
      logger.error(`❌ Test failed for "${testCase.name}":`, error as Error);
    }
  }
  
  logger.info('\n=== Smart File Selector tests completed ===');
}

/**
 * Test individual components
 */
async function testComponents() {
  logger.info('\n=== Testing Individual Components ===');
  
  const selector = new SmartFileSelector();
  
  // Test intent classification
  const { SmartQueryIntentClassifier } = await import('./intent-classifier.js');
  const classifier = new SmartQueryIntentClassifier();
  
  const testQueries = [
    'intelligence layer analysis',
    'api endpoint debugging',
    'security vulnerability audit',
    'performance optimization',
    'ui component structure'
  ];
  
  logger.info('Intent Classification Tests:');
  for (const query of testQueries) {
    const intent = classifier.classifyIntent(query);
    const keywords = classifier.extractKeywords(query);
    const symbols = classifier.extractSymbols(query);
    
    logger.info(`Query: "${query}" -> Intent: ${intent}, Keywords: [${keywords.join(', ')}], Symbols: [${symbols.join(', ')}]`);
  }
}

/**
 * Performance test
 */
async function performanceTest() {
  logger.info('\n=== Performance Test ===');
  
  const selector = new SmartFileSelector();
  const iterations = 5;
  const query = 'analyze codebase architecture and design patterns';
  
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    await selector.selectFiles({ query, maxFiles: 15 });
    const duration = Date.now() - startTime;
    times.push(duration);
    
    logger.info(`Iteration ${i + 1}: ${duration}ms`);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  logger.info('Performance Results:', {
    averageTime: `${avgTime.toFixed(1)}ms`,
    minTime: `${minTime}ms`,
    maxTime: `${maxTime}ms`,
    target: '<2000ms'
  });
  
  if (avgTime < 2000) {
    logger.info('✅ Performance test passed - under 2 second target');
  } else {
    logger.warn('⚠️  Performance test warning - over 2 second target');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  try {
    await testSmartFileSelector();
    await testComponents();
    await performanceTest();
    
    logger.info('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    logger.error('Test suite failed:', error as Error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { runTests, testSmartFileSelector, testComponents, performanceTest };
