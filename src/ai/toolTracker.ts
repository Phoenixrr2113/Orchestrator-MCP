/**
 * Tool usage tracking and logging system
 */



export interface ToolExecution {
  id: string;
  tool: string;
  parameters: Record<string, any>;
  startTime: number;
  endTime?: number;
  duration?: number;
  success?: boolean;
  result?: any;
  error?: string;
  metadata?: {
    confidence?: number;
    reasoning?: string;
    stepIndex?: number;
    workflowId?: string;
  };
}

export interface ToolUsageSession {
  sessionId: string;
  userRequest: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  executions: ToolExecution[];
  status: 'running' | 'completed' | 'failed' | 'cancelled';
}

export interface ToolUsageStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  mostUsedTools: Array<{ tool: string; count: number; avgDuration: number }>;
  recentSessions: ToolUsageSession[];
}

/**
 * Tool usage tracker for monitoring orchestration activities
 */
export class ToolUsageTracker {
  private currentSession: ToolUsageSession | null = null;
  private sessions: ToolUsageSession[] = [];
  private maxSessionHistory = 50; // Keep last 50 sessions
  private listeners: Array<(execution: ToolExecution) => void> = [];

  /**
   * Start a new tracking session
   */
  startSession(userRequest: string): string {
    const sessionId = this.generateSessionId();
    
    this.currentSession = {
      sessionId,
      userRequest,
      startTime: Date.now(),
      executions: [],
      status: 'running',
    };

    console.error(`🎯 Tool Tracking: Started session ${sessionId} for request: "${userRequest}"`);
    return sessionId;
  }

  /**
   * End the current tracking session
   */
  endSession(status: 'completed' | 'failed' | 'cancelled' = 'completed'): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.totalDuration = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.status = status;

    // Add to session history
    this.sessions.unshift(this.currentSession);
    
    // Trim history if needed
    if (this.sessions.length > this.maxSessionHistory) {
      this.sessions = this.sessions.slice(0, this.maxSessionHistory);
    }

    const successCount = this.currentSession.executions.filter(e => e.success).length;
    const totalCount = this.currentSession.executions.length;
    
    console.error(`🏁 Tool Tracking: Session ${this.currentSession.sessionId} ended`);
    console.error(`   Status: ${status}`);
    console.error(`   Duration: ${this.currentSession.totalDuration}ms`);
    console.error(`   Tools executed: ${totalCount} (${successCount} successful)`);

    this.currentSession = null;
  }

  /**
   * Start tracking a tool execution
   */
  startToolExecution(
    tool: string,
    parameters: Record<string, any>,
    metadata?: ToolExecution['metadata']
  ): string {
    const executionId = this.generateExecutionId();
    
    const execution: ToolExecution = {
      id: executionId,
      tool,
      parameters: { ...parameters }, // Clone to avoid mutations
      startTime: Date.now(),
      metadata: metadata ? { ...metadata } : undefined,
    };

    if (this.currentSession) {
      this.currentSession.executions.push(execution);
      execution.metadata = {
        ...execution.metadata,
        workflowId: this.currentSession.sessionId,
      };
    }

    // Log tool execution start
    console.error(`🔧 Tool Execution: Starting ${tool}`);
    console.error(`   ID: ${executionId}`);
    console.error(`   Parameters: ${JSON.stringify(parameters, null, 2)}`);
    if (metadata?.reasoning) {
      console.error(`   Reasoning: ${metadata.reasoning}`);
    }
    if (metadata?.confidence) {
      console.error(`   Confidence: ${(metadata.confidence * 100).toFixed(1)}%`);
    }

    return executionId;
  }

  /**
   * End tracking a tool execution
   */
  endToolExecution(
    executionId: string,
    success: boolean,
    result?: any,
    error?: string
  ): void {
    const execution = this.findExecution(executionId);
    if (!execution) {
      console.error(`⚠️ Tool Tracking: Execution ${executionId} not found`);
      return;
    }

    execution.endTime = Date.now();
    execution.duration = execution.endTime - execution.startTime;
    execution.success = success;
    execution.result = result;
    execution.error = error;

    // Log tool execution end
    const status = success ? '✅' : '❌';
    console.error(`${status} Tool Execution: ${execution.tool} completed`);
    console.error(`   ID: ${executionId}`);
    console.error(`   Duration: ${execution.duration}ms`);
    console.error(`   Success: ${success}`);
    
    if (error) {
      console.error(`   Error: ${error}`);
    } else if (result) {
      // Log a summary of the result (not full content to avoid spam)
      const resultSummary = this.summarizeResult(result);
      console.error(`   Result: ${resultSummary}`);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(execution);
      } catch (err) {
        console.error('Tool tracking listener error:', err);
      }
    });
  }

  /**
   * Get current session information
   */
  getCurrentSession(): ToolUsageSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  /**
   * Get tool usage statistics
   */
  getUsageStats(): ToolUsageStats {
    const allExecutions = this.sessions.flatMap(s => s.executions);
    
    const totalExecutions = allExecutions.length;
    const successfulExecutions = allExecutions.filter(e => e.success).length;
    const failedExecutions = totalExecutions - successfulExecutions;
    
    const completedExecutions = allExecutions.filter(e => e.duration !== undefined);
    const averageDuration = completedExecutions.length > 0
      ? completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / completedExecutions.length
      : 0;

    // Calculate most used tools
    const toolCounts = new Map<string, { count: number; totalDuration: number }>();
    
    completedExecutions.forEach(e => {
      const current = toolCounts.get(e.tool) || { count: 0, totalDuration: 0 };
      toolCounts.set(e.tool, {
        count: current.count + 1,
        totalDuration: current.totalDuration + (e.duration || 0),
      });
    });

    const mostUsedTools = Array.from(toolCounts.entries())
      .map(([tool, stats]) => ({
        tool,
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageDuration,
      mostUsedTools,
      recentSessions: this.sessions.slice(0, 10),
    };
  }

  /**
   * Add a listener for tool execution events
   */
  addListener(listener: (execution: ToolExecution) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  removeListener(listener: (execution: ToolExecution) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Clear all tracking data
   */
  clearHistory(): void {
    this.sessions = [];
    this.currentSession = null;
    console.error('🧹 Tool Tracking: History cleared');
  }

  /**
   * Find an execution by ID
   */
  private findExecution(executionId: string): ToolExecution | undefined {
    if (this.currentSession) {
      return this.currentSession.executions.find(e => e.id === executionId);
    }
    
    for (const session of this.sessions) {
      const execution = session.executions.find(e => e.id === executionId);
      if (execution) return execution;
    }
    
    return undefined;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate a unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Summarize a result for logging
   */
  private summarizeResult(result: any): string {
    if (!result) return 'null';
    
    if (typeof result === 'string') {
      return result.length > 100 ? `${result.substring(0, 100)}...` : result;
    }
    
    if (typeof result === 'object') {
      if (result.content && Array.isArray(result.content)) {
        return `${result.content.length} content items`;
      }
      
      const keys = Object.keys(result);
      return `Object with ${keys.length} keys: [${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}]`;
    }
    
    return String(result);
  }
}

// Global instance
export const toolTracker = new ToolUsageTracker();
