import * as os from 'os';
import * as path from 'path';

export class VariableResolver {
  public static resolve(
    input: string,
    parameters: Record<string, any> = {},
    variables: Record<string, string> = {}
  ): string {
    if (!input || typeof input !== 'string') {
      return input;
    }

    let result = input;

    // 1. Built-in VS Code variables
    let workspaceFolder = process.cwd();
    let filePath = '';

    try {
      // Safely load VS Code module if running inside Extension Host
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const vscode = require('vscode');
      if (vscode && vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
      }
      if (vscode && vscode.window && vscode.window.activeTextEditor) {
        filePath = vscode.window.activeTextEditor.document.uri.fsPath;
      }
    } catch {
      // Fallback for standalone node unit test environment
    }

    const workspaceName = path.basename(workspaceFolder);
    const fileName = filePath ? path.basename(filePath) : '';
    const fileDir = filePath ? path.dirname(filePath) : '';

    const builtIns: Record<string, string> = {
      '${workspaceFolder}': workspaceFolder,
      '${workspaceName}': workspaceName,
      '${file}': filePath,
      '${fileName}': fileName,
      '${fileDir}': fileDir,
      '${selectedText}': '',
      '${activeEditor}': filePath,
      '${os}': process.platform,
      '${platform}': process.platform,
      '${home}': os.homedir()
    };

    for (const [key, value] of Object.entries(builtIns)) {
      result = result.replaceAll(key, value || '');
    }

    // 2. Environment variables `${env.VAR_NAME}`
    result = result.replace(/\$\{env\.([a-zA-Z0-9_]+)\}/g, (_, envKey) => {
      return process.env[envKey] || '';
    });

    // 3. User Parameters and Workflow Variables `${VAR_NAME}`
    const combinedVars = { ...variables, ...parameters };
    for (const [key, value] of Object.entries(combinedVars)) {
      const pattern = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(pattern, String(value ?? ''));
    }

    return result;
  }
}
