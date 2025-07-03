#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OrchestratorManager } from './orchestrator/manager.js';

// Initialize the orchestrator manager
const orchestrator = new OrchestratorManager();

const server = new Server(
  {
    name: 'orchestrator-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Dynamic tool listing that includes orchestrator tools + delegated server tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Get tools from all connected servers
  const delegatedTools = await orchestrator.getAllTools();

  // Add our own orchestrator-specific tools
  const orchestratorTools = [
    {
      name: 'test_connection',
      description: 'Test that Orchestrator MCP is working and connected',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Test message to echo back',
            default: 'Hello from Orchestrator!'
          },
        },
      },
    },
    {
      name: 'get_info',
      description: 'Get information about the Orchestrator MCP server and connected servers',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'web_fetch',
      description: 'Fetch content from a web URL and return it as text',
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to fetch content from',
          },
        },
        required: ['url'],
      },
    },
  ];

  return {
    tools: [...orchestratorTools, ...delegatedTools],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Handle orchestrator-specific tools
  switch (name) {
    case 'test_connection':
      const serverInfo = orchestrator.getServerInfo();
      const connectedCount = Object.keys(serverInfo).length;

      return {
        content: [
          {
            type: 'text',
            text: `🎼 Orchestrator MCP is connected and working!

Message: ${args?.message || 'Hello from Orchestrator!'}

Status: ✅ Ready to orchestrate MCP workflows
Version: 0.1.0
Connected Servers: ${connectedCount}
Capabilities: Multi-server orchestration and workflow coordination`,
          },
        ],
      };

    case 'get_info':
      const allServerInfo = orchestrator.getServerInfo();
      const serverDetails = Object.entries(allServerInfo)
        .map(([name, info]: [string, any]) =>
          `- ${name}: ${info.connected ? '✅' : '❌'} (${info.toolCount} tools)`
        ).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `🎼 Orchestrator MCP Server Information

Name: orchestrator-mcp
Version: 0.1.0
Description: Intelligent MCP server orchestration and workflow coordination

Connected Servers:
${serverDetails || '- No servers connected'}

Current Status: Multi-server orchestration active
Features:
✅ MCP server discovery and management
✅ Tool delegation and routing
✅ Built-in web fetching capabilities
🔄 AI-powered intent understanding (coming soon)
🔄 Result synthesis and coordination (coming soon)

Available Tools: Use list_tools to see all available tools from connected servers`,
          },
        ],
      };

    case 'web_fetch':
      try {
        const url = args?.url;
        if (!url || typeof url !== 'string') {
          throw new Error('URL parameter is required and must be a string');
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const content = await response.text();
        return {
          content: [
            {
              type: 'text',
              text: content,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching URL: ${error}`,
            },
          ],
          isError: true,
        };
      }

    default:
      // Try to delegate to connected servers
      try {
        const result = await orchestrator.callTool(name, args);
        return result;
      } catch (error) {
        throw new Error(`Tool '${name}' not found in orchestrator or connected servers: ${error}`);
      }
  }
});

async function main() {
  try {
    // Initialize orchestrator and connect to MCP servers
    await orchestrator.initialize();

    // Start the MCP server
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log to stderr so it doesn't interfere with MCP protocol
    console.error('🎼 Orchestrator MCP Server started and ready for connections');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('🔌 Shutting down Orchestrator MCP Server...');
      await orchestrator.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to initialize Orchestrator:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Failed to start Orchestrator MCP Server:', error);
  process.exit(1);
});
