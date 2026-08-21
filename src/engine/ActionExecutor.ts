import { ChildProcess } from 'child_process';
import { WorkflowNode } from '../models/Node';
import { CommandAction } from '../actions/command';
import { TerminalAction } from '../actions/terminal';
import { FileAction } from '../actions/file';
import { UrlAction } from '../actions/url';
import { TaskAction } from '../actions/task';
import { VSCodeCommandAction } from '../actions/vscodeCommand';
import { DelayAction } from '../actions/delay';
import { NotificationAction } from '../actions/notification';
import { ScriptAction } from '../actions/script';

export class ActionExecutor {
  public static async executeNode(
    node: WorkflowNode,
    parameters: Record<string, any>,
    variables: Record<string, string>,
    onLog: (line: string) => void,
    cancellationToken?: { isCancelled: boolean; onCancel?: (cb: () => void) => void },
    activeProcesses?: Set<ChildProcess>
  ): Promise<any> {
    const config = node.config || {};

    switch (node.type) {
      case 'start':
        onLog(`[Start] Workflow started at node ${node.id}`);
        return { status: 'started' };

      case 'command':
        return await CommandAction.execute(
          config as any,
          parameters,
          variables,
          onLog,
          cancellationToken,
          activeProcesses
        );

      case 'terminal':
        return await TerminalAction.execute(config as any, parameters, variables, onLog);

      case 'file':
        return await FileAction.execute(config as any, parameters, variables, onLog);

      case 'url':
        return await UrlAction.execute(config as any, parameters, variables, onLog);

      case 'task':
        return await TaskAction.execute(config as any, parameters, variables, onLog);

      case 'vscodeCommand':
        return await VSCodeCommandAction.execute(config as any, parameters, variables, onLog);

      case 'delay':
        return await DelayAction.execute(config as any, onLog, cancellationToken);

      case 'notification':
        return await NotificationAction.execute(config as any, parameters, variables, onLog);

      case 'script':
        return await ScriptAction.execute(config as any, parameters, variables, onLog);

      case 'condition':
        // Condition handling is evaluated in ConditionEngine & WorkflowRunner DAG traverser
        onLog(`[Condition] Evaluated condition node ${node.id}`);
        return { condition: true };

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
}
