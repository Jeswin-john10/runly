import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { VariableResolver } from '../engine/VariableResolver';

export class FileAction {
  public static async execute(
    config: {
      action: 'open' | 'reveal' | 'create' | 'save';
      path: string;
      content?: string;
    },
    parameters: Record<string, any>,
    variables: Record<string, string>,
    onLog: (line: string) => void
  ): Promise<void> {
    const rawPath = config.path || '';
    const resolvedPath = VariableResolver.resolve(rawPath, parameters, variables);

    if (!resolvedPath) {
      throw new Error('[File Action] File path is required.');
    }

    onLog(`[File Action] ${config.action.toUpperCase()}: ${resolvedPath}`);

    switch (config.action) {
      case 'create': {
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const fileContent = config.content
          ? VariableResolver.resolve(config.content, parameters, variables)
          : '';
        fs.writeFileSync(resolvedPath, fileContent, 'utf-8');
        onLog(`[File Action] File created at ${resolvedPath}`);
        break;
      }
      case 'open': {
        const uri = vscode.Uri.file(resolvedPath);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
        break;
      }
      case 'reveal': {
        const uri = vscode.Uri.file(resolvedPath);
        await vscode.commands.executeCommand('revealInExplorer', uri);
        break;
      }
      case 'save': {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
          await activeEditor.document.save();
        } else {
          await vscode.workspace.saveAll();
        }
        break;
      }
      default:
        throw new Error(`Unsupported file action: ${config.action}`);
    }
  }
}
