/**
 * This is a manual test for the case when the overall timeout fires.
 *
 * I couldn't figure out how to test the case when the overall timer fires.
 * (1) The mocked implementation of `process.exit()` is fired in a timer and cannot be
 *     caught by Vitest, and
 * (2) The `finally` block is executed anyway.
 *
 * To run this test:
 *
 * ```shell
 * $ npx tsx ./test/overall-timeout.ts
 * ```
 *
 * You should NOT see any messages in the terminal.
 */

import { AppShutdown } from '../src/index.js';

const timeoutStub = 2000;

const fn = () => new Promise<void>(resolve => {
  setTimeout(
    () => {
      // You should not see this message in the terminal.
      console.log('Message from fn');
      resolve();
    },
    timeoutStub + 1000,
  );
});

const appShutdown = new AppShutdown([fn], { timeoutMs: timeoutStub });

void appShutdown.shutdown();
