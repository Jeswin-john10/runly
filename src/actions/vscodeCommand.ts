import * as vscode from 'vscode';
import { VariableResolver } from '../engine/VariableResolver';

export class VSCodeCommandAction {
  public static async execute(
    config: { commandId: string; args?: any[] },
    parameters: Record<string, any>,
    variables: Record<string, string>,
    onLog: (line: string) => void
  ): Promise<any> {
    const rawCmdId = config.commandId || '';
    const resolvedCmdId = VariableResolver.resolve(rawCmdId, parameters, variables);

    if (!resolvedCmdId) {
      throw new Error('[VSCode Command Action] Command ID is required.');
    }

    const resolvedArgs = config.args
      ? config.args.map((arg) =>
          typeof arg === 'string' ? VariableResolver.resolve(arg, parameters, variables) : arg
        )
      : [];

    onLog(`[VSCode Command] Executing command: ${resolvedCmdId}`);
    return await vscode.commands.executeCommand(resolvedCmdId, ...resolvedArgs);
  }
}
