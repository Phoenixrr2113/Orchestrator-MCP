/**
 * MCP Server registry and discovery
 * Central hub for managing all MCP server integrations
 */

export * from './filesystem.js';
export * from './git.js';
export * from './memory.js';
export * from './github.js';

// Re-export server configurations for backward compatibility
export { MCP_SERVER_REGISTRY, getServerConfig, getEnabledServers } from '../config/servers.js';
