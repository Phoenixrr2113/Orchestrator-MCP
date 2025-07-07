/**
 * Comprehensive Context Engine Testing Scenarios
 * 
 * Tests the smart file selection with various real-world queries
 * to validate performance and accuracy across different use cases.
 */

import { SmartFileSelector } from './dist/context/file-selection/smart-selector.js';

const scenarios = [
  {
    name: "Intelligence Layer Analysis",
    query: "analyze the intelligence layer and codebase analysis capabilities",
    expectedIntent: "intelligence",
    expectedFiles: ["codebase.ts", "analyzer.ts", "intelligence"]
  },
  {
    name: "API Debugging",
    query: "debug API endpoint errors and route handling issues",
    expectedIntent: "debugging", 
    expectedFiles: ["api", "route", "endpoint"]
  },
  {
    name: "Security Audit",
    query: "security vulnerability assessment and authentication review",
    expectedIntent: "security",
    expectedFiles: ["auth", "security", "middleware"]
  },
  {
    name: "Architecture Overview",
    query: "system architecture design patterns and module organization",
    expectedIntent: "architecture",
    expectedFiles: ["index.ts", "main.ts", "app.ts"]
  },
  {
    name: "Performance Analysis",
    query: "performance bottlenecks and optimization opportunities",
    expectedIntent: "performance",
    expectedFiles: ["performance", "optimize", "cache"]
  },
  {
    name: "Database Investigation",
    query: "database schema and model relationships analysis",
    expectedIntent: "database",
    expectedFiles: ["db", "model", "schema"]
  },
  {
    name: "UI Component Structure",
    query: "user interface components and page layout analysis",
    expectedIntent: "ui",
    expectedFiles: ["component", "page", "ui"]
  },
  {
    name: "Code Quality Review",
    query: "code quality assessment and refactoring opportunities",
    expectedIntent: "quality",
    expectedFiles: ["quality", "analyzer", "metrics"]
  },
  {
    name: "Feature Implementation",
    query: "implement new workflow orchestration feature",
    expectedIntent: "feature",
    expectedFiles: ["workflow", "orchestrat"]
  },
  {
    name: "General Codebase Query",
    query: "how does this codebase work overall",
    expectedIntent: "general",
    expectedFiles: ["src"]
  },
  {
    name: "MCP Server Analysis",
    query: "MCP server implementation and tool registration",
    expectedIntent: "general",
    expectedFiles: ["mcp", "server", "tool"]
  },
  {
    name: "AI Integration",
    query: "AI client integration and workflow management",
    expectedIntent: "intelligence",
    expectedFiles: ["ai", "client", "workflow"]
  }
];

async function runScenarioTests() {
  console.log('🧪 Starting Context Engine Scenario Tests\n');
  
  const selector = new SmartFileSelector();
  const results = [];
  
  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    console.log(`\n=== Test ${i + 1}/${scenarios.length}: ${scenario.name} ===`);
    console.log(`Query: "${scenario.query}"`);
    
    try {
      const startTime = Date.now();
      const result = await selector.selectFiles({
        query: scenario.query,
        maxFiles: 10
      });
      const duration = Date.now() - startTime;
      
      // Analyze results
      const analysis = analyzeResult(result, scenario, duration);
      results.push(analysis);
      
      // Log results
      console.log(`✅ Intent: ${result.strategy} (expected: ${scenario.expectedIntent})`);
      console.log(`📁 Files: ${result.files.length} selected from ${result.totalScanned} scanned`);
      console.log(`⚡ Performance: ${duration}ms (engine: ${result.executionTime}ms)`);
      
      // Show top 3 files
      console.log('🎯 Top files:');
      result.files.slice(0, 3).forEach((file, idx) => {
        const fileName = file.path.split('/').pop();
        console.log(`   ${idx + 1}. ${fileName} (${file.relevanceScore.toFixed(3)}) - ${file.reason}`);
      });
      
      // Validation
      if (analysis.intentMatch) {
        console.log('✅ Intent classification: CORRECT');
      } else {
        console.log(`⚠️  Intent classification: Expected ${scenario.expectedIntent}, got ${result.strategy}`);
      }
      
      if (analysis.relevantFilesFound > 0) {
        console.log(`✅ Relevant files: Found ${analysis.relevantFilesFound}/${scenario.expectedFiles.length} expected patterns`);
      } else {
        console.log('⚠️  Relevant files: No expected patterns found');
      }
      
      if (duration < 2000) {
        console.log('✅ Performance: Under 2s target');
      } else {
        console.log('⚠️  Performance: Over 2s target');
      }
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      results.push({
        scenario: scenario.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const intentCorrect = results.filter(r => r.success && r.intentMatch);
  const performant = results.filter(r => r.success && r.duration < 2000);
  const relevant = results.filter(r => r.success && r.relevantFilesFound > 0);
  
  console.log(`✅ Success Rate: ${successful.length}/${results.length} (${(successful.length/results.length*100).toFixed(1)}%)`);
  console.log(`🎯 Intent Accuracy: ${intentCorrect.length}/${successful.length} (${(intentCorrect.length/successful.length*100).toFixed(1)}%)`);
  console.log(`⚡ Performance: ${performant.length}/${successful.length} under 2s (${(performant.length/successful.length*100).toFixed(1)}%)`);
  console.log(`📁 Relevance: ${relevant.length}/${successful.length} found expected files (${(relevant.length/successful.length*100).toFixed(1)}%)`);
  
  if (successful.length > 0) {
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    const avgFiles = successful.reduce((sum, r) => sum + r.filesSelected, 0) / successful.length;
    const avgScanned = successful.reduce((sum, r) => sum + r.totalScanned, 0) / successful.length;
    
    console.log(`📈 Avg Performance: ${avgDuration.toFixed(1)}ms`);
    console.log(`📈 Avg Files Selected: ${avgFiles.toFixed(1)}`);
    console.log(`📈 Avg Files Scanned: ${avgScanned.toFixed(1)}`);
  }
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  results.forEach((result, idx) => {
    if (result.success) {
      const status = [
        result.intentMatch ? '✅' : '⚠️',
        result.relevantFilesFound > 0 ? '✅' : '⚠️', 
        result.duration < 2000 ? '✅' : '⚠️'
      ].join(' ');
      console.log(`${idx + 1}. ${result.scenario}: ${status} (${result.duration}ms, ${result.filesSelected} files)`);
    } else {
      console.log(`${idx + 1}. ${result.scenario}: ❌ ${result.error}`);
    }
  });
  
  console.log('\n🎉 Context Engine scenario testing complete!');
  
  return results;
}

function analyzeResult(result, scenario, duration) {
  const intentMatch = result.strategy === scenario.expectedIntent;
  
  // Check how many expected file patterns were found
  let relevantFilesFound = 0;
  for (const expectedPattern of scenario.expectedFiles) {
    const found = result.files.some(file => 
      file.path.toLowerCase().includes(expectedPattern.toLowerCase())
    );
    if (found) relevantFilesFound++;
  }
  
  return {
    scenario: scenario.name,
    success: true,
    intentMatch,
    expectedIntent: scenario.expectedIntent,
    actualIntent: result.strategy,
    relevantFilesFound,
    expectedPatterns: scenario.expectedFiles.length,
    filesSelected: result.files.length,
    totalScanned: result.totalScanned,
    duration,
    engineTime: result.executionTime,
    topScore: result.files.length > 0 ? result.files[0].relevanceScore : 0
  };
}

// Run the tests
runScenarioTests().catch(console.error);
