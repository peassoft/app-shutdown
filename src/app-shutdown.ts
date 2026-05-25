/**
 * A function that asyncrously executes shutdown/release of a particular application resource.
 *
 * @public
 */
export type ShutdownFn = () => Promise<unknown>;

/**
 * An object with a `shutdown` method which executes shutdown/release of a particular
 * application resource.
 *
 * @public
 */
export interface WithShutdown {
  shutdown(): Promise<unknown>;
}

/**
 * A step of the graceful shutdown flow.
 *
 * If a step is an array, all functions in the array are executed in parallel, and promises
 * returned by those functions are awaited before proceeding to the next step.
 *
 * @public
 */
export type ShutdownStep = ShutdownFn | ShutdownFn[] | WithShutdown | WithShutdown[];

/**
 * `AppShutdown` class constructor options.
 *
 * @public
 */
export type AppShutdownOptions = {
  /**
   * Timeout in milliseconds after which the process is exited without waiting remaining
   * shutdown steps to complete. Optional. Defaults to `15_000`.
   */
  timeoutMs?: number;
};

/**
 * Class providing facility to execute an application gracefull shutdown in an order
 * meaningful for that application.
 *
 * @public
 */
export class AppShutdown {
  #steps: ShutdownStep[];
  #options: Required<AppShutdownOptions>;

  #isTerminating = false;

  constructor(steps: ShutdownStep[], options: AppShutdownOptions = {}) {
    this.#steps = steps;

    const {
      timeoutMs = 15_000,
    } = options;

    this.#options = {
      timeoutMs,
    };
  }

  /**
   * Perform application gracefull shutdown.
   *
   * Terminates the process.
   *
   * @param exitCode - Exit code to terminate the process with. Optional. Defaults to `0`.
   *
   * @public
   */
  async shutdown(exitCode: number = 0): Promise<void> {
    if (this.#isTerminating) return;

    this.#isTerminating = true;

    const timer = setTimeout(
      () => process.exit(exitCode),
      this.#options.timeoutMs,
    );

    for (const step of this.#steps) {
      if (Array.isArray(step)) {
        await Promise.allSettled(step.map(s => this.#exec(s)));
      } else {
        try {
          await this.#exec(step);
        } catch {
          // Ignore any errors
        }
      }
    }

    clearTimeout(timer);
    process.exit(exitCode);
  }

  #exec(item: ShutdownFn | WithShutdown): Promise<unknown> {
    return typeof item === 'function' ? item() : item.shutdown();
  }
}
