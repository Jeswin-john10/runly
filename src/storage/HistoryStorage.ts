import * as vscode from 'vscode';
import { ExecutionRecord } from '../models/Execution';

export class HistoryStorage {
  private context: vscode.ExtensionContext;
  private storageKey = 'runly.executionHistory';

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public async getHistory(): Promise<ExecutionRecord[]> {
    return this.context.globalState.get<ExecutionRecord[]>(this.storageKey, []);
  }

  public async addExecutionRecord(record: ExecutionRecord): Promise<void> {
    const history = await this.getHistory();
    const config = vscode.workspace.getConfiguration('runly');
    const limit = config.get<number>('executionHistoryLimit', 50);

    // Prepend new record
    history.unshift(record);

    // Enforce limit
    if (history.length > limit) {
      history.splice(limit);
    }

    await this.context.globalState.update(this.storageKey, history);
  }

  public async clearHistory(): Promise<void> {
    await this.context.globalState.update(this.storageKey, []);
  }
}
