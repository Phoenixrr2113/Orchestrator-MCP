/**
 * Context Engine Workflows
 * 
 * Predefined workflows that leverage large context capabilities
 * to achieve context engine functionality through AI orchestration
 */

import type { WorkflowDefinition } from '../config/workflows.js';

/**
 * Intelligence Layer Analysis Workflow
 * Replicates the query: "Show me the current intelligence layer implementation"
 */
export const INTELLIGENCE_ANALYSIS_WORKFLOW: WorkflowDefinition = {
  id: 'intelligence_layer_analysis',
  name: 'Intelligence Layer Analysis',
  description: 'Analyze intelligence layer implementation vs placeholders using large context',
  category: 'analysis',
  timeout: 120000, // 2 minutes
  steps: [
    {
      id: 'check_memory',
      tool: 'memory_search',
      action: 'search',
      parameters: {
        query: 'intelligence layer analysis implementation placeholder',
        entityTypes: ['analysis', 'codebase']
      }
    },
    {
      id: 'discover_files',
      tool: 'filesystem_search',
      action: 'search',
      parameters: {
        patterns: [
          'src/intelligence/**/*.ts',
          'src/ai/**/*.ts', 
          'src/context/**/*.ts',
          '**/quality*.ts',
          '**/analysis*.ts',
          '**/codebase*.ts'
        ],
        maxResults: 50
      }
    },
    {
      id: 'load_context',
      tool: 'context_loader',
      action: 'load_large_context',
      parameters: {
        files: '{{discover_files.result}}',
        maxTokens: 800000,
        query: 'intelligence layer implementation analysis'
      }
    },
    {
      id: 'analyze_with_gemini',
      tool: 'ai_analysis',
      action: 'large_context_analysis',
      parameters: {
        model: 'google/gemini-pro-1.5',
        context: '{{load_context.result}}',
        query: 'Show me the current intelligence layer implementation, specifically the codebase analysis, quality assessment, and any existing context management or indexing capabilities. I want to understand what\'s already implemented vs what\'s placeholder code.',
        analysisType: 'implementation_vs_placeholder'
      }
    },
    {
      id: 'store_insights',
      tool: 'memory_create_entity',
      action: 'create',
      parameters: {
        name: 'intelligence_layer_analysis_{{timestamp}}',
        entityType: 'analysis',
        observations: [
          'Analysis type: Intelligence layer implementation review',
          'Query: {{original_query}}',
          'Summary: {{analyze_with_gemini.summary}}',
          'Files analyzed: {{analyze_with_gemini.relevantFiles}}',
          'Confidence: {{analyze_with_gemini.confidence}}'
        ]
      }
    }
  ]
};

/**
 * Codebase Quality Assessment Workflow
 */
export const QUALITY_ASSESSMENT_WORKFLOW: WorkflowDefinition = {
  id: 'codebase_quality_assessment',
  name: 'Codebase Quality Assessment',
  description: 'Comprehensive quality assessment using large context analysis',
  category: 'analysis',
  timeout: 180000, // 3 minutes
  steps: [
    {
      id: 'get_directory_structure',
      tool: 'filesystem_list_directory',
      action: 'list',
      parameters: {
        path: '{{working_directory}}',
        recursive: true,
        maxDepth: 3
      }
    },
    {
      id: 'sample_key_files',
      tool: 'filesystem_search',
      action: 'search',
      parameters: {
        patterns: [
          'src/**/*.ts',
          'src/**/*.js',
          'package.json',
          'tsconfig.json',
          '**/*test*.ts',
          '**/*spec*.ts'
        ],
        maxResults: 100
      }
    },
    {
      id: 'run_security_scan',
      tool: 'semgrep_scan',
      action: 'scan',
      parameters: {
        path: '{{working_directory}}',
        rules: ['security', 'best-practices']
      },
      conditions: [
        { type: 'failure', nextStep: 'load_context' } // Continue even if semgrep fails
      ]
    },
    {
      id: 'load_context',
      tool: 'context_loader',
      action: 'load_large_context',
      parameters: {
        files: '{{sample_key_files.result}}',
        maxTokens: 900000,
        query: 'code quality assessment'
      }
    },
    {
      id: 'quality_analysis',
      tool: 'ai_analysis',
      action: 'large_context_analysis',
      parameters: {
        model: 'google/gemini-pro-1.5',
        context: '{{load_context.result}}',
        securityFindings: '{{run_security_scan.result}}',
        query: 'Assess the overall code quality of this codebase including maintainability, readability, testability, performance, and security. Provide specific recommendations.',
        analysisType: 'quality_assessment'
      }
    },
    {
      id: 'store_quality_insights',
      tool: 'memory_create_entity',
      action: 'create',
      parameters: {
        name: 'quality_assessment_{{timestamp}}',
        entityType: 'quality_analysis',
        observations: [
          'Analysis type: Code quality assessment',
          'Overall score: {{quality_analysis.overallScore}}',
          'Key issues: {{quality_analysis.keyIssues}}',
          'Recommendations: {{quality_analysis.recommendations}}',
          'Security findings: {{run_security_scan.issueCount}}'
        ]
      }
    }
  ]
};

