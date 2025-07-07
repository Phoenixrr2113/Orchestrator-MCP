#!/usr/bin/env tsx
/**
 * Production Context Engine Test
 *
 * This script tests the POC context engine with REAL components and API keys.
 * No mocks, no dummy data - this is the real deal.
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { POCContextEngine } from '../src/context/poc-engine.js';
import { createAIClient } from '../src/ai/client.js';
import { OrchestratorManager } from '../src/orchestrator/manager.js';
import { createLogger } from '../src/utils/logging.js';

const logger = createLogger('context-production-test');

/**
 * Test the POC context engine with real production components
 */
async function testProductionContextEngine() {
  console.log('🚀 Production Context Engine Test\n');
  console.log('⚠️  This test uses REAL API keys and makes actual AI calls');
  console.log('💰 This will consume OpenRouter credits\n');

  try {
    // Initialize REAL components with API keys
    console.log('🔧 Initializing production components...');
    
    const aiClient = createAIClient();
    const orchestrator = new OrchestratorManager();
    
    // Initialize orchestrator (connect to real MCP servers)
    await orchestrator.initialize();
    
    console.log('✅ Production components initialized\n');

    // Create POC context engine with REAL dependencies
    const contextEngine = new POCContextEngine(aiClient, orchestrator);

    // Test query about the intelligence layer
    const testQuery = "Analyze the current intelligence layer implementation. Show me what's actually implemented vs what's placeholder code. Focus on codebase analysis, quality assessment, and context management capabilities. I want to understand the real functionality and identify gaps.";

    console.log('📋 Test Configuration:');
    console.log(`- Query: "${testQuery.substring(0, 80)}..."`);
    console.log('- Model: google/gemini-2.5-pro (1M+ token context)');
    console.log('- Max Tokens: 800,000 for context loading');
    console.log('- Using: Real OpenRouter API + Real MCP servers');
    console.log('- No mocks or dummy data');
    console.log('');

    console.log('🔍 Starting production context search...');
    const startTime = Date.now();
    
    const result = await contextEngine.searchCodebase({
      query: testQuery,
      maxTokens: 800000,
      includeRelated: true,
      fileTypes: ['.ts', '.js', '.json'],
      directories: ['src/intelligence', 'src/context', 'src/ai']
    });
    
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000;

    // Display comprehensive results
    console.log('\n🎯 Production Test Results:');
    console.log('============================');
    
    console.log('\n📊 Context Search Results:');
    console.log(`- Relevant Files Found: ${result.relevantFiles.length}`);
    console.log(`- Code Snippets Extracted: ${result.codeSnippets.length}`);
    console.log(`- Relationships Identified: ${result.relationships.length}`);
    console.log(`- Analysis Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`- Execution Time: ${executionTime.toFixed(2)}s`);

    console.log('\n📁 Relevant Files Discovered:');
    result.relevantFiles.forEach((file, i) => {
      console.log(`${i + 1}. ${file.path}`);
      console.log(`   Relevance: ${(file.relevanceScore * 100).toFixed(1)}%`);
      console.log(`   Summary: ${file.summary}`);
      console.log(`   Key Symbols: ${file.keySymbols.join(', ')}`);
      console.log('');
    });

    console.log('\n📝 Code Snippets Analyzed:');
    result.codeSnippets.forEach((snippet, i) => {
      console.log(`${i + 1}. ${snippet.file} (lines ${snippet.startLine}-${snippet.endLine})`);
      console.log(`   Content Preview: ${snippet.content.substring(0, 120)}...`);
      console.log(`   Explanation: ${snippet.explanation}`);
      console.log('');
    });

    console.log('\n🔗 Code Relationships:');
    result.relationships.forEach((rel, i) => {
      console.log(`${i + 1}. ${rel.from} → ${rel.to}`);
      console.log(`   Type: ${rel.type}`);
      console.log(`   Description: ${rel.description}`);
      console.log('');
    });

    console.log('\n📋 AI Analysis Summary:');
    console.log('========================');
    console.log(result.summary);
    console.log('');

    // Validate production quality
    console.log('\n✅ Production Quality Validation:');
    
    const hasFiles = result.relevantFiles.length > 0;
    console.log(`- Found relevant files: ${hasFiles ? '✅' : '❌'} (${result.relevantFiles.length} files)`);
    
    const hasSnippets = result.codeSnippets.length > 0;
    console.log(`- Extracted code snippets: ${hasSnippets ? '✅' : '❌'} (${result.codeSnippets.length} snippets)`);
    
    const hasRelationships = result.relationships.length > 0;
    console.log(`- Identified relationships: ${hasRelationships ? '✅' : '❌'} (${result.relationships.length} relationships)`);
    
    const goodConfidence = result.confidence > 0.7;
    console.log(`- High confidence analysis: ${goodConfidence ? '✅' : '❌'} (${(result.confidence * 100).toFixed(1)}%)`);
    
    const reasonableTime = executionTime < 120; // 2 minutes max
    console.log(`- Reasonable execution time: ${reasonableTime ? '✅' : '❌'} (${executionTime.toFixed(2)}s)`);
    
    const hasIntelligenceFiles = result.relevantFiles.some(f => f.path.includes('intelligence'));
    console.log(`- Found intelligence layer files: ${hasIntelligenceFiles ? '✅' : '❌'}`);
    
    const hasRealAnalysis = result.summary.length > 200 && !result.summary.includes('placeholder');
    console.log(`- Generated real analysis: ${hasRealAnalysis ? '✅' : '❌'} (${result.summary.length} chars)`);

    // Overall assessment
    const qualityChecks = [hasFiles, hasSnippets, hasRelationships, goodConfidence, reasonableTime, hasIntelligenceFiles, hasRealAnalysis];
    const passedChecks = qualityChecks.filter(Boolean).length;
    const qualityScore = passedChecks / qualityChecks.length;
    
    console.log('\n🏆 Overall Production Assessment:');
    console.log(`Quality Score: ${(qualityScore * 100).toFixed(1)}% (${passedChecks}/${qualityChecks.length} checks passed)`);
    
    if (qualityScore >= 0.8) {
      console.log('🎉 EXCELLENT: Production context engine is working at high quality!');
      console.log('✅ Ready for production use');
      console.log('✅ Large context analysis is functional');
      console.log('✅ File discovery and loading works correctly');
      console.log('✅ AI analysis provides meaningful insights');
    } else if (qualityScore >= 0.6) {
      console.log('⚠️  GOOD: Production context engine is working but has room for improvement');
      console.log('✅ Core functionality is working');
      console.log('🔧 Some aspects could be enhanced');
    } else {
      console.log('❌ NEEDS WORK: Production context engine has significant issues');
      console.log('🔧 Major improvements needed before production use');
    }

    console.log('\n💡 Key Insights:');
    if (result.relevantFiles.length > 5) {
      console.log('- Context engine successfully discovered multiple relevant files');
    }
    if (result.codeSnippets.length > 3) {
      console.log('- AI analysis extracted meaningful code snippets');
    }
    if (result.relationships.length > 2) {
      console.log('- System identified code relationships and dependencies');
    }
    if (executionTime < 60) {
      console.log('- Performance is excellent for large context analysis');
    }

    console.log('\n🎯 Production Test Complete!');
    
    return {
      success: qualityScore >= 0.6,
      qualityScore,
      executionTime,
      filesFound: result.relevantFiles.length,
      confidence: result.confidence,
      analysisLength: result.summary.length
    };

  } catch (error) {
    console.error('\n❌ Production test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('OPENROUTER_API_KEY')) {
        console.error('\n🔑 API Key Issue:');
        console.error('- Make sure OPENROUTER_API_KEY is set in your environment');
        console.error('- Check that the API key is valid and has credits');
      } else if (error.message.includes('Context analysis failed')) {
        console.error('\n🤖 AI Analysis Issue:');
        console.error('- The AI model may have failed to process the large context');
        console.error('- Try reducing maxTokens or using a different model');
      } else {
        console.error('\n🔧 System Issue:');
        console.error('- Check that all MCP servers are running correctly');
        console.error('- Verify file system permissions');
      }
    }
    
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await testProductionContextEngine();
    
    if (result.success) {
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. ✅ Context engine is production-ready');
      console.log('2. 🔧 Consider optimizing file discovery algorithms');
      console.log('3. 📈 Monitor performance with larger codebases');
      console.log('4. 🎯 Add specialized analysis workflows');
      console.log('5. 💾 Implement caching for frequently analyzed code');
    } else {
      console.log('\n🔧 IMPROVEMENT NEEDED:');
      console.log('1. Review failed validation checks above');
      console.log('2. Debug specific issues identified');
      console.log('3. Re-test after fixes');
    }
    
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    console.error('Unhandled error:', error);
    process.exit(1);
  }
}

// Run the production test
main();
