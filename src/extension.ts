import * as vscode from 'vscode';
import { WorkflowStorage } from './storage/WorkflowStorage';
import { HistoryStorage } from './storage/HistoryStorage';
import { SettingsStorage } from './storage/SettingsStorage';
import { WorkflowEngine } from './engine/WorkflowEngine';
import { RunlyWebviewPanel } from './commands/openRunly';
import { newWorkflowCommand } from './commands/newWorkflow';
import { runWorkflowCommand } from './commands/runWorkflow';
import { stopWorkflowCommand } from './commands/stopWorkflow';
import { importWorkflowCommand } from './commands/importWorkflow';
import { exportWorkflowCommand } from './commands/exportWorkflow';
import { manageWorkflowsCommand } from './commands/manageWorkflows';
import { RunlySidebarProvider, RunlyTreeItem } from './views/RunlySidebarProvider';
import { Workflow } from './models/Workflow';

export function activate(context: vscode.ExtensionContext) {
  console.log('Runly extension activated.');

  const workflowStorage = new WorkflowStorage(context);
  const historyStorage = new HistoryStorage(context);
  const settingsStorage = new SettingsStorage();
  const workflowEngine = new WorkflowEngine(historyStorage);

  // Initialize Activity Bar Sidebar TreeView Provider
  const sidebarProvider = new RunlySidebarProvider(workflowStorage, historyStorage);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('runly.sidebarView', sidebarProvider)
  );

  // Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'runly.open';
  statusBarItem.text = '$(play-circle) Runly';
  statusBarItem.tooltip = 'Open Runly Visual Workflow Builder';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('runly.open', () => {
      RunlyWebviewPanel.createOrShow(
        context.extensionUri,
        workflowStorage,
        historyStorage,
        settingsStorage,
        workflowEngine
      );
    }),

    vscode.commands.registerCommand('runly.refreshSidebar', () => {
      sidebarProvider.refresh();
    }),

    vscode.commands.registerCommand('runly.openWorkflowItem', (workflow: Workflow) => {
      if (workflow) {
        RunlyWebviewPanel.openWorkflow(
          context.extensionUri,
          workflowStorage,
          historyStorage,
          settingsStorage,
          workflowEngine,
          workflow
        );
      }
    }),

    vscode.commands.registerCommand('runly.runWorkflowItem', async (item: RunlyTreeItem) => {
      if (item && item.workflow) {
        vscode.window.showInformationMessage(`Running "${item.workflow.name}"...`);
        const record = await workflowEngine.runWorkflow(item.workflow);
        sidebarProvider.refresh();
        if (record.status === 'SUCCESS') {
          vscode.window.showInformationMessage(`Workflow "${item.workflow.name}" completed successfully.`);
        } else {
          vscode.window.showErrorMessage(`Workflow "${item.workflow.name}" failed.`);
        }
      }
    }),

    vscode.commands.registerCommand('runly.deleteWorkflowItem', async (item: RunlyTreeItem) => {
      if (item && item.workflow) {
        const confirm = await vscode.window.showWarningMessage(
          `Are you sure you want to delete "${item.workflow.name}"?`,
          { modal: true },
          'Delete'
        );
        if (confirm === 'Delete') {
          await workflowStorage.deleteWorkflow(item.workflow.id);
          sidebarProvider.refresh();
          vscode.window.showInformationMessage(`Deleted "${item.workflow.name}".`);
        }
      }
    }),

    vscode.commands.registerCommand('runly.duplicateWorkflowItem', async (item: RunlyTreeItem) => {
      if (item && item.workflow) {
        await workflowStorage.duplicateWorkflow(item.workflow.id);
        sidebarProvider.refresh();
        vscode.window.showInformationMessage(`Duplicated "${item.workflow.name}".`);
      }
    }),

    vscode.commands.registerCommand('runly.exportWorkflowItem', async (item: RunlyTreeItem) => {
      if (item && item.workflow) {
        const jsonStr = await workflowStorage.exportWorkflow(item.workflow.id);
        const targetUri = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file(`${item.workflow.id}.runly.json`),
          filters: { 'Runly Workflows': ['runly.json', 'json'] }
        });
        if (targetUri) {
          const fs = require('fs');
          fs.writeFileSync(targetUri.fsPath, jsonStr, 'utf-8');
          vscode.window.showInformationMessage(`Exported workflow to ${targetUri.fsPath}`);
        }
      }
    }),

    vscode.commands.registerCommand('runly.useTemplateFromTree', async (template: Workflow) => {
      if (template) {
        const newWf: Workflow = {
          ...JSON.parse(JSON.stringify(template)),
          id: `workflow-${Date.now()}`,
          name: `${template.name.replace(/^[^\w\s]+/, '').trim()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await workflowStorage.saveWorkflow(newWf);
        sidebarProvider.refresh();
        RunlyWebviewPanel.openWorkflow(
          context.extensionUri,
          workflowStorage,
          historyStorage,
          settingsStorage,
          workflowEngine,
          newWf
        );
      }
    }),

    vscode.commands.registerCommand('runly.newWorkflow', async () => {
      await newWorkflowCommand(context, workflowStorage);
      sidebarProvider.refresh();
    }),

    vscode.commands.registerCommand('runly.runWorkflow', () => {
      runWorkflowCommand(workflowStorage, workflowEngine);
    }),

    vscode.commands.registerCommand('runly.stopWorkflow', () => {
      stopWorkflowCommand(workflowEngine);
    }),

    vscode.commands.registerCommand('runly.importWorkflow', async () => {
      await importWorkflowCommand(workflowStorage);
      sidebarProvider.refresh();
    }),

    vscode.commands.registerCommand('runly.exportWorkflow', () => {
      exportWorkflowCommand(workflowStorage);
    }),

    vscode.commands.registerCommand('runly.manageWorkflows', async () => {
      await manageWorkflowsCommand(workflowStorage);
      sidebarProvider.refresh();
    }),

    vscode.commands.registerCommand('runly.settings', () => {
      RunlyWebviewPanel.createOrShow(
        context.extensionUri,
        workflowStorage,
        historyStorage,
        settingsStorage,
        workflowEngine
      );
    })
  );
}

export function deactivate() {}
