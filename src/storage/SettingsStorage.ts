import * as vscode from 'vscode';

export interface RunlySettings {
  defaultShell: string;
  confirmImportedWorkflows: boolean;
  showNotifications: boolean;
  executionHistoryLimit: number;
  autoSaveWorkflows: boolean;
  useWorkspaceWorkflows: boolean;
  showTemplateSuggestions: boolean;
}

export class SettingsStorage {
  public getSettings(): RunlySettings {
    const config = vscode.workspace.getConfiguration('runly');
    return {
      defaultShell: config.get<string>('defaultShell', ''),
      confirmImportedWorkflows: config.get<boolean>('confirmImportedWorkflows', true),
      showNotifications: config.get<boolean>('showNotifications', true),
      executionHistoryLimit: config.get<number>('executionHistoryLimit', 50),
      autoSaveWorkflows: config.get<boolean>('autoSaveWorkflows', true),
      useWorkspaceWorkflows: config.get<boolean>('useWorkspaceWorkflows', true),
      showTemplateSuggestions: config.get<boolean>('showTemplateSuggestions', true)
    };
  }

  public async updateSetting(key: keyof RunlySettings, value: any): Promise<void> {
    const config = vscode.workspace.getConfiguration('runly');
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }
}
