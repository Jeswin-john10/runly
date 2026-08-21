import * as vscode from 'vscode';
import { WorkflowStorage } from '../storage/WorkflowStorage';
import { Workflow } from '../models/Workflow';
import { RunlyWebviewPanel } from './openRunly';

export async function newWorkflowCommand(
  context: vscode.ExtensionContext,
  workflowStorage: WorkflowStorage
) {
  const name = await vscode.window.showInputBox({
    prompt: 'Enter a name for the new workflow',
    placeHolder: 'e.g. Start React Dev Server'
  });

  if (!name) return;

  const newWf: Workflow = {
    version: 1,
    id: `workflow-${Date.now()}`,
    name,
    description: 'Custom Runly workflow',
    category: 'General',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'START',
        position: { x: 100, y: 100 },
        config: {}
      }
    ],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await workflowStorage.saveWorkflow(newWf);
  vscode.window.showInformationMessage(`Created workflow "${name}".`);

  if (RunlyWebviewPanel.currentPanel) {
    RunlyWebviewPanel.currentPanel.postMessage('workflowsLoaded', await workflowStorage.loadAllWorkflows());
  }
}