/**
 * Architecture Analysis Workflow
 */
export const ARCHITECTURE_ANALYSIS_WORKFLOW: WorkflowDefinition = {
  id: 'architecture_analysis',
  name: 'Architecture Analysis',
  description: 'Analyze system architecture and design patterns using large context',
  category: 'analysis',
  timeout: 150000, // 2.5 minutes
  steps: [
    {
      id: 'find_architectural_files',
      tool: 'filesystem_search',
      action: 'search',
      parameters: {
        patterns: [
          'src/**/*.ts',
          'package.json',
          'tsconfig.json',
          'README.md',
          'docs/**/*.md',
          '**/index.ts',
          '**/manager.ts',
          '**/orchestrator.ts',
          '**/engine.ts'
        ],
        maxResults: 80
      }
    },
    {
      id: 'analyze_dependencies',
      tool: 'filesystem_read_file',
      action: 'read',
      parameters: {
        path: 'package.json'
      }
    },
    {
      id: 'load_architectural_context',
      tool: 'context_loader',
      action: 'load_large_context',
      parameters: {
        files: '{{find_architectural_files.result}}',
        maxTokens: 850000,
        query: 'architecture analysis design patterns'
      }
    },
    {
      id: 'architectural_analysis',
      tool: 'ai_analysis',
      action: 'large_context_analysis',
      parameters: {
        model: 'google/gemini-pro-1.5',
        context: '{{load_architectural_context.result}}',
        dependencies: '{{analyze_dependencies.result}}',
        query: 'Analyze the system architecture, identify design patterns, assess architectural quality, and provide recommendations for improvements.',
        analysisType: 'architecture_analysis'
      }
    },
    {
      id: 'store_architecture_insights',
      tool: 'memory_create_entity',
      action: 'create',
      parameters: {
        name: 'architecture_analysis_{{timestamp}}',
        entityType: 'architecture_analysis',
        observations: [
          'Analysis type: System architecture review',
          'Architecture pattern: {{architectural_analysis.pattern}}',
          'Strengths: {{architectural_analysis.strengths}}',
          'Weaknesses: {{architectural_analysis.weaknesses}}',
          'Recommendations: {{architectural_analysis.recommendations}}'
        ]
      }
    }
  ]
};

/**
 * Semantic Code Search Workflow
 */
export const SEMANTIC_SEARCH_WORKFLOW: WorkflowDefinition = {
  id: 'semantic_code_search',
  name: 'Semantic Code Search',
  description: 'Search codebase using natural language with large context understanding',
  category: 'analysis',
  timeout: 90000, // 1.5 minutes
  variables: {
    search_query: '',
    max_results: 20
  },
  steps: [
    {
      id: 'check_previous_searches',
      tool: 'memory_search',
      action: 'search',
      parameters: {
        query: '{{search_query}}',
        entityTypes: ['search_result', 'analysis']
      }
    },
    {
      id: 'discover_relevant_files',
      tool: 'ai_file_discovery',
      action: 'discover',
      parameters: {
        query: '{{search_query}}',
        workingDirectory: '{{working_directory}}',
        maxFiles: 50
      }
    },
    {
      id: 'load_search_context',
      tool: 'context_loader',
      action: 'load_large_context',
      parameters: {
        files: '{{discover_relevant_files.result}}',
        maxTokens: 700000,
        query: '{{search_query}}'
      }
    },
    {
      id: 'semantic_analysis',
      tool: 'ai_analysis',
      action: 'large_context_analysis',
      parameters: {
        model: 'google/gemini-pro-1.5',
        context: '{{load_search_context.result}}',
        query: '{{search_query}}',
        analysisType: 'semantic_search',
        maxResults: '{{max_results}}'
      }
    },
    {
      id: 'store_search_result',
      tool: 'memory_create_entity',
      action: 'create',
      parameters: {
        name: 'search_result_{{timestamp}}',
        entityType: 'search_result',
        observations: [
          'Search query: {{search_query}}',
          'Results found: {{semantic_analysis.resultsCount}}',
          'Relevant files: {{semantic_analysis.relevantFiles}}',
          'Key findings: {{semantic_analysis.summary}}'
        ]
      }
    }
  ]
};

/**
 * All available context engine workflows
 */
export const CONTEXT_ENGINE_WORKFLOWS = {
  INTELLIGENCE_ANALYSIS_WORKFLOW,
  QUALITY_ASSESSMENT_WORKFLOW,
  ARCHITECTURE_ANALYSIS_WORKFLOW,
  SEMANTIC_SEARCH_WORKFLOW
} as const;
