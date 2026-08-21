import * as vscode from 'vscode';
import { VariableResolver } from '../engine/VariableResolver';

export class TerminalAction {
  public static async execute(
    config: {
      name?: string;
      command?: string;
      workingDirectory?: string;
      reuseTerminal?: boolean;
      keepOpen?: boolean;
    },
    parameters: Record<string, any>,
    variables: Record<string, string>,
    onLog: (line: string) => void
  ): Promise<void> {
    const name = config.name
      ? VariableResolver.resolve(config.name, parameters, variables)
      : 'Runly Terminal';

    const command = config.command
      ? VariableResolver.resolve(config.command, parameters, variables)
      : '';

    const cwd = config.workingDirectory
      ? VariableResolver.resolve(config.workingDirectory, parameters, variables)
      : undefined;

    let terminal: vscode.Terminal | undefined;

    if (config.reuseTerminal !== false) {
      terminal = vscode.window.terminals.find((t) => t.name === name);
    }

    if (!terminal) {
      onLog(`[Terminal] Creating new VS Code terminal: "${name}"`);
      terminal = vscode.window.createTerminal({
        name,
        cwd
      });
    } else {
      onLog(`[Terminal] Reusing existing VS Code terminal: "${name}"`);
    }

    terminal.show(true);

    if (command) {
      onLog(`[Terminal] Sending command to terminal: ${command}`);
      terminal.sendText(command);
    }
  }
}
