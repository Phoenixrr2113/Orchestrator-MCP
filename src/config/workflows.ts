/**
 * Workflow definitions
 * Predefined workflows for common orchestration patterns
 */

/**
 * Workflow step definition
 */
export interface WorkflowStepDefinition {
  id: string;
  tool: string;
  action: string;
  parameters: Record<string, any>;
  conditions?: Array<{
    type: 'success' | 'failure' | 'always';
    nextStep?: string;
  }>;
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

/**
 * Workflow definition
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'analysis' | 'automation' | 'maintenance';
  steps: WorkflowStepDefinition[];
  variables?: Record<string, any>;
  timeout?: number;
}

/**
 * Predefined workflow templates
 */
export const WORKFLOW_TEMPLATES: Record<string, WorkflowDefinition> = {
  'codebase-analysis': {
    id: 'codebase-analysis',
    name: 'Comprehensive Codebase Analysis',
    description: 'Analyze codebase structure, quality, and architecture',
    category: 'analysis',
    steps: [
      {
        id: 'scan-structure',
        tool: 'filesystem',
        action: 'directory_tree',
        parameters: { path: '.' },
      },
      {
        id: 'security-scan',
        tool: 'semgrep',
        action: 'security_check',
        parameters: {},
      },
      {
        id: 'git-analysis',
        tool: 'git',
        action: 'git_log',
        parameters: { max_count: 50 },
      },
      {
        id: 'synthesize-results',
        tool: 'ai',
        action: 'synthesize',
        parameters: {},
      },
    ],
  },

  'pr-review': {
    id: 'pr-review',
    name: 'Pull Request Review',
    description: 'Automated PR review with security and quality checks',
    category: 'development',
    steps: [
      {
        id: 'fetch-pr-changes',
        tool: 'github',
        action: 'get_pr_files',
        parameters: {},
      },
      {
        id: 'security-check',
        tool: 'semgrep',
        action: 'scan',
        parameters: {},
      },
      {
        id: 'run-tests',
        tool: 'git',
        action: 'run_tests',
        parameters: {},
      },
      {
        id: 'generate-review',
        tool: 'ai',
        action: 'generate_review',
        parameters: {},
      },
    ],
  },

  'web-automation': {
    id: 'web-automation',
    name: 'Web Testing Automation',
    description: 'Automated web testing and validation',
    category: 'automation',
    steps: [
      {
        id: 'navigate-page',
        tool: 'playwright',
        action: 'navigate',
        parameters: {},
      },
      {
        id: 'take-screenshot',
        tool: 'playwright',
        action: 'screenshot',
        parameters: {},
      },
      {
        id: 'validate-content',
        tool: 'playwright',
        action: 'get_visible_text',
        parameters: {},
      },
      {
        id: 'analyze-results',
        tool: 'ai',
        action: 'analyze',
        parameters: {},
      },
    ],
  },

  'knowledge-extraction': {
    id: 'knowledge-extraction',
    name: 'Knowledge Extraction and Storage',
    description: 'Extract knowledge from web content and store in memory',
    category: 'analysis',
    steps: [
      {
        id: 'fetch-content',
        tool: 'fetch',
        action: 'fetch',
        parameters: {},
      },
      {
        id: 'extract-entities',
        tool: 'ai',
        action: 'extract_entities',
        parameters: {},
      },
      {
        id: 'store-knowledge',
        tool: 'memory',
        action: 'create_entities',
        parameters: {},
      },
      {
        id: 'create-relations',
        tool: 'memory',
        action: 'create_relations',
        parameters: {},
      },
    ],
  },
};

/**
 * Get workflow definition by ID
 */
export function getWorkflowDefinition(id: string): WorkflowDefinition | undefined {
  return WORKFLOW_TEMPLATES[id];
}

/**
 * Get workflows by category
 */
export function getWorkflowsByCategory(category: WorkflowDefinition['category']): WorkflowDefinition[] {
  return Object.values(WORKFLOW_TEMPLATES).filter(workflow => workflow.category === category);
}

/**
 * List all available workflows
 */
export function listWorkflows(): WorkflowDefinition[] {
  return Object.values(WORKFLOW_TEMPLATES);
}

/**
 * Validate workflow definition
 */
export function validateWorkflowDefinition(workflow: WorkflowDefinition): string[] {
  const errors: string[] = [];

  if (!workflow.id) errors.push('Workflow ID is required');
  if (!workflow.name) errors.push('Workflow name is required');
  if (!workflow.steps || workflow.steps.length === 0) {
    errors.push('Workflow must have at least one step');
  }

  // Validate steps
  workflow.steps?.forEach((step, index) => {
    if (!step.id) errors.push(`Step ${index + 1}: ID is required`);
    if (!step.tool) errors.push(`Step ${index + 1}: Tool is required`);
    if (!step.action) errors.push(`Step ${index + 1}: Action is required`);
  });

  return errors;
}
