import { test, expect, vi } from 'vitest';

import { AppShutdown } from './app-shutdown.js';

function createShutdownFn(
  delay: number,
  acc: string[],
  message: string,
  shouldReject = false,
): () => Promise<void> {
  return () => new Promise((resolve, reject) => {
    setTimeout(
      () => {
        acc.push(message);
        if (shouldReject) {
          reject(new Error());
        } else {
          resolve();
        }
      },
      delay,
    );
  });
}

test('normal scenario', async() => {
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error();
  });

  const acc: string[] = [];

  const fn1 = createShutdownFn(100, acc, '1');
  const fn2 = createShutdownFn(10, acc, '2');
  const fn3 = createShutdownFn(10, acc, '3', true);
  const fn4 = createShutdownFn(100, acc, '4');
  const obj1 = { shutdown: createShutdownFn(100, acc, '5') };
  const obj2 = { shutdown: createShutdownFn(10, acc, '6') };
  const obj3 = { shutdown: createShutdownFn(10, acc, '7', true) };
  const obj4 = { shutdown: createShutdownFn(100, acc, '8') };

  const appShutdown = new AppShutdown([
    fn1,
    [fn2, fn3],
    fn4,
    obj1,
    [obj2, obj3],
    obj4,
  ]);

  await expect(async() => {
    await appShutdown.shutdown();
  }).rejects.toThrow();

  expect(acc[0]).toBe('1');
  expect(acc[3]).toBe('4');
  expect(acc[4]).toBe('5');
  expect(acc[7]).toBe('8');

  expect(exitSpy).toHaveBeenCalledWith(0);

  exitSpy.mockRestore();
});

test('exit code', async() => {
  const exitCodeStub = 1;

  const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error();
  });

  const acc: string[] = [];

  const fn1 = createShutdownFn(100, acc, '1');

  const appShutdown = new AppShutdown([fn1]);

  await expect(async() => {
    await appShutdown.shutdown(exitCodeStub);
  }).rejects.toThrow();

  expect(acc[0]).toBe('1');

  expect(exitSpy).toHaveBeenCalledWith(exitCodeStub);

  exitSpy.mockRestore();
});

// I couldn't figure out how to test the case when the overall timer fires.
// (1) The mocked implementation of `process.exit()` is fired in a timer and cannot be
//     caught by Vitest, and
// (2) The `finally` block is executed anyway.
//
// See a manual test in the `test` folder.
// test('timeout', async() => {
//   const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
//     throw new Error();
//   });

// const timeoutStub = 100;

// const acc: string[] = [];

// const fn1 = createShutdownFn(timeoutStub + 1000, acc, '1');

// const appShutdown = new AppShutdown([fn1], { timeoutMs: timeoutStub });

//   await expect(async() => {
//     await appShutdown.shutdown();
//   }).rejects.toThrow();

//   expect(acc.length).toBe(0);

//   expect(exitSpy).toHaveBeenCalled();

//   exitSpy.mockRestore();
// });
