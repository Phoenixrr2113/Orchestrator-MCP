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
  // ===== PHASE 1-2: FOUNDATION (COMPLETE) =====
  
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
    args: ['mcp-server-git', '--repository', '/Users/randywilson/Desktop/augmentv2'],
    category: 'official',
    language: 'python',
    requiresSetup: true,
    phase: 2,
  },

  // ===== PHASE 3: ECOSYSTEM EXPANSION (IN PROGRESS) =====

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
    enabled: true, // Package confirmed: mcp-server-fetch
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
    enabled: true, // Phase 3 - ENABLED!
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

  // ===== PHASE 4: AI ENHANCEMENT LAYER =====
  
  // No additional servers needed - focuses on AI orchestration with existing servers

  // ===== PHASE 5: CODING INTELLIGENCE & AUTOMATION =====

  'playwright': {
    name: 'playwright',
    description: 'Community Playwright server for browser automation and web testing',
    enabled: true, // Phase 5 - ENABLED for browser automation!
    runtime: 'npm',
    command: 'npx',
    args: ['@executeautomation/playwright-mcp-server'],
    category: 'community',
    language: 'typescript',
    requiresSetup: true,
    phase: 5,
  },

  'puppeteer': {
    name: 'puppeteer',
    description: 'Official Puppeteer server for browser automation and web scraping',
    enabled: true, // Phase 5 - ENABLED as alternative to Playwright!
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
    enabled: false,
    runtime: 'uvx',
    command: 'uvx',
    args: ['pydantic-ai-mcp-run-python'],
    category: 'official',
    language: 'python',
    phase: 5,
  },

  'semgrep': {
    name: 'semgrep',
    description: 'Security vulnerability scanning for code analysis',
    enabled: false,
    runtime: 'npm',
    command: 'npx',
    args: ['@semgrep/mcp'],
    category: 'community',
    language: 'typescript',
    env: {
      'SEMGREP_API_KEY': 'optional',
    },
    phase: 5,
  },

  // ===== PHASE 6: EXTENDED ECOSYSTEM INTEGRATION =====

  'postgres': {
    name: 'postgres',
    description: 'Read-only database access with schema inspection',
    enabled: false,
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

  'brave-search': {
    name: 'brave-search',
    description: 'Web and local search using Brave Search API',
    enabled: false,
    runtime: 'npm',
    command: 'npx',
    args: ['@modelcontextprotocol/server-brave-search'],
    category: 'official',
    language: 'typescript',
    env: {
      'BRAVE_API_KEY': 'required',
    },
    requiresSetup: true,
    phase: 6,
  },

  'leetcode': {
    name: 'leetcode',
    description: 'LeetCode problem solving and coding practice integration',
    enabled: false,
    runtime: 'npm',
    command: 'npx',
    args: ['doggybee-mcp-server-leetcode'],
    category: 'community',
    language: 'typescript',
    phase: 6,
  },

  // ===== FUTURE PHASES: ADDITIONAL SERVERS =====

  'time': {
    name: 'time',
    description: 'Time and timezone conversion capabilities',
    enabled: false,
    runtime: 'uvx',
    command: 'uvx',
    args: ['mcp-server-time'],
    category: 'official',
    language: 'python',
    phase: 7,
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

/**
 * Get server configuration by name
 */
export function getServerConfig(name: string): EnhancedServerConfig | undefined {
  return MCP_SERVER_REGISTRY[name];
}

/**
 * Get all enabled servers
 */
export function getEnabledServers(): EnhancedServerConfig[] {
  return Object.values(MCP_SERVER_REGISTRY).filter(server => server.enabled);
}

/**
 * Get servers by category
 */
export function getServersByCategory(category: 'official' | 'community'): EnhancedServerConfig[] {
  return Object.values(MCP_SERVER_REGISTRY).filter(server => server.category === category);
}

/**
 * Get servers by runtime
 */
export function getServersByRuntime(runtime: EnhancedServerConfig['runtime']): EnhancedServerConfig[] {
  return Object.values(MCP_SERVER_REGISTRY).filter(server => server.runtime === runtime);
}

/**
 * Get servers by phase
 */
export function getServersByPhase(phase: number): EnhancedServerConfig[] {
  return Object.values(MCP_SERVER_REGISTRY).filter(server => server.phase === phase);
}

/**
 * Enable/disable a server
 */
export function toggleServer(name: string, enabled: boolean): boolean {
  const server = MCP_SERVER_REGISTRY[name];
  if (server) {
    server.enabled = enabled;
    return true;
  }
  return false;
}

/**
 * Add a custom server to the registry
 */
export function addCustomServer(config: EnhancedServerConfig): void {
  MCP_SERVER_REGISTRY[config.name] = config;
}

/**
 * Validate server configuration
 */
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
