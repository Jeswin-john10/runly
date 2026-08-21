import * as vscode from 'vscode';
import { VariableResolver } from '../engine/VariableResolver';

export class TaskAction {
  public static async execute(
    config: { taskName: string },
    parameters: Record<string, any>,
    variables: Record<string, string>,
    onLog: (line: string) => void
  ): Promise<void> {
    const rawTaskName = config.taskName || '';
    const resolvedTaskName = VariableResolver.resolve(rawTaskName, parameters, variables);

    if (!resolvedTaskName) {
      throw new Error('[Task Action] Task name is required.');
    }

    onLog(`[Task Action] Fetching VS Code tasks matching: ${resolvedTaskName}`);
    const tasks = await vscode.tasks.fetchTasks();
    const matchedTask = tasks.find(
      (t) => t.name.toLowerCase() === resolvedTaskName.toLowerCase() ||
             `${t.source}: ${t.name}`.toLowerCase() === resolvedTaskName.toLowerCase()
    );

    if (!matchedTask) {
      throw new Error(`VS Code task "${resolvedTaskName}" not found. Available tasks: ${tasks.map(t => t.name).join(', ')}`);
    }

    onLog(`[Task Action] Executing VS Code task: ${matchedTask.name}`);
    await vscode.tasks.executeTask(matchedTask);
  }
}
