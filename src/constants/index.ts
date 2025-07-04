/**
 * Shared constants
 * Application-wide constants and configuration values
 */

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  // Timeouts
  TOOL_TIMEOUT: 30000,
  WORKFLOW_TIMEOUT: 300000,
  SERVER_CONNECT_TIMEOUT: 10000,
  
  // Retry settings
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RETRY_BACKOFF_FACTOR: 2,
  
  // Concurrency
  MAX_CONCURRENT_TOOLS: 5,
  DEFAULT_CONCURRENCY: 3,
  
  // Session management
  SESSION_TIMEOUT: 300000, // 5 minutes
  MAX_SESSION_HISTORY: 50,
  
  // AI settings
  DEFAULT_AI_MODEL: 'anthropic/claude-3.5-sonnet',
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 2000,
  
  // Logging
  DEFAULT_LOG_LEVEL: 'info' as const,
  MAX_LOG_ENTRIES: 1000,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  SERVER_NOT_FOUND: 'MCP server not found',
  TOOL_NOT_FOUND: 'Tool not found',
  CONNECTION_FAILED: 'Failed to connect to server',
  EXECUTION_TIMEOUT: 'Tool execution timeout',
  INVALID_PARAMETERS: 'Invalid tool parameters',
  AI_NOT_AVAILABLE: 'AI orchestration not available',
  WORKFLOW_FAILED: 'Workflow execution failed',
  CONFIGURATION_INVALID: 'Invalid configuration',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SERVER_CONNECTED: 'Successfully connected to server',
  TOOL_EXECUTED: 'Tool executed successfully',
  WORKFLOW_COMPLETED: 'Workflow completed successfully',
  AI_INITIALIZED: 'AI orchestration initialized',
  SESSION_STARTED: 'Tracking session started',
} as const;

/**
 * Tool categories for organization
 */
export const TOOL_CATEGORIES = {
  FILESYSTEM: 'filesystem',
  VERSION_CONTROL: 'git',
  WEB: 'web',
  AI: 'ai',
  DATABASE: 'database',
  BROWSER: 'browser',
  SECURITY: 'security',
  DEVELOPMENT: 'development',
  ANALYSIS: 'analysis',
} as const;

/**
 * Workflow step types
 */
export const WORKFLOW_STEP_TYPES = {
  TOOL_EXECUTION: 'tool_execution',
  CONDITION: 'condition',
  LOOP: 'loop',
  PARALLEL: 'parallel',
  DELAY: 'delay',
} as const;

/**
 * Server phases for rollout
 */
export const SERVER_PHASES = {
  FOUNDATION: 1,
  CORE_TOOLS: 2,
  ECOSYSTEM: 3,
  AI_ENHANCEMENT: 4,
  AUTOMATION: 5,
  EXTENDED: 6,
  FUTURE: 7,
} as const;

/**
 * Priority levels
 */
export const PRIORITY_LEVELS = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

/**
 * File size limits
 */
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_LOG_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_RESPONSE_SIZE: 1024 * 1024, // 1MB
} as const;

/**
 * Regular expressions for validation
 */
export const REGEX_PATTERNS = {
  SERVER_NAME: /^[a-z][a-z0-9-]*[a-z0-9]$/,
  TOOL_NAME: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  SESSION_ID: /^[a-zA-Z0-9-]{8,}$/,
  URL: /^https?:\/\/.+/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Environment variable names
 */
export const ENV_VARS = {
  OPENROUTER_API_KEY: 'OPENROUTER_API_KEY',
  OPENROUTER_DEFAULT_MODEL: 'OPENROUTER_DEFAULT_MODEL',
  OPENROUTER_MAX_TOKENS: 'OPENROUTER_MAX_TOKENS',
  OPENROUTER_TEMPERATURE: 'OPENROUTER_TEMPERATURE',
  GITHUB_TOKEN: 'GITHUB_TOKEN',
  LOG_LEVEL: 'LOG_LEVEL',
  NODE_ENV: 'NODE_ENV',
} as const;

/**
 * Development phases
 */
export const DEVELOPMENT_PHASES = {
  PLANNING: 'planning',
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  DEPLOYMENT: 'deployment',
  MAINTENANCE: 'maintenance',
} as const;

/**
 * Emoji constants for logging
 */
export const EMOJIS = {
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  DEBUG: '🔍',
  LOADING: '⏳',
  ROCKET: '🚀',
  GEAR: '⚙️',
  BRAIN: '🧠',
  ROBOT: '🤖',
  FIRE: '🔥',
  SPARKLES: '✨',
  TADA: '🎉',
  STOP: '🛑',
  RECYCLE: '♻️',
  TOOLS: '🔧',
  CHART: '📊',
  BOOK: '📚',
  LOCK: '🔒',
  KEY: '🔑',
  LINK: '🔗',
  GLOBE: '🌐',
  FOLDER: '📁',
  FILE: '📄',
  SEARCH: '🔍',
  CLOCK: '🕐',
  CALENDAR: '📅',
  BELL: '🔔',
  MAIL: '📧',
  PHONE: '📞',
  CAMERA: '📷',
  VIDEO: '📹',
  MUSIC: '🎵',
  GAME: '🎮',
  TROPHY: '🏆',
  MEDAL: '🏅',
  FLAG: '🚩',
  BOOKMARK: '🔖',
  TAG: '🏷️',
  PACKAGE: '📦',
  GIFT: '🎁',
  BALLOON: '🎈',
  CONFETTI: '🎊',
  PARTY: '🎉',
} as const;

/**
 * Color codes for terminal output
 */
export const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',
  UNDERSCORE: '\x1b[4m',
  BLINK: '\x1b[5m',
  REVERSE: '\x1b[7m',
  HIDDEN: '\x1b[8m',
  
  // Foreground colors
  FG_BLACK: '\x1b[30m',
  FG_RED: '\x1b[31m',
  FG_GREEN: '\x1b[32m',
  FG_YELLOW: '\x1b[33m',
  FG_BLUE: '\x1b[34m',
  FG_MAGENTA: '\x1b[35m',
  FG_CYAN: '\x1b[36m',
  FG_WHITE: '\x1b[37m',
  
  // Background colors
  BG_BLACK: '\x1b[40m',
  BG_RED: '\x1b[41m',
  BG_GREEN: '\x1b[42m',
  BG_YELLOW: '\x1b[43m',
  BG_BLUE: '\x1b[44m',
  BG_MAGENTA: '\x1b[45m',
  BG_CYAN: '\x1b[46m',
  BG_WHITE: '\x1b[47m',
} as const;
