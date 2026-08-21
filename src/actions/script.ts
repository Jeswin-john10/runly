import { VariableResolver } from '../engine/VariableResolver';

export class ScriptAction {
  public static async execute(
    config: { code: string; timeoutMs?: number },
    parameters: Record<string, any>,
    variables: Record<string, string>,
    onLog: (line: string) => void
  ): Promise<any> {
    const rawCode = config.code || '';
    const resolvedCode = VariableResolver.resolve(rawCode, parameters, variables);

    onLog('[Script Action] Executing custom JavaScript script...');

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction('parameters', 'variables', 'onLog', resolvedCode);
      const result = await fn(parameters, variables, onLog);
      onLog('[Script Action] Script completed successfully.');
      return result;
    } catch (err: any) {
      onLog(`[Script Action Error] ${err.message}`);
      throw err;
    }
  }
}
