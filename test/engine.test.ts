import assert from 'node:assert';
import { test, describe } from 'node:test';

// Lightweight vscode mock for standalone Node.js test runner
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (request: string) {
  if (request === 'vscode') {
    return {
      workspace: {
        workspaceFolders: [],
        getConfiguration: () => ({
          get: (_key: string, defaultValue: any) => defaultValue
        }),
        openTextDocument: async () => ({ save: async () => {} }),
        saveAll: async () => {}
      },
      window: {
        showInformationMessage: () => {},
        showWarningMessage: () => {},
        showErrorMessage: () => {},
        createTerminal: () => ({ show: () => {}, sendText: () => {} }),
        terminals: []
      },
      commands: { executeCommand: async () => {} },
      tasks: { fetchTasks: async () => [], executeTask: async () => {} },
      env: { openExternal: async () => {} },
      Uri: {
        file: (p: string) => ({ fsPath: p }),
        parse: (u: string) => u
      }
    };
  }
  return originalRequire.apply(this, arguments as any);
};

import { VariableResolver } from '../src/engine/VariableResolver';
import { ConditionEngine } from '../src/engine/ConditionEngine';
import { WorkflowRunner } from '../src/engine/WorkflowRunner';
import { ExecutionContext } from '../src/engine/ExecutionContext';
import { Workflow } from '../src/models/Workflow';

describe('Runly Engine Unit Tests', () => {
  test('VariableResolver resolves built-in and env variables correctly', () => {
    const raw = 'Hello ${user}, OS is ${os}, Port is ${env.PORT}';
    process.env.PORT = '8080';

    const resolved = VariableResolver.resolve(
      raw,
      { user: 'Jeswin' },
      {}
    );

    assert.strictEqual(resolved.includes('Hello Jeswin'), true);
    assert.strictEqual(resolved.includes('Port is 8080'), true);
    assert.strictEqual(resolved.includes('${user}'), false);
  });

  test('ConditionEngine evaluates previousSuccess and exitCode conditions', () => {
    const successState = { nodeId: 'n1', status: 'SUCCESS' as const, exitCode: 0 };
    const failState = { nodeId: 'n1', status: 'FAILED' as const, exitCode: 1 };

    assert.strictEqual(
      ConditionEngine.evaluate('previousSuccess', undefined, successState),
      true
    );

    assert.strictEqual(
      ConditionEngine.evaluate('previousSuccess', undefined, failState),
      false
    );

    assert.strictEqual(
      ConditionEngine.evaluate('previousFailed', undefined, failState),
      true
    );

    assert.strictEqual(
      ConditionEngine.evaluate('exitCode', '0', successState),
      true
    );

    assert.strictEqual(
      ConditionEngine.evaluate('exitCode', '0', failState),
      false
    );
  });

  test('WorkflowRunner executes simple delay workflow', async () => {
    const mockWorkflow: Workflow = {
      version: 1,
      id: 'test-wf',
      name: 'Test Delay Workflow',
      nodes: [
        {
          id: 'start',
          type: 'start',
          label: 'START',
          position: { x: 0, y: 0 },
          config: {}
        },
        {
          id: 'delay1',
          type: 'delay',
          label: 'Delay Node',
          position: { x: 0, y: 100 },
          config: { durationMs: 10 }
        }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'delay1' }
      ]
    };

    const ctx = new ExecutionContext(mockWorkflow);
    const runner = new WorkflowRunner(ctx, () => {});
    const resultContext = await runner.run();

    assert.strictEqual(resultContext.status, 'SUCCESS');
    assert.strictEqual(resultContext.nodeStates['delay1'].status, 'SUCCESS');
  });

  test('ExecutionContext records step history correctly', () => {
    const mockWorkflow: Workflow = {
      version: 1,
      id: 'history-test',
      name: 'History Test',
      nodes: [{ id: 'start', type: 'start', label: 'START', position: { x: 0, y: 0 }, config: {} }],
      edges: []
    };

    const ctx = new ExecutionContext(mockWorkflow, { param1: 'val1' });
    ctx.addLog('Started step 1');
    ctx.setNodeStatus('start', 'SUCCESS', { durationMs: 50 });

    const rec = ctx.toRecord();
    assert.strictEqual(rec.workflowName, 'History Test');
    assert.strictEqual(rec.logs.length, 1);
    assert.strictEqual(rec.nodeStates['start'].status, 'SUCCESS');
    assert.strictEqual(rec.parametersUsed?.param1, 'val1');
  });
});
