import * as vscode from 'vscode';
import { VariableResolver } from '../engine/VariableResolver';

export class UrlAction {
  public static async execute(
    config: { url: string },
    parameters: Record<string, any>,
    variables: Record<string, string>,
    onLog: (line: string) => void
  ): Promise<void> {
    const rawUrl = config.url || '';
    const resolvedUrl = VariableResolver.resolve(rawUrl, parameters, variables);

    if (!resolvedUrl) {
      throw new Error('[URL Action] URL is required.');
    }

    onLog(`[URL Action] Opening browser URL: ${resolvedUrl}`);
    const uri = vscode.Uri.parse(resolvedUrl);
    await vscode.env.openExternal(uri);
  }
}
