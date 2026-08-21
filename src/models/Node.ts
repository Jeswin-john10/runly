export type ActionType =
  | 'start'
  | 'command'
  | 'terminal'
  | 'file'
  | 'url'
  | 'task'
  | 'vscodeCommand'
  | 'delay'
  | 'notification'
  | 'condition'
  | 'script';

export interface NodeConfigMap {
  start: {};
  command: {
    command: string;
    workingDirectory?: string;
    shell?: string;
    env?: Record<string, string>;
    timeoutMs?: number;
    onError?: 'stop' | 'continue' | 'fallback';
  };
  terminal: {
    name?: string;
    command?: string;
    workingDirectory?: string;
    reuseTerminal?: boolean;
    keepOpen?: boolean;
  };
  file: {
    action: 'open' | 'reveal' | 'create' | 'save';
    path: string;
    content?: string;
  };
  url: {
    url: string;
  };
  task: {
    taskName: string;
  };
  vscodeCommand: {
    commandId: string;
    args?: any[];
  };
  delay: {
    durationMs: number;
  };
  notification: {
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
  };
  condition: {
    conditionType:
      | 'previousSuccess'
      | 'previousFailed'
      | 'exitCode'
      | 'fileExists'
      | 'folderExists'
      | 'envExists'
      | 'os'
      | 'platform';
    targetValue?: string;
  };
  script: {
    code: string;
    timeoutMs?: number;
  };
}

export interface WorkflowNode {
  id: string;
  type: ActionType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  disabled?: boolean;
  continueOnError?: boolean;
  timeout?: number;
  retry?: number;
  metadata?: Record<string, any>;
  inputs?: string[];
  outputs?: string[];
}
