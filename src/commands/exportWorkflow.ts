import * as vscode from 'vscode';
import * as fs from 'fs';
import { WorkflowStorage } from '../storage/WorkflowStorage';

export async function exportWorkflowCommand(workflowStorage: WorkflowStorage) {
  const workflows = await workflowStorage.loadAllWorkflows();
  if (workflows.length === 0) {
    vscode.window.showInformationMessage('No workflows available to export.');
    return;
  }

  const selected = await vscode.window.showQuickPick(
    workflows.map((w) => ({ label: w.name, workflow: w })),
    { placeHolder: 'Select a workflow to export' }
  );

  if (!selected) return;

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
