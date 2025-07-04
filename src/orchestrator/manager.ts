import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { getEnabledServers, type EnhancedServerConfig, validateServerConfig } from '../config/servers.js';
import { toolTracker } from '../ai/toolTracker.js';

/**
 * Represents a connected MCP server
 */
export interface ConnectedServer {
  config: EnhancedServerConfig;
  client: Client;
  transport: StdioClientTransport;
  tools: any[];
  connected: boolean;
}

/**
 * Manages multiple MCP server connections and orchestrates workflows between them
 */
export class OrchestratorManager {
  private servers: Map<string, ConnectedServer> = new Map();

  constructor() {
    console.error('🎼 OrchestratorManager initialized with server registry');
  }

  /**
   * Initialize and connect to all enabled servers from registry
   */
  async initialize(): Promise<void> {
    console.error('🔌 Initializing MCP server connections from registry...');

    const enabledServers = getEnabledServers();
    console.error(`📋 Found ${enabledServers.length} enabled servers in registry`);

    for (const config of enabledServers) {
      try {
        // Validate server configuration
        const errors = validateServerConfig(config);
        if (errors.length > 0) {
          console.error(`❌ Invalid config for ${config.name}:`, errors);
          continue;
        }

        // Add working directory for filesystem server
        if (config.name === 'filesystem') {
          config.args = [...(config.args || []), process.cwd()];
        }

        await this.connectToServer(config);
        console.error(`✅ Connected to ${config.name} server (${config.runtime})`);
      } catch (error) {
        console.error(`❌ Failed to connect to ${config.name} server:`, error);
      }
    }

    console.error(`🎼 Orchestrator ready with ${this.servers.size} connected servers`);
  }

  /**
   * Connect to a single MCP server using enhanced configuration
   */
  private async connectToServer(config: EnhancedServerConfig): Promise<void> {
    const client = new Client(
      {
        name: 'orchestrator-client',
        version: '0.1.0',
      },
      {
        capabilities: {},
      }
    );

    // Create transport that will start the server process
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args || [],
    });

    // Connect the client
    await client.connect(transport);

    // Get available tools
    const toolsResponse = await client.listTools();
    const tools = toolsResponse.tools || [];

    const connectedServer: ConnectedServer = {
      config,
      client,
      transport,
      tools,
      connected: true,
    };

    this.servers.set(config.name, connectedServer);
  }

  /**
   * Get connected servers map
   */
  getConnectedServers(): Map<string, ConnectedServer> {
    return this.servers;
  }

  /**
   * Get all available tools from all connected servers
   */
  async getAllTools(): Promise<any[]> {
    const allTools: any[] = [];

    for (const [serverName, server] of this.servers) {
      if (server.connected) {
        // Add server prefix to tool names to avoid conflicts
        const prefixedTools = server.tools.map(tool => {
          // Create a clean tool object without extra properties
          const cleanTool: any = {
            name: `${serverName}_${tool.name}`,
            description: `[${serverName}] ${tool.description}`,
            inputSchema: tool.inputSchema,
          };

          // Add optional properties if they exist
          if (tool.title) {
            cleanTool.title = tool.title;
          }
          if (tool.outputSchema) {
            cleanTool.outputSchema = tool.outputSchema;
          }
          if (tool.annotations) {
            cleanTool.annotations = tool.annotations;
          }

          return cleanTool;
        });
        allTools.push(...prefixedTools);
      }
    }

    return allTools;
  }

  /**
   * Route a tool call to the appropriate server
   */
  async callTool(toolName: string, args: any): Promise<any> {
    // Parse the tool name to extract server and original tool name
    const parts = toolName.split('_');
    if (parts.length < 2) {
      throw new Error(`Invalid tool name format: ${toolName}. Expected format: serverName_toolName`);
    }

    const serverName = parts[0];
    const originalToolName = parts.slice(1).join('_');

    const server = this.servers.get(serverName);
    if (!server || !server.connected) {
      throw new Error(`Server ${serverName} is not connected`);
    }

    // Start tracking this tool execution (for direct calls outside of AI workflow)
    const executionId = toolTracker.startToolExecution(toolName, args);

    try {
      // Call the tool on the appropriate server
      const result = await server.client.callTool({
        name: originalToolName,
        arguments: args,
      });

      // End tracking with success
      toolTracker.endToolExecution(executionId, true, result);

      return result;
    } catch (error) {
      // End tracking with failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      toolTracker.endToolExecution(executionId, false, undefined, errorMessage);
      throw error;
    }
  }

  /**
   * Get information about all connected servers
   */
  getServerInfo(): any {
    const serverInfo: any = {};
    
    for (const [name, server] of this.servers) {
      serverInfo[name] = {
        connected: server.connected,
        description: server.config.description,
        toolCount: server.tools.length,
        tools: server.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
        })),
      };
    }

    return serverInfo;
  }

  /**
   * Disconnect from all servers
   */
  async disconnect(): Promise<void> {
    console.error('🔌 Disconnecting from all MCP servers...');
    
    for (const [name, server] of this.servers) {
      try {
        await server.client.close();
        console.error(`✅ Disconnected from ${name} server`);
      } catch (error) {
        console.error(`❌ Error disconnecting from ${name} server:`, error);
      }
    }

    this.servers.clear();
  }
}
