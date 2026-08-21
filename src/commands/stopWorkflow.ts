import * as vscode from 'vscode';
import { WorkflowEngine } from '../engine/WorkflowEngine';

export async function stopWorkflowCommand(workflowEngine: WorkflowEngine) {
  const stopped = workflowEngine.stopWorkflow();
  if (stopped) {
    vscode.window.showInformationMessage('Stopped active Runly workflow execution.');
  } else {
    vscode.window.showInformationMessage('No active workflow currently running.');
  }
}
