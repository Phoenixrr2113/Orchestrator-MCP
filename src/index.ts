#!/usr/bin/env node

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OrchestratorManager } from './orchestrator/manager.js';
import { AIOrchestrator } from './ai/orchestrator.js';
import { toolTracker } from './ai/toolTracker.js';

// Initialize the orchestrator manager and AI layer
const orchestrator = new OrchestratorManager();
const aiOrchestrator = new AIOrchestrator(orchestrator);

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
    {
      name: 'ai_process',
      description: 'Process requests using AI-enhanced orchestration with intelligent tool routing and workflow automation',
      inputSchema: {
        type: 'object',
        properties: {
          request: {
            type: 'string',
            description: 'The request to process using AI orchestration',
          },
        },
        required: ['request'],
      },
    },
    {
      name: 'ai_status',
      description: 'Get the status of AI orchestration capabilities and connected servers',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'tool_usage_status',
      description: 'Get current tool usage tracking status and session information',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'tool_usage_stats',
      description: 'Get comprehensive tool usage statistics and analytics',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'tool_usage_clear',
      description: 'Clear tool usage tracking history',
      inputSchema: {
        type: 'object',
        properties: {},
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

      const aiStatus = aiOrchestrator.getStatus();

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

🧠 AI Orchestration Status:
- Initialized: ${aiStatus.initialized ? '✅' : '❌'}
- AI Available: ${aiStatus.aiAvailable ? '✅' : '❌'}
- Capabilities: ${aiStatus.capabilities.length} active

Current Status: ${aiStatus.aiAvailable ? 'AI-enhanced' : 'Basic'} orchestration active
Features:
✅ MCP server discovery and management
✅ Tool delegation and routing
✅ Built-in web fetching capabilities
${aiStatus.aiAvailable ? '✅' : '🔄'} AI-powered intent understanding
${aiStatus.aiAvailable ? '✅' : '🔄'} Intelligent workflow automation
${aiStatus.aiAvailable ? '✅' : '🔄'} Result synthesis and coordination

Available Tools: Use list_tools to see all available tools from connected servers
${aiStatus.aiAvailable ? '\n🤖 Try the ai_process tool for intelligent request handling!' : '\n💡 Set OPENROUTER_API_KEY to enable AI features'}`,
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

    case 'ai_process':
      try {
        const request = args?.request;
        if (!request || typeof request !== 'string') {
          throw new Error('Request parameter is required and must be a string');
        }

        // Check if AI is available, fallback to simple processing if not
        if (aiOrchestrator.isAIAvailable()) {
          const result = await aiOrchestrator.processRequest(request);
          return {
            content: [
              {
                type: 'text',
                text: `🤖 AI-Enhanced Response:\n\n${result.response}\n\n📊 Metadata:\n- Processing Time: ${result.metadata.processingTime}ms\n- Tools Used: ${result.metadata.toolsUsed.join(', ')}\n- Confidence: ${(result.metadata.confidence * 100).toFixed(1)}%\n- Workflow Steps: ${result.metadata.workflowSteps}\n- AI Enhanced: ${result.metadata.aiEnhanced ? '✅' : '❌'}`,
              },
            ],
          };
        } else {
          const result = await aiOrchestrator.processRequestFallback(request);
          return {
            content: [
              {
                type: 'text',
                text: `🔄 Fallback Response:\n\n${result.response}\n\n📊 Metadata:\n- Processing Time: ${result.metadata.processingTime}ms\n- Tools Used: ${result.metadata.toolsUsed.join(', ')}\n- AI Enhanced: ${result.metadata.aiEnhanced ? '✅' : '❌'}\n\n⚠️ Note: AI orchestration is not available. Using simple tool routing.`,
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error processing AI request: ${error}`,
            },
          ],
          isError: true,
        };
      }

    case 'ai_status':
      try {
        const status = aiOrchestrator.getStatus();
        return {
          content: [
            {
              type: 'text',
              text: `🧠 AI Orchestration Status

Initialization: ${status.initialized ? '✅ Ready' : '❌ Not initialized'}
AI Available: ${status.aiAvailable ? '✅ Yes' : '❌ No (check OPENROUTER_API_KEY)'}
Connected Servers: ${status.connectedServers}

Capabilities:
${status.capabilities.map(cap => `✅ ${cap.replace(/_/g, ' ')}`).join('\n')}

${status.aiAvailable ?
  '🎉 AI orchestration is fully operational!' :
  '⚠️ AI orchestration is not available. Check your OpenRouter API key configuration.'
}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting AI status: ${error}`,
            },
          ],
          isError: true,
        };
      }

    case 'tool_usage_status':
      try {
        const currentSession = toolTracker.getCurrentSession();

        if (!currentSession) {
          return {
            content: [
              {
                type: 'text',
                text: `🔧 Tool Usage Tracking Status

No active tracking session.

Recent activity: Use tool_usage_stats to see historical data.
Start a new session by using the ai_process tool.`,
              },
            ],
          };
        }

        const runningTime = Date.now() - currentSession.startTime;
        const completedTools = currentSession.executions.filter(e => e.endTime).length;
        const runningTools = currentSession.executions.filter(e => !e.endTime).length;
        const successfulTools = currentSession.executions.filter(e => e.success === true).length;
        const failedTools = currentSession.executions.filter(e => e.success === false).length;

        return {
          content: [
            {
              type: 'text',
              text: `🔧 Tool Usage Tracking Status

📊 Current Session: ${currentSession.sessionId}
Request: "${currentSession.userRequest}"
Status: ${currentSession.status}
Running Time: ${runningTime}ms

🛠️ Tool Executions:
- Completed: ${completedTools}
- Currently Running: ${runningTools}
- Successful: ${successfulTools}
- Failed: ${failedTools}

Recent Tools:
${currentSession.executions.slice(-5).map(e =>
  `• ${e.tool} (${e.duration ? `${e.duration}ms` : 'running...'}) ${e.success === true ? '✅' : e.success === false ? '❌' : '⏳'}`
).join('\n')}

Use tool_usage_stats for comprehensive analytics.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting tool usage status: ${error}`,
            },
          ],
          isError: true,
        };
      }

    case 'tool_usage_stats':
      try {
        const stats = toolTracker.getUsageStats();

        const successRate = stats.totalExecutions > 0
          ? ((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(1)
          : '0';

        return {
          content: [
            {
              type: 'text',
              text: `📊 Tool Usage Analytics

🔢 Overall Statistics:
- Total Executions: ${stats.totalExecutions}
- Successful: ${stats.successfulExecutions} (${successRate}%)
- Failed: ${stats.failedExecutions}
- Average Duration: ${stats.averageDuration.toFixed(1)}ms

🏆 Most Used Tools:
${stats.mostUsedTools.slice(0, 5).map((tool, i) =>
  `${i + 1}. ${tool.tool}: ${tool.count} uses (avg: ${tool.avgDuration.toFixed(1)}ms)`
).join('\n')}

📈 Recent Sessions:
${stats.recentSessions.slice(0, 3).map(session => {
  const duration = session.totalDuration || (Date.now() - session.startTime);
  const successCount = session.executions.filter(e => e.success).length;
  return `• ${session.sessionId}: ${session.executions.length} tools, ${successCount} successful (${duration}ms)`;
}).join('\n')}

Use tool_usage_status to see current session details.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting tool usage stats: ${error}`,
            },
          ],
          isError: true,
        };
      }

    case 'tool_usage_clear':
      try {
        toolTracker.clearHistory();
        return {
          content: [
            {
              type: 'text',
              text: `🧹 Tool Usage History Cleared

All tracking data has been cleared:
- Session history: Cleared
- Usage statistics: Reset
- Current session: Ended (if active)

Tool tracking will continue for new sessions.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error clearing tool usage history: ${error}`,
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

    // Initialize AI orchestration layer (optional - will gracefully degrade if not available)
    try {
      await aiOrchestrator.initialize();
      console.error('🧠 AI Orchestration Layer initialized successfully');
    } catch (aiError) {
      console.error('⚠️ AI Orchestration Layer failed to initialize:', aiError);
      console.error('🔄 Continuing with basic orchestration (AI features disabled)');
    }

    // Start the MCP server
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log to stderr so it doesn't interfere with MCP protocol
    console.error('🎼 Orchestrator MCP Server started and ready for connections');

    // Log AI status
    const aiStatus = aiOrchestrator.getStatus();
    if (aiStatus.aiAvailable) {
      console.error('🤖 AI-enhanced orchestration is active');
    } else {
      console.error('🔧 Basic orchestration mode (set OPENROUTER_API_KEY for AI features)');
    }

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
