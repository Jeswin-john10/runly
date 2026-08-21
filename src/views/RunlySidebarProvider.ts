import * as vscode from 'vscode';
import { WorkflowStorage } from '../storage/WorkflowStorage';
import { HistoryStorage } from '../storage/HistoryStorage';
import { Workflow } from '../models/Workflow';
import { BUILTIN_TEMPLATES } from '../templates/templates';

export type TreeItemType = 'category' | 'workflow' | 'template' | 'history';

export class RunlyTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: TreeItemType,
    public readonly workflow?: Workflow,
    public readonly categoryKey?: string
  ) {
    super(label, collapsibleState);
    this.contextValue = itemType;

    if (itemType === 'workflow' && workflow) {
      this.description = `${workflow.nodes?.length || 0} steps`;
      this.tooltip = `${workflow.name}\n${workflow.description || ''}\nFramework: ${workflow.framework || 'generic'}`;
      this.iconPath = workflow.isFavorite
        ? new vscode.ThemeIcon('star-full', new vscode.ThemeColor('charts.yellow'))
        : new vscode.ThemeIcon('play-circle', new vscode.ThemeColor('charts.blue'));
      this.command = {
        command: 'runly.openWorkflowItem',
        title: 'Open in Editor',
        arguments: [workflow]
      };
    } else if (itemType === 'template' && workflow) {
      this.description = workflow.framework;
      this.tooltip = `Template: ${workflow.name}\n${workflow.description || ''}`;
      this.iconPath = new vscode.ThemeIcon('sparkle', new vscode.ThemeColor('charts.green'));
      this.command = {
        command: 'runly.useTemplateFromTree',
        title: 'Use Template',
        arguments: [workflow]
      };
    } else if (itemType === 'category') {
      if (categoryKey === 'favorites') {
        this.iconPath = new vscode.ThemeIcon('star');
      } else if (categoryKey === 'recent') {
        this.iconPath = new vscode.ThemeIcon('history');
      } else if (categoryKey === 'templates') {
        this.iconPath = new vscode.ThemeIcon('extensions');
      } else {
        this.iconPath = new vscode.ThemeIcon('folder');
      }
    }
  }
}

export class RunlySidebarProvider implements vscode.TreeDataProvider<RunlyTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<RunlyTreeItem | undefined | void> =
    new vscode.EventEmitter<RunlyTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<RunlyTreeItem | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(
    private readonly workflowStorage: WorkflowStorage,
    private readonly historyStorage: HistoryStorage
  ) {}

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: RunlyTreeItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(element?: RunlyTreeItem): Promise<RunlyTreeItem[]> {
    const allWorkflows = await this.workflowStorage.loadAllWorkflows();
    const history = await this.historyStorage.getHistory();

    if (!element) {
      // Root categories
      const items: RunlyTreeItem[] = [];

      const favorites = allWorkflows.filter((w) => w.isFavorite);
      if (favorites.length > 0) {
        items.push(
          new RunlyTreeItem(
            `Favorites (${favorites.length})`,
            vscode.TreeItemCollapsibleState.Expanded,
            'category',
            undefined,
            'favorites'
          )
        );
      }

      if (history.length > 0) {
        items.push(
          new RunlyTreeItem(
            `Recent Runs (${Math.min(history.length, 5)})`,
            vscode.TreeItemCollapsibleState.Collapsed,
            'category',
            undefined,
            'recent'
          )
        );
      }

      items.push(
        new RunlyTreeItem(
          `All Workflows (${allWorkflows.length})`,
          vscode.TreeItemCollapsibleState.Expanded,
          'category',
          undefined,
          'workflows'
        )
      );

      items.push(
        new RunlyTreeItem(
          `Templates (${BUILTIN_TEMPLATES.length})`,
          vscode.TreeItemCollapsibleState.Collapsed,
          'category',
          undefined,
          'templates'
        )
      );

      return items;
    }

    if (element.itemType === 'category') {
      if (element.categoryKey === 'favorites') {
        const favs = allWorkflows.filter((w) => w.isFavorite);
        return favs.map(
          (w) => new RunlyTreeItem(w.name, vscode.TreeItemCollapsibleState.None, 'workflow', w)
        );
      }

      if (element.categoryKey === 'recent') {
        const recentRuns = history.slice(0, 5);
        return recentRuns.map((r) => {
          const matchedWf = allWorkflows.find((w) => w.id === r.workflowId);
          const item = new RunlyTreeItem(
            `${r.workflowName} (${r.status})`,
            vscode.TreeItemCollapsibleState.None,
            'workflow',
            matchedWf || {
              version: 1,
              id: r.workflowId,
              name: r.workflowName,
              nodes: [],
              edges: []
            }
          );
          item.description = `${(r.durationMs / 1000).toFixed(1)}s`;
          item.iconPath =
            r.status === 'SUCCESS'
              ? new vscode.ThemeIcon('pass', new vscode.ThemeColor('testing.iconPassed'))
              : new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
          return item;
        });
      }

      if (element.categoryKey === 'workflows') {
        return allWorkflows.map(
          (w) => new RunlyTreeItem(w.name, vscode.TreeItemCollapsibleState.None, 'workflow', w)
        );
      }

      if (element.categoryKey === 'templates') {
        return BUILTIN_TEMPLATES.map(
          (t) => new RunlyTreeItem(t.name, vscode.TreeItemCollapsibleState.None, 'template', t)
        );
      }
    }

    return [];
  }
}
