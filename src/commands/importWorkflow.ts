import * as vscode from 'vscode';
import * as fs from 'fs';
import { WorkflowStorage } from '../storage/WorkflowStorage';

export async function importWorkflowCommand(workflowStorage: WorkflowStorage) {
  const uris = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    filters: { 'Runly Workflows': ['json', 'runly.json'] }
  });

  if (!uris || uris.length === 0) return;

  try {
    const raw = fs.readFileSync(uris[0].fsPath, 'utf-8');
    const { workflow } = await workflowStorage.importWorkflow(raw);
    vscode.window.showInformationMessage(`Successfully imported workflow "${workflow.name}".`);
  } catch (err: any) {
    vscode.window.showErrorMessage(`Failed to import workflow: ${err.message}`);
  }
}
