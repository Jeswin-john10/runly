import * as fs from 'fs';
import * as path from 'path';
import { NodeExecutionState } from '../models/Execution';
import { VariableResolver } from './VariableResolver';

export class ConditionEngine {
  public static evaluate(
    conditionType: string,
    targetValue: string | undefined,
    previousState?: NodeExecutionState,
    parameters: Record<string, any> = {},
    variables: Record<string, string> = {}
  ): boolean {
    const resolvedValue = targetValue
      ? VariableResolver.resolve(targetValue, parameters, variables)
      : '';

    switch (conditionType) {
      case 'previousSuccess':
        return previousState ? previousState.status === 'SUCCESS' : true;

      case 'previousFailed':
        return previousState ? previousState.status === 'FAILED' : false;

      case 'exitCode':
        if (!previousState || previousState.exitCode === undefined) {
          return false;
        }
        const expectedCode = parseInt(resolvedValue, 10);
        return isNaN(expectedCode)
          ? previousState.exitCode === 0
          : previousState.exitCode === expectedCode;

      case 'fileExists':
        if (!resolvedValue) return false;
        try {
          const stat = fs.statSync(resolvedValue);
          return stat.isFile();
        } catch {
          return false;
        }

      case 'folderExists':
        if (!resolvedValue) return false;
        try {
          const stat = fs.statSync(resolvedValue);
          return stat.isDirectory();
        } catch {
          return false;
        }

      case 'envExists':
        if (!resolvedValue) return false;
        return process.env[resolvedValue] !== undefined;

      case 'os':
      case 'platform':
        if (!resolvedValue) return false;
        return (
          process.platform.toLowerCase() === resolvedValue.toLowerCase() ||
          (resolvedValue.toLowerCase() === 'windows' && process.platform === 'win32') ||
          (resolvedValue.toLowerCase() === 'mac' && process.platform === 'darwin')
        );

      default:
        return true;
    }
  }
}
