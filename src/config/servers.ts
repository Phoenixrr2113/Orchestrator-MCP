/**
 * Server configurations
 * Moved from orchestrator/server-configs.ts to match planned structure
 */

/**
 * Enhanced server configuration supporting multiple runtimes
 */
export interface EnhancedServerConfig {
  name: string;
  description: string;
  enabled: boolean;

  // Execution configuration
  runtime: 'npm' | 'uvx' | 'python' | 'node' | 'git' | 'local';
  command: string;
  args?: string[];

  // Optional setup/installation
  installCommand?: string;
  installArgs?: string[];

  // Environment requirements
  env?: Record<string, string>;
  workingDirectory?: string;

  // Metadata
  category: 'official' | 'community';
  language: 'typescript' | 'python' | 'rust' | 'go' | 'java' | 'csharp' | 'other';
  requiresSetup?: boolean;
  phase?: number; // Which development phase this server is planned for
}

/**
 * Registry of available MCP servers with their execution configurations
 * Organized by development phases for systematic rollout
 */
export const MCP_SERVER_REGISTRY: Record<string, EnhancedServerConfig> = {

  // Official TypeScript servers (npm)
  'filesystem': {
    name: 'filesystem',
    description: 'Secure file operations with configurable access controls',
    enabled: true,
    runtime: 'npm',
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem'],
    category: 'official',
    language: 'typescript',
    phase: 1,
  },

  'sequential-thinking': {
    name: 'sequential-thinking',
    description: 'Dynamic and reflective problem-solving through thought sequences',
    enabled: true,
    runtime: 'npm',
    command: 'npx',
    args: ['@modelcontextprotocol/server-sequential-thinking'],
    category: 'official',
    language: 'typescript',
    phase: 2,
  },

  // Official Python servers (uvx)
  'git': {
    name: 'git',
    description: 'Tools to read, search, and manipulate Git repositories',
    enabled: true, // Python package confirmed working!
    runtime: 'uvx',
    command: 'uvx',
    args: ['mcp-server-git', '--repository', process.cwd()],
    category: 'official',
    language: 'python',
    requiresSetup: true,
    phase: 2,
  },

  'memory': {
    name: 'memory',
    description: 'Knowledge graph-based persistent memory with entities, relations, and observations',
    enabled: true, // Official MCP memory server with proper knowledge graph capabilities
    runtime: 'npm',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    category: 'official',
    language: 'typescript',
    phase: 3,
  },

  'fetch': {
    name: 'fetch',
    description: 'Web content fetching and conversion for efficient LLM usage',
    enabled: false, // DISABLED - Redundant with DuckDuckGo's fetch-url capability
    runtime: 'uvx',
    command: 'uvx',
    args: ['mcp-server-fetch'],
    category: 'official',
    language: 'python',
    phase: 3,
  },

  'github': {
    name: 'github',
    description: 'Official GitHub integration for repository management, PRs, issues',
    enabled: false, // DISABLED - Too many tools (26), overwhelming for LLM
    runtime: 'npm',
    command: 'npx',
    args: ['@modelcontextprotocol/server-github'],
    category: 'official',
    language: 'typescript',
    env: {
      'GITHUB_TOKEN': 'required',
    },
    requiresSetup: true,
    phase: 3,
  },

  'puppeteer': {
    name: 'puppeteer',
    description: 'Official Puppeteer server for browser automation and web scraping',
    enabled: true, // ENABLED - Fewer tools (7) than Playwright (32), better for LLM
    runtime: 'npm',
    command: 'npx',
    args: ['@modelcontextprotocol/server-puppeteer'],
    category: 'official',
    language: 'typescript',
    requiresSetup: true,
    phase: 5,
  },

  'python-execution': {
    name: 'python-execution',
    description: 'Secure Python code execution sandbox via Pydantic AI',
    enabled: false, // Phase 5 - Requires Deno runtime, complex setup
    runtime: 'node',
    command: 'deno',
    args: ['run', '-N', '-R=node_modules', '-W=node_modules', '--node-modules-dir=auto', 'jsr:@pydantic/mcp-run-python', 'stdio'],
    category: 'official',
    language: 'python',
    requiresSetup: true,
    phase: 5,
  },

  'sqlite': {
    name: 'sqlite',
    description: 'Local SQLite database interaction and business intelligence',
    enabled: false, // DISABLED - Package not available yet
    runtime: 'npm',
    command: 'npx',
    args: ['@modelcontextprotocol/server-sqlite'],
    category: 'official',
    language: 'typescript',
    phase: 5,
  },

  'semgrep': {
    name: 'semgrep',
    description: 'Security vulnerability scanning for code analysis',
    enabled: false, // DISABLED - Specialized tools, reducing complexity for LLM
    runtime: 'uvx',
    command: 'uvx',
    args: ['semgrep-mcp'],
    category: 'official',
    language: 'python',
    env: {
      'SEMGREP_APP_TOKEN': 'optional',
    },
    phase: 5,
  },

  'postgres': {
    name: 'postgres',
    description: 'Read-only database access with schema inspection',
    enabled: false, // DISABLED - Requires DATABASE_URL
    runtime: 'npm',
    command: 'npx',
    args: ['@modelcontextprotocol/server-postgres'],
    category: 'official',
    language: 'typescript',
    env: {
      'DATABASE_URL': 'required',
    },
    requiresSetup: true,
    phase: 6,
  },

  'duckduckgo-search': {
    name: 'duckduckgo-search',
    description: 'Privacy-focused web search using DuckDuckGo and Felo AI',
    enabled: true, // ENABLED!
    runtime: 'npm',
    command: 'npx',
    args: ['-y', '@oevortex/ddg_search'],
    category: 'community',
    language: 'typescript',
    requiresSetup: false, // No API key required
    phase: 6,
  },

  'context7': {
    name: 'context7',
    description: 'Up-to-date code documentation and library information for LLMs',
    enabled: false, // DISABLED - Requires arguments
    runtime: 'npm',
    command: 'npx',
    args: ['-y', 'context7'],
    category: 'community',
    language: 'typescript',
    requiresSetup: true,
    phase: 6,
  },

  'slack': {
    name: 'slack',
    description: 'Slack integration for team communication and workflow automation',
    enabled: false,
    runtime: 'npm',
    command: 'npx',
    args: ['slack-mcp-server'],
    category: 'community',
    language: 'typescript',
    env: {
      'SLACK_BOT_TOKEN': 'required',
      'SLACK_APP_TOKEN': 'required',
    },
    requiresSetup: true,
    phase: 7,
  },
};

