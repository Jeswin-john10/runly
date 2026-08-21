import { ChildProcess } from 'child_process';
import { Workflow } from '../models/Workflow';
import { ExecutionRecord, ExecutionStatus, NodeExecutionState } from '../models/Execution';

export class ExecutionContext {
  public readonly executionId: string;
  public readonly workflow: Workflow;
  public status: ExecutionStatus = 'QUEUED';
  public readonly startTime: string;
  public endTime?: string;
  public durationMs = 0;
  public readonly logs: string[] = [];
  public readonly nodeStates: Record<string, NodeExecutionState> = {};
  public readonly parameters: Record<string, any>;
  public readonly activeProcesses: Set<ChildProcess> = new Set();
  public isCancelled = false;

  private cancelCallbacks: Array<() => void> = [];

  constructor(workflow: Workflow, parameters: Record<string, any> = {}) {
    this.executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.workflow = workflow;
    this.parameters = parameters;
    this.startTime = new Date().toISOString();

    // Initialize node states
    for (const node of workflow.nodes) {
      this.nodeStates[node.id] = {
        nodeId: node.id,
        status: 'QUEUED'
      };
    }
  }

  public onCancel(cb: () => void): void {
    this.cancelCallbacks.push(cb);
  }

  public cancel(): void {
    if (this.isCancelled) return;
    this.isCancelled = true;
    this.status = 'CANCELLED';
    this.addLog('[Workflow] Execution cancelled by user.');

    // Execute cancel callbacks
    for (const cb of this.cancelCallbacks) {
      try {
        cb();
      } catch (err) {
        console.error('Error during cancellation callback execution:', err);
      }
    }

    // Kill active child processes
    for (const proc of this.activeProcesses) {
      try {
        proc.kill();
      } catch (err) {
        console.error('Error killing child process:', err);
      }
    }
    this.activeProcesses.clear();
  }

  public addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${message}`;
    this.logs.push(formatted);
  }

  public setNodeStatus(nodeId: string, status: ExecutionStatus, extra: Partial<NodeExecutionState> = {}): void {
    const currentState = this.nodeStates[nodeId] || { nodeId, status: 'QUEUED' };
    this.nodeStates[nodeId] = {
      ...currentState,
      status,
      ...extra
    };
  }

  public toRecord(): ExecutionRecord {
    const startMs = new Date(this.startTime).getTime();
    const endMs = this.endTime ? new Date(this.endTime).getTime() : Date.now();
    return {
      id: this.executionId,
      workflowId: this.workflow.id,
      workflowName: this.workflow.name,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime || new Date().toISOString(),
      durationMs: this.durationMs || endMs - startMs,
      logs: [...this.logs],
      nodeStates: { ...this.nodeStates },
      parametersUsed: { ...this.parameters }
    };
  }
}
