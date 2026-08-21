import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Workflow } from '../models/Workflow';

export class WorkflowStorage {
  private context: vscode.ExtensionContext;
  private globalStorageKey = 'runly.workflows';

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  private getWorkspaceFolder(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return workspaceFolders[0].uri.fsPath;
    }
    return undefined;
  }

  private getWorkspaceWorkflowsDir(): string | undefined {
    const root = this.getWorkspaceFolder();
    if (!root) {
      return undefined;
    }
    return path.join(root, '.runly', 'workflows');
  }

  public async loadAllWorkflows(): Promise<Workflow[]> {
    const workflowsMap = new Map<string, Workflow>();

    // 1. Load global workflows from extension storage
    const globalWorkflows: Workflow[] = this.context.globalState.get(
      this.globalStorageKey,
      []
    );
    for (const wf of globalWorkflows) {
      if (wf && wf.id) {
        workflowsMap.set(wf.id, wf);
      }
    }

    // 2. Load workspace workflows from .runly/workflows/*.runly.json
    const wsDir = this.getWorkspaceWorkflowsDir();
    if (wsDir && fs.existsSync(wsDir)) {
      try {
        const files = fs.readdirSync(wsDir);
        for (const file of files) {
          if (file.endsWith('.runly.json')) {
            const filePath = path.join(wsDir, file);
            try {
              const raw = fs.readFileSync(filePath, 'utf-8');
              const parsed: Workflow = JSON.parse(raw);
              if (parsed && parsed.id) {
                workflowsMap.set(parsed.id, parsed);
              }
            } catch (err) {
              console.error(`Failed to parse workflow file ${filePath}:`, err);
            }
          }
        }
      } catch (err) {
        console.error(`Failed to read workspace workflows dir ${wsDir}:`, err);
      }
    }

    return Array.from(workflowsMap.values());
  }

  public async getWorkflow(id: string): Promise<Workflow | undefined> {
    const all = await this.loadAllWorkflows();
    return all.find((w) => w.id === id);
  }

  public async saveWorkflow(workflow: Workflow): Promise<Workflow> {
    workflow.updatedAt = new Date().toISOString();
    if (!workflow.createdAt) {
      workflow.createdAt = workflow.updatedAt;
    }

    const config = vscode.workspace.getConfiguration('runly');
    const useWorkspace = config.get<boolean>('useWorkspaceWorkflows', true);
    const wsDir = this.getWorkspaceWorkflowsDir();

    if (useWorkspace && wsDir) {
      if (!fs.existsSync(wsDir)) {
        fs.mkdirSync(wsDir, { recursive: true });
      }
      const fileName = `${workflow.id.replace(/[^a-z0-9_-]/gi, '_')}.runly.json`;
      const filePath = path.join(wsDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2), 'utf-8');
    } else {
      // Save globally
      const globalWorkflows: Workflow[] = this.context.globalState.get(
        this.globalStorageKey,
        []
      );
      const existingIdx = globalWorkflows.findIndex((w) => w.id === workflow.id);
      if (existingIdx >= 0) {
        globalWorkflows[existingIdx] = workflow;
      } else {
        globalWorkflows.push(workflow);
      }
      await this.context.globalState.update(this.globalStorageKey, globalWorkflows);
    }

    return workflow;
  }

  public async deleteWorkflow(id: string): Promise<boolean> {
    // Check workspace file
    const wsDir = this.getWorkspaceWorkflowsDir();
    if (wsDir && fs.existsSync(wsDir)) {
      const fileName = `${id.replace(/[^a-z0-9_-]/gi, '_')}.runly.json`;
      const filePath = path.join(wsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Check global storage
    const globalWorkflows: Workflow[] = this.context.globalState.get(
      this.globalStorageKey,
      []
    );
    const updated = globalWorkflows.filter((w) => w.id !== id);
    await this.context.globalState.update(this.globalStorageKey, updated);

    return true;
  }

  public async duplicateWorkflow(id: string): Promise<Workflow> {
    const original = await this.getWorkflow(id);
    if (!original) {
      throw new Error(`Workflow with ID ${id} not found.`);
    }

    const duplicated: Workflow = JSON.parse(JSON.stringify(original));
    duplicated.id = `${original.id}-copy-${Date.now()}`;
    duplicated.name = `${original.name} (Copy)`;
    duplicated.createdAt = new Date().toISOString();
    duplicated.updatedAt = duplicated.createdAt;

    await this.saveWorkflow(duplicated);
    return duplicated;
  }

  public async importWorkflow(jsonContent: string): Promise<{ workflow: Workflow; hasCommands: boolean }> {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonContent);
    } catch (err) {
      throw new Error('Invalid JSON format for workflow file.');
    }

    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.nodes)) {
      throw new Error('Invalid Runly workflow structure: missing nodes array.');
    }

    const workflow: Workflow = {
      version: parsed.version || 1,
      id: parsed.id || `imported-${Date.now()}`,
      name: parsed.name || 'Imported Workflow',
      description: parsed.description || '',
      category: parsed.category || 'General',
      framework: parsed.framework || 'generic',
      shortcut: parsed.shortcut,
      isFavorite: false,
      parameters: parsed.parameters || [],
      variables: parsed.variables || {},
      nodes: parsed.nodes || [],
      edges: parsed.edges || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check if workflow has executable shell commands
    const hasCommands = workflow.nodes.some(
      (n) => n.type === 'command' || n.type === 'terminal' || n.type === 'script'
    );

    await this.saveWorkflow(workflow);
    return { workflow, hasCommands };
  }

  public async exportWorkflow(id: string): Promise<string> {
    const workflow = await this.getWorkflow(id);
    if (!workflow) {
      throw new Error(`Workflow with ID ${id} not found.`);
    }
    return JSON.stringify(workflow, null, 2);
  }
}
