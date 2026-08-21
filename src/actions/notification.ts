import * as vscode from 'vscode';
import { VariableResolver } from '../engine/VariableResolver';

export class NotificationAction {
  public static async execute(
    config: { type: 'info' | 'success' | 'warning' | 'error'; message: string },
    parameters: Record<string, any>,
    variables: Record<string, string>,
    onLog: (line: string) => void
  ): Promise<void> {
    const rawMsg = config.message || '';
    const resolvedMsg = VariableResolver.resolve(rawMsg, parameters, variables);

    onLog(`[Notification Action] ${config.type.toUpperCase()}: ${resolvedMsg}`);

    switch (config.type) {
      case 'info':
      case 'success':
        vscode.window.showInformationMessage(`[Runly] ${resolvedMsg}`);
        break;
      case 'warning':
        vscode.window.showWarningMessage(`[Runly] ${resolvedMsg}`);
        break;
      case 'error':
        vscode.window.showErrorMessage(`[Runly] ${resolvedMsg}`);
        break;
      default:
        vscode.window.showInformationMessage(`[Runly] ${resolvedMsg}`);
    }
  }
}
