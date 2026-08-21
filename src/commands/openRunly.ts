import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { WorkflowStorage } from '../storage/WorkflowStorage';
import { HistoryStorage } from '../storage/HistoryStorage';
import { SettingsStorage } from '../storage/SettingsStorage';
import { WorkflowEngine } from '../engine/WorkflowEngine';
import { ProjectDetector } from '../detection/ProjectDetector';
import { Workflow } from '../models/Workflow';

export class RunlyWebviewPanel {
  public static currentPanel: RunlyWebviewPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private readonly workflowStorage: WorkflowStorage;
  private readonly historyStorage: HistoryStorage;
  private readonly settingsStorage: SettingsStorage;
  private readonly workflowEngine: WorkflowEngine;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    workflowStorage: WorkflowStorage,
    historyStorage: HistoryStorage,
    settingsStorage: SettingsStorage,
    workflowEngine: WorkflowEngine
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (RunlyWebviewPanel.currentPanel) {
      RunlyWebviewPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'runlyDashboard',
      'Runly Workflows',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
      }
    );

    RunlyWebviewPanel.currentPanel = new RunlyWebviewPanel(
      panel,
      extensionUri,
      workflowStorage,
      historyStorage,
      settingsStorage,
      workflowEngine
    );
  }

  public static openWorkflow(
    extensionUri: vscode.Uri,
    workflowStorage: WorkflowStorage,
    historyStorage: HistoryStorage,
    settingsStorage: SettingsStorage,
    workflowEngine: WorkflowEngine,
    workflow: Workflow
  ) {
    RunlyWebviewPanel.createOrShow(
      extensionUri,
      workflowStorage,
      historyStorage,
      settingsStorage,
      workflowEngine
    );
    setTimeout(() => {
      if (RunlyWebviewPanel.currentPanel) {
        RunlyWebviewPanel.currentPanel.postMessage('openWorkflow', workflow);
      }
    }, 200);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    workflowStorage: WorkflowStorage,
    historyStorage: HistoryStorage,
    settingsStorage: SettingsStorage,
    workflowEngine: WorkflowEngine
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.workflowStorage = workflowStorage;
    this.historyStorage = historyStorage;
    this.settingsStorage = settingsStorage;
    this.workflowEngine = workflowEngine;

    this.panel.webview.html = this.getHtmlForWebview(this.panel.webview);

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Handle messages from Webview
    this.panel.webview.onDidReceiveMessage(
      async (message) => {
        await this.handleMessage(message);
      },
      null,
      this.disposables
    );
  }

  private async handleMessage(message: any) {
    switch (message.command) {
      case 'getWorkflows': {
        const workflows = await this.workflowStorage.loadAllWorkflows();
        this.postMessage('workflowsLoaded', workflows);
        break;
      }
      case 'saveWorkflow': {
        const saved = await this.workflowStorage.saveWorkflow(message.payload);
        const workflows = await this.workflowStorage.loadAllWorkflows();
        this.postMessage('workflowsLoaded', workflows);
        vscode.window.showInformationMessage(`Workflow "${saved.name}" saved successfully.`);
        break;
      }
      case 'deleteWorkflow': {
        await this.workflowStorage.deleteWorkflow(message.payload.id);
        const workflows = await this.workflowStorage.loadAllWorkflows();
        this.postMessage('workflowsLoaded', workflows);
        break;
      }
      case 'duplicateWorkflow': {
        await this.workflowStorage.duplicateWorkflow(message.payload.id);
        const workflows = await this.workflowStorage.loadAllWorkflows();
        this.postMessage('workflowsLoaded', workflows);
        break;
      }
      case 'runWorkflow': {
        const { workflow, parameters } = message.payload;
        // Check security confirmation setting
        const settings = this.settingsStorage.getSettings();
        const hasCommands = workflow.nodes.some(
          (n: any) => n.type === 'command' || n.type === 'terminal' || n.type === 'script'
        );

        if (settings.confirmImportedWorkflows && workflow.untrustedCommandsWarning && hasCommands) {
          this.postMessage('securityWarning', { workflow });
          return;
        }

        this.workflowEngine.runWorkflow(workflow, parameters, (context) => {
          this.postMessage('executionProgress', context.toRecord());
        }).then((record) => {
          this.postMessage('executionFinished', record);
          if (settings.showNotifications) {
            if (record.status === 'SUCCESS') {
              vscode.window.showInformationMessage(`Runly: "${workflow.name}" completed successfully.`);
            } else if (record.status === 'FAILED') {
              vscode.window.showErrorMessage(`Runly: "${workflow.name}" failed.`);
            }
          }
        });
        break;
      }
      case 'stopWorkflow': {
        this.workflowEngine.stopWorkflow();
        break;
      }
      case 'importWorkflow': {
        const uris = await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          filters: { 'Runly Workflows': ['json', 'runly.json'] }
        });
        if (uris && uris.length > 0) {
          const content = fs.readFileSync(uris[0].fsPath, 'utf-8');
          const { workflow, hasCommands } = await this.workflowStorage.importWorkflow(content);
          workflow.untrustedCommandsWarning = hasCommands;
          await this.workflowStorage.saveWorkflow(workflow);

          const workflows = await this.workflowStorage.loadAllWorkflows();
          this.postMessage('workflowsLoaded', workflows);
          if (hasCommands && this.settingsStorage.getSettings().confirmImportedWorkflows) {
            this.postMessage('securityWarning', { workflow });
          } else {
            vscode.window.showInformationMessage(`Imported workflow "${workflow.name}".`);
          }
        }
        break;
      }
      case 'exportWorkflow': {
        const jsonStr = await this.workflowStorage.exportWorkflow(message.payload.id);
        const targetUri = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file(`${message.payload.id}.runly.json`),
          filters: { 'Runly Workflows': ['runly.json', 'json'] }
        });
        if (targetUri) {
          fs.writeFileSync(targetUri.fsPath, jsonStr, 'utf-8');
          vscode.window.showInformationMessage(`Exported workflow to ${path.basename(targetUri.fsPath)}`);
        }
        break;
      }
      case 'getHistory': {
        const history = await this.historyStorage.getHistory();
        this.postMessage('historyLoaded', history);
        break;
      }
      case 'clearHistory': {
        await this.historyStorage.clearHistory();
        this.postMessage('historyLoaded', []);
        break;
      }
      case 'getSettings': {
        const settings = this.settingsStorage.getSettings();
        this.postMessage('settingsLoaded', settings);
        break;
      }
      case 'saveSettings': {
        await this.settingsStorage.updateSetting(message.payload.key, message.payload.value);
        this.postMessage('settingsLoaded', this.settingsStorage.getSettings());
        break;
      }
      case 'getDetectedProject': {
        const detected = await ProjectDetector.detect();
        this.postMessage('projectDetected', detected);
        break;
      }
      default:
        break;
    }
  }

  public postMessage(command: string, payload?: any) {
    this.panel.webview.postMessage({ command, payload });
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const webviewAssetPath = vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview');
    const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'icon.png'));
    
    // Check built index.html or construct asset URIs
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewAssetPath, 'assets', 'index.js'));
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewAssetPath, 'assets', 'index.css'));

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Runly — Visual Developer Workflow Automation</title>
    <meta name="description" content="Build your workflow. Run it instantly. Local-first visual workflow automation extension for VS Code.">
    <meta name="author" content="Jeswin John">
    <meta name="theme-color" content="#1e1e1e">
    <link rel="icon" type="image/png" href="${iconUri}">
    <link rel="stylesheet" href="${cssUri}">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${jsUri}"></script>
  </body>
</html>`;
  }

  public dispose() {
    RunlyWebviewPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) x.dispose();
    }
  }
}
