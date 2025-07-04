/**
 * Quality analysis constants and thresholds
 * Centralized configuration for quality assessment parameters
 */

/**
 * Quality score thresholds
 */
export const QUALITY_THRESHOLDS = {
  // Overall quality score ranges
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 60,
  POOR: 40,
  
  // Individual category thresholds
  READABILITY: {
    BASE_SCORE: 80,
    COMPLEXITY_PENALTY: 5,
    LARGE_FILE_PENALTY: 3,
  },
  
  SECURITY: {
    BASE_SCORE: 85,
    CONFIG_FILE_PENALTY: 5,
    AUTH_FILE_PENALTY: 3,
  },
  
  MAINTAINABILITY: {
    BASE_SCORE: 75,
    TODO_PENALTY: 2,
    TYPESCRIPT_BONUS: 5,
  },
  
  // Complexity thresholds
  COMPLEXITY: {
    HIGH_THRESHOLD: 15,
    MEDIUM_THRESHOLD: 10,
    LOW_THRESHOLD: 5,
  },
} as const;

/**
 * File analysis constants
 */
export const FILE_ANALYSIS = {
  // Complexity scoring by file type
  COMPLEXITY_WEIGHTS: {
    BASE: 5,
    MANAGER: 10,
    ORCHESTRATOR: 10,
    HANDLER: 8,
    ROUTER: 8,
    WORKFLOW: 12,
    ENGINE: 12,
  },
  
  // File size estimates
  SIZE_ESTIMATES: {
    AVERAGE_LINES: 120,
    LARGE_FILE_MIN: 200,
    LARGE_FILE_MAX: 400,
  },
  
  // Language distribution defaults
  LANGUAGE_DISTRIBUTION: {
    TYPESCRIPT: 85,
    JAVASCRIPT: 5,
    JSON: 8,
    MARKDOWN: 2,
  },
} as const;

/**
 * Technical debt calculation weights
 */
export const TECHNICAL_DEBT = {
  WEIGHTS: {
    ERROR: 3,
    WARNING: 2,
    SUGGESTION: 1,
  },
  
  // Debt score ranges
  RANGES: {
    LOW: 10,
    MEDIUM: 25,
    HIGH: 50,
    CRITICAL: 100,
  },
} as const;

/**
 * Architecture analysis constants
 */
export const ARCHITECTURE = {
  // SOLID principles thresholds
  SOLID_THRESHOLDS: {
    GOOD: 70,
    FAIR: 50,
    POOR: 30,
  },
  
  // Anti-pattern detection
  ANTI_PATTERNS: {
    RISK_MULTIPLIER: 25,
    MAX_RISK_SCORE: 100,
  },
} as const;

/**
 * Performance and timeout constants
 */
export const PERFORMANCE = {
  // Analysis timeouts (in milliseconds)
  TIMEOUTS: {
    QUICK_ANALYSIS: 5000,
    FULL_ANALYSIS: 30000,
    DEEP_ANALYSIS: 60000,
  },
  
  // Batch processing limits
  BATCH_LIMITS: {
    MAX_FILES_PER_BATCH: 50,
    MAX_CONCURRENT_ANALYSES: 3,
  },
} as const;
