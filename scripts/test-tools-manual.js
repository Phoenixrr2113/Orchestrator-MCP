#!/usr/bin/env node

/**
 * Manual tool testing script for the Orchestrator MCP Server
 * Tests each tool individually to verify functionality
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

console.log('🧪 Starting manual tool testing...');

async function testTools() {
  // Create client and transport
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['-r', 'dotenv/config', 'dist/index.js'],
    env: {
      ...process.env,
      // Add any required environment variables here
    }
  });

  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });

  try {
    console.log('🔌 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected successfully!');

    // Test 1: List available tools
    console.log('\n📋 Test 1: Listing available tools...');
    const toolsResponse = await client.listTools();
    console.log(`Found ${toolsResponse.tools.length} tools:`);
    toolsResponse.tools.forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name} - ${tool.description}`);
    });

    // Test 2: get_info tool
    console.log('\n🔍 Test 2: Testing get_info tool...');
    try {
      const infoResult = await client.callTool({
        name: 'get_info',
        arguments: {}
      });
      console.log('✅ get_info result:', JSON.stringify(infoResult, null, 2));
    } catch (error) {
      console.error('❌ get_info failed:', error.message);
    }

    // Test 3: ai_status tool
    console.log('\n🏥 Test 3: Testing ai_status tool...');
    try {
      const statusResult = await client.callTool({
        name: 'ai_status',
        arguments: {}
      });
      console.log('✅ ai_status result:', JSON.stringify(statusResult, null, 2));
    } catch (error) {
      console.error('❌ ai_status failed:', error.message);
    }

    // Test 4: analyze_intelligence_layer tool
    console.log('\n🧠 Test 4: Testing analyze_intelligence_layer tool...');
    try {
      const analysisResult = await client.callTool({
        name: 'analyze_intelligence_layer',
        arguments: {
          includeQuality: true,
          includeArchitecture: true
        }
      });
      console.log('✅ analyze_intelligence_layer result:', JSON.stringify(analysisResult, null, 2));
    } catch (error) {
      console.error('❌ analyze_intelligence_layer failed:', error.message);
    }

    // Test 5: ai_process tool (simple request)
    console.log('\n🤖 Test 5: Testing ai_process tool with simple request...');
    try {
      const processResult = await client.callTool({
        name: 'ai_process',
        arguments: {
          request: 'List the files in the current directory'
        }
      });
      console.log('✅ ai_process result:', JSON.stringify(processResult, null, 2));
    } catch (error) {
      console.error('❌ ai_process failed:', error.message);
    }

    console.log('\n🎉 All tool tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    try {
      await client.close();
      console.log('🔌 Client connection closed');
    } catch (error) {
      console.error('Error closing client:', error);
    }
  }
}

// Run the tests
testTools().catch(console.error);
