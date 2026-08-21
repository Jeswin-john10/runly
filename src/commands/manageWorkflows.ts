import * as vscode from 'vscode';
import * as fs from 'fs';
import { WorkflowStorage } from '../storage/WorkflowStorage';

export async function manageWorkflowsCommand(workflowStorage: WorkflowStorage) {
  const workflows = await workflowStorage.loadAllWorkflows();
  if (workflows.length === 0) {
    vscode.window.showInformationMessage('No workflows available.');
    return;
  }

  const items = workflows.map((w) => ({
    label: w.name,
    description: `${w.nodes.length} steps`,
    workflow: w
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a workflow to manage'
  });

  if (!selected) return;

  const action = await vscode.window.showQuickPick(['Duplicate', 'Export', 'Delete'], {
    placeHolder: `Action for "${selected.workflow.name}"`
  });

  if (action === 'Duplicate') {
    await workflowStorage.duplicateWorkflow(selected.workflow.id);
    vscode.window.showInformationMessage(`Duplicated "${selected.workflow.name}".`);
  } else if (action === 'Delete') {
    await workflowStorage.deleteWorkflow(selected.workflow.id);
    vscode.window.showInformationMessage(`Deleted "${selected.workflow.name}".`);
  } else if (action === 'Export') {
    const jsonStr = await workflowStorage.exportWorkflow(selected.workflow.id);
    const targetUri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(`${selected.workflow.id}.runly.json`),
      filters: { 'Runly Workflows': ['runly.json', 'json'] }
    });
    if (targetUri) {
      fs.writeFileSync(targetUri.fsPath, jsonStr, 'utf-8');
      vscode.window.showInformationMessage(`Exported workflow "${selected.workflow.name}".`);
    }
  }
}
