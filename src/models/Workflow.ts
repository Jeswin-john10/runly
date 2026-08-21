import { WorkflowNode } from './Node';
import { WorkflowEdge } from './Edge';

export interface WorkflowParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  default?: string | number | boolean;
  options?: string[];
  description?: string;
}

export interface Workflow {
  version: number;
  id: string;
  name: string;
  description?: string;
  category?: string;
  framework?: string;
  shortcut?: string;
  isFavorite?: boolean;
  parameters?: WorkflowParameter[];
  variables?: Record<string, string>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt?: string;
  updatedAt?: string;
  untrustedCommandsWarning?: boolean;
}

export interface WebviewIPCMessage {
  command:
    | 'getWorkflows'
    | 'saveWorkflow'
    | 'deleteWorkflow'
    | 'duplicateWorkflow'
    | 'runWorkflow'
    | 'stopWorkflow'
    | 'importWorkflow'
    | 'exportWorkflow'
    | 'getHistory'
    | 'clearHistory'
    | 'getSettings'
    | 'saveSettings'
    | 'getDetectedProject'
    | 'assignShortcut'
    | 'selectFile'
    | 'selectDirectory';
  payload?: any;
}
