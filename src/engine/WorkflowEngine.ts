import { Workflow } from '../models/Workflow';
import { ExecutionContext } from './ExecutionContext';
import { WorkflowRunner } from './WorkflowRunner';
import { ExecutionRecord } from '../models/Execution';
import { HistoryStorage } from '../storage/HistoryStorage';

export class WorkflowEngine {
  private activeExecutions: Map<string, ExecutionContext> = new Map();
  private historyStorage?: HistoryStorage;

  constructor(historyStorage?: HistoryStorage) {
    this.historyStorage = historyStorage;
  }

  public async runWorkflow(
    workflow: Workflow,
    parameters: Record<string, any> = {},
    onProgress?: (context: ExecutionContext) => void
  ): Promise<ExecutionRecord> {
    const context = new ExecutionContext(workflow, parameters);
    this.activeExecutions.set(context.executionId, context);

    try {
      const runner = new WorkflowRunner(context, (updatedContext) => {
        if (onProgress) {
          onProgress(updatedContext);
        }
      });

      await runner.run();
    } finally {
      this.activeExecutions.delete(context.executionId);
    }

    const record = context.toRecord();
    if (this.historyStorage) {
      await this.historyStorage.addExecutionRecord(record);
    }

    return record;
  }

  public stopWorkflow(executionId?: string): boolean {
    if (executionId) {
      const ctx = this.activeExecutions.get(executionId);
      if (ctx) {
        ctx.cancel();
        return true;
      }
      return false;
    }

    // Stop all active executions
    if (this.activeExecutions.size === 0) {
      return false;
    }

    for (const ctx of this.activeExecutions.values()) {
      ctx.cancel();
    }
    return true;
  }

  public getActiveExecution(executionId?: string): ExecutionContext | undefined {
    if (executionId) {
      return this.activeExecutions.get(executionId);
    }
    const values = Array.from(this.activeExecutions.values());
    return values.length > 0 ? values[values.length - 1] : undefined;
  }
}