// Utility functions will be moved here too
export function getServerConfig(name: string): EnhancedServerConfig | undefined {
  return MCP_SERVER_REGISTRY[name];
}

export function getEnabledServers(): EnhancedServerConfig[] {
  return Object.values(MCP_SERVER_REGISTRY).filter(server => server.enabled);
}

export function getServersByCategory(category: 'official' | 'community'): EnhancedServerConfig[] {
  return Object.values(MCP_SERVER_REGISTRY).filter(server => server.category === category);
}

export function getServersByRuntime(runtime: EnhancedServerConfig['runtime']): EnhancedServerConfig[] {
  return Object.values(MCP_SERVER_REGISTRY).filter(server => server.runtime === runtime);
}

export function getServersByPhase(phase: number): EnhancedServerConfig[] {
  return Object.values(MCP_SERVER_REGISTRY).filter(server => server.phase === phase);
}

export function toggleServer(name: string, enabled: boolean): boolean {
  const server = MCP_SERVER_REGISTRY[name];
  if (server) {
    server.enabled = enabled;
    return true;
  }
  return false;
}

export function addCustomServer(config: EnhancedServerConfig): void {
  MCP_SERVER_REGISTRY[config.name] = config;
}

export function validateServerConfig(config: EnhancedServerConfig): string[] {
  const errors: string[] = [];

  if (!config.name) errors.push('Server name is required');
  if (!config.command) errors.push('Command is required');
  if (!config.runtime) errors.push('Runtime is required');

  // Check for required environment variables
  if (config.env) {
    Object.entries(config.env).forEach(([key, value]) => {
      if (value === 'required' && !process.env[key]) {
        errors.push(`Environment variable ${key} is required but not set`);
      }
    });
  }

  return errors;
}
