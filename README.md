# @peassoft/app-shutdown

This module provides a class that helps organize an application gracefull shutdown process in a sequence meaningful for that application.

## Installation

```shell
$ npm i @peassoft/app-shutdown
```

## Usage Example

```ts
import { AppShutdown, type WithShutdown } from '@peassoft/app-shutdown';

const httpServer: WithShutdown = createHttpServerWithShutdown(/* ... */);
const dbConnection = createDbConnection(/* ... */);
const messageBrokerConnection = createMessageBrokerConnection(/* ... */);

const appShutdown = new AppShutdown(
  [
    // First, we'll gracefully stop our HTTP server and terminate all underlying connections.
    // (Note that `httpServer` object implements `WithShutdown` interface, and thus has
    // a method `shutdown`. Therefore, we pass the object directly.)
    httpServer,

    // After we're sure our HTTP server is stopped and all ongoing requests are served,
    // we can close connections to the database and the message broker in parallel.
    // (Note that in most cases we need to `bind` methods like `close` as they might use `this`
    // internally.)
    [
      dbConnection.close.bind(dbConnection),
      messageBrokerConnection.close.bind(messageBrokerConnection),
    ],
  ],
  {
    // After this timeout, the process will be terminated even if ....
    timeoutMs: 20_000,
  },
);

process.on('SIGINT', () => void appShutdown.shutdown(0));
process.on('SIGTERM', () => void appShutdown.shutdown(0));

process.on('uncaughtException', err => {
  youLlogger(err);
  void appShutdown.shutdown(1);
});
```









## API Reference

### `stringifyError(err: Error | DOMException) => string`

Stringify an Error or DOMException object.




/**
 * Register steps of the shutdown process.
 *
 * All steps will be executed serially, in order they are passed. If a step is an array,
 * its members will by executed in parallel.
 *
 * @example
 * ```ts
 * registerShutdownSteps(1, 2, 3, 4); // 1 -> 2 -> 3 -> 4 (serially)
 * registerShutdownSteps([1, 2, 3, 4]); // 1/2/3/4 (in parallel)
 * registerShutdownSteps([1, 2], 3, 4); // 1/2 -> 3 -> 4
 * registerShutdownSteps([1, 2], [3, 4]); // 1/2 -> 3/4
 * ```
 */
