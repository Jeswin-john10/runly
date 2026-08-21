import { spawn, ChildProcess } from 'child_process';
import * as vscode from 'vscode';
import { VariableResolver } from '../engine/VariableResolver';

export interface CommandActionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export class CommandAction {
  public static async execute(
    config: {
      command: string;
      workingDirectory?: string;
      shell?: string;
      env?: Record<string, string>;
      timeoutMs?: number;
    },
    parameters: Record<string, any>,
    variables: Record<string, string>,
    onLog: (line: string) => void,
    cancellationToken?: { isCancelled: boolean; onCancel?: (cb: () => void) => void },
    activeProcesses?: Set<ChildProcess>
  ): Promise<CommandActionResult> {
    const rawCmd = config.command || '';
    const resolvedCmd = VariableResolver.resolve(rawCmd, parameters, variables);

    const defaultCwd =
      vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : process.cwd();

    const rawCwd = config.workingDirectory || defaultCwd;
    const resolvedCwd = VariableResolver.resolve(rawCwd, parameters, variables);

    const shellSetting = vscode.workspace.getConfiguration('runly').get<string>('defaultShell', '');
    const shellOption = config.shell || shellSetting || (process.platform === 'win32' ? 'powershell.exe' : true);

    const customEnv = { ...process.env };
    if (config.env) {
      for (const [k, v] of Object.entries(config.env)) {
        customEnv[k] = VariableResolver.resolve(v, parameters, variables);
      }
    }

    onLog(`[Command] Executing: ${resolvedCmd}`);
    onLog(`[Command] Cwd: ${resolvedCwd}`);

    return new Promise<CommandActionResult>((resolve, reject) => {
      let child: ChildProcess;
      let stdout = '';
      let stderr = '';
      let isSettled = false;

      try {
        child = spawn(resolvedCmd, [], {
          cwd: resolvedCwd,
          shell: shellOption,
          env: customEnv
        });
      } catch (err: any) {
        onLog(`[Command] Failed to spawn process: ${err.message}`);
        return reject(err);
      }

      if (activeProcesses) {
        activeProcesses.add(child);
      }

      const cleanup = () => {
        if (activeProcesses) {
          activeProcesses.delete(child);
        }
      };

      if (cancellationToken) {
        if (cancellationToken.isCancelled) {
          try {
            child.kill();
          } catch {}
          cleanup();
          return reject(new Error('Action cancelled by user.'));
        }
        cancellationToken.onCancel?.(() => {
          onLog('[Command] Cancellation requested. Terminating process...');
          try {
            if (process.platform === 'win32' && child.pid) {
              spawn('taskkill', ['/pid', child.pid.toString(), '/f', '/t']);
            } else {
              child.kill('SIGTERM');
            }
          } catch {}
        });
      }

      let timeoutTimer: NodeJS.Timeout | undefined;
      if (config.timeoutMs && config.timeoutMs > 0) {
        timeoutTimer = setTimeout(() => {
          onLog(`[Command] Timed out after ${config.timeoutMs}ms.`);
          try {
            child.kill();
          } catch {}
          if (!isSettled) {
            isSettled = true;
            cleanup();
            reject(new Error(`Command timed out after ${config.timeoutMs}ms.`));
          }
        }, config.timeoutMs);
      }

      child.stdout?.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        onLog(text.trimEnd());
      });

      child.stderr?.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        onLog(`[STDERR] ${text.trimEnd()}`);
      });

      child.on('error', (err) => {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (!isSettled) {
          isSettled = true;
          cleanup();
          onLog(`[Command Error] ${err.message}`);
          reject(err);
        }
      });

      child.on('close', (code) => {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (!isSettled) {
          isSettled = true;
          cleanup();
          const exitCode = code ?? 0;
          onLog(`[Command] Exited with code ${exitCode}`);
          if (exitCode === 0) {
            resolve({ exitCode, stdout, stderr });
          } else {
            reject(new Error(`Command failed with exit code ${exitCode}`));
          }
        }
      });
    });
  }
}
