export type ExecutionStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'SKIPPED'
  | 'CANCELLED';

export interface NodeExecutionState {
  nodeId: string;
  status: ExecutionStatus;
  startTime?: number;
  endTime?: number;
  durationMs?: number;
  output?: string;
  error?: string;
  exitCode?: number;
}

export interface ExecutionRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  startTime: string;
  endTime?: string;
  durationMs: number;
  logs: string[];
  nodeStates: Record<string, NodeExecutionState>;
  parametersUsed?: Record<string, any>;
}
