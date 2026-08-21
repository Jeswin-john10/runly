export class DelayAction {
  public static async execute(
    config: { durationMs: number },
    onLog: (line: string) => void,
    cancellationToken?: { isCancelled: boolean }
  ): Promise<void> {
    const duration = config.durationMs || 1000;
    onLog(`[Delay Action] Pausing for ${duration}ms...`);

    return new Promise((resolve, reject) => {
      const stepCheck = 100;
      let elapsed = 0;

      const timer = setInterval(() => {
        if (cancellationToken?.isCancelled) {
          clearInterval(timer);
          return reject(new Error('Delay cancelled by user.'));
        }

        elapsed += stepCheck;
        if (elapsed >= duration) {
          clearInterval(timer);
          resolve();
        }
      }, stepCheck);
    });
  }
}
