import * as vscode from 'vscode';
import { WorkflowStorage } from '../storage/WorkflowStorage';
import { WorkflowEngine } from '../engine/WorkflowEngine';

export async function runWorkflowCommand(
  workflowStorage: WorkflowStorage,
  workflowEngine: WorkflowEngine
) {
  const workflows = await workflowStorage.loadAllWorkflows();
  if (workflows.length === 0) {
    vscode.window.showInformationMessage('No workflows found. Create a workflow first!');
    return;
  }

  const items = workflows.map((w) => ({
    label: w.name,
    description: `${w.nodes.length} steps • ${w.category || 'General'}`,
    workflow: w
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a workflow to execute'
  });

  if (!selected) return;

  const { workflow } = selected;
  vscode.window.showInformationMessage(`Running workflow "${workflow.name}"...`);
  await workflowEngine.runWorkflow(workflow);
}
